// Description: A library to query open data sources (wikipedia, openstreetmap, wikimedia...).

/**
 * Get the current location of the user. Will only work on https or localhost.
 * @returns { latitude, longitude }
 */
export const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => resolve(position.coords))
        } else {
            reject('Geolocation is not supported by this browser.')
        }
    })
}

const getCurrentOsmPositionLink = async (z = 17) => {
    const { latitude, longitude } = await getCurrentPosition()
    return `https://www.openstreetmap.org/#map=${z}/${latitude}/${longitude}`
}

/**
 * Query an openstreetmap server to fetch POIs
 * 
 * @param {*} bbox the rectangle where to perform the query
 * @param {Array.<Array>} categories of pois. Like restaurant, cafe...
 * @returns Promise<Poi[]>
 */
export const getOsmPois = async (bbox, categories) => {
    const url = 'https://overpass-api.de/api/interpreter';

    let quest = '';
    categories.forEach(([key, value]) => {
        const p = `
          node["${key}"="${value}"](${bbox});
          way["${key}"="${value}"](${bbox});
          relation["${key}"="${value}"](${bbox});`;
        quest += p;
    });

    const body = `
        [out:json][timeout:25];
        (
            ${quest}
        );
        out body;
        >;
        out skel qt;`;

    const response = await fetch(url, { method: 'POST', body })
    const data = await response.json()
    return data.elements.filter(p => p.tags).map(p => {
        p = { ...p, ...p.tags } // merge the tags object into the main one
        delete p.tags
        const type = p.members ? 'relation' : p.type
        if (!p.website && p[`contact:website`]) p.website = p[`contact:website`]
        p.osm_url = `https://www.openstreetmap.org/${type}/${p.id}`
        p.osm_url_edit = `https://www.openstreetmap.org/edit?${type}=${p.id}`
        return p
    })
}

/**
 * 
 * @returns Promise<POI[]> restaurants and cafes
 */
export const getRestaurants = () => {
    return getOsmPois('37.8,-122.3,37.8,-122.2', [{ key: 'amenity', value: 'cafe' }, { key: 'amenity', value: 'restaurant' }])
}

/**
 * 
 * @param { {_northEast: { lat: number, lng: number }, _southWest: { lat: number, lng: number }} } param0 
 * @returns 
 */
export const getFoodShops = async ({ _northEast, _southWest }) => {
    const bbox = []
    bbox.push(_southWest.lat)
    bbox.push(_southWest.lng)
    bbox.push(_northEast.lat)
    bbox.push(_northEast.lng)
    let categories = [['amenity', 'cafe'], ['amenity', 'restaurant'], ['shop', 'deli'], ['amenity', 'ice_cream'], ['amenity', 'fast_food']]
    // categories = [['leisure', 'park'], ['leisure', 'swimming_pool']]
    const pois = await getOsmPois(bbox.join(','), categories)
    return pois
}

// extract diets from POIs (only makes sense for restaurants)
export const extractDiets = (pois) => {
    const dietsMap = new Map() // stores ['thai': 3] if thai restaurants have been seen 3 times
    pois.forEach(poi => {
        const diets = new Set()
        // extract poi.cuisine
        poi.cuisine?.split(`;`)?.forEach(c => diets.add(c?.trim()?.toLowerCase()))
        // extract poi.diet:thai == yes for example
        Object.keys(poi)
            .filter(key => key.startsWith(`diet`) && poi[key] === `yes`)
            .forEach(key => diets.add(key.split(`:`).at(1)))

        diets.forEach(diet => {
            if (dietsMap.has(diet)) dietsMap.set(diet, dietsMap.get(diet) + 1)
            else dietsMap.set(diet, 1)
        })
    })
    const dietsSorted = Array.from(dietsMap.entries()).sort((a, b) => b[1] - a[1])
    return dietsSorted
}

/**
 * 
 * @returns {Promise.<{map, bounds}>}
 */
export const initLeafletMap = () => {
    return new Promise((resolve, reject) => {
        const map = L.map('map').fitWorld()

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map)

        map.on('locationfound', e => {
            L.circle(e.latlng, e.accuracy / 2).addTo(map)
            resolve({ map, ...e })
        })
        map.on('locationerror', e => reject(e))
        map.locate({ setView: true, maxZoom: 16 })
    })
}

export const addPOIsToTheMap = (map, pois) => {
    const lg = L.layerGroup()
    const markers = new Map()
    pois.filter(p => p.lat && p.lon).forEach(p => {
        const extra = []
        extra.push(`<a href="${p.osm_url}" target="osm" title="Contribute on openstreetmap">osm</a>`)
        if (p.website) extra.push(`<a href="${p.website}" target="w" title="Visit the website">web</a>`)
        const addr = p[`addr:street`] ? (p[`addr:housenumber`] || ``) + ' ' + p[`addr:street`] : ``
        const name = p.name?.replaceAll(`&`, ` `)
        if (addr) {
            extra.push(`<a href="https://www.google.com/search?q=${name} ${addr}" target="g" title="Search in google">g</a>`)
            extra.push(`<a href="https://www.bing.com/search?q=${name} ${addr}" target="b" title="Search in bing">b</a>`)
        }
        const cuisine = p.cuisine ? `<div>${p.cuisine.split(';').join(', ')}</div>` : ``
        const html = `<div>${p.name}</div><div>${cuisine}</div><div>${extra.join(" | ")}`
        const marker = L.marker([p.lat, p.lon]).bindPopup(html).addTo(lg)
        markers.set(p, marker)
    })
    lg.addTo(map)
    return markers
}

/**
 * Return the wikipedia articles around a given location.
 * @returns {Promise.<Array.<title, lat, lon, url, dist, pageid>>}
 */
export const wikipediaQuery = async (lat = 37, lon = -122, language = 'en', radius = 10000, limit = 100) => {
    const b = `https://${language}.wikipedia.org/w/api.php`
    const u = `${b}?action=query&list=geosearch&gscoord=${lat}%7C${lon}&gsradius=${radius}&gslimit=${limit}&origin=*&format=json`
    const r = await fetch(u)
    const d = await r.json()
    return d.query.geosearch.map(a => {
        a.url = `https://${language}.wikipedia.org/wiki/${a.title}`
        return a
    })
}

export const wikidataQuery = async (lat = 37, lon = -122, language = 'en', radius = 10000, limit = 100) => {
    const b = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query='
    const q = 'SELECT ?q ?qLabel ?location ?image ?reason ?desc ?commonscat ?street WHERE { SERVICE wikibase:box { ?q wdt:P625 ?location . bd:serviceParam wikibase:cornerSouthWest "Point(-17.20767974853516 14.330588168640638)"^^geo:wktLiteral . bd:serviceParam wikibase:cornerNorthEast "Point(-16.78298950195313 14.626108798876851)"^^geo:wktLiteral }  OPTIONAL { ?q wdt:P18 ?image }  OPTIONAL { ?q wdt:P373 ?commonscat }  OPTIONAL { ?q wdt:P969 ?street }  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,en,de,fr,es,it,nl" . ?q schema:description ?desc . ?q rdfs:label ?qLabel } } LIMIT 3000'
    const r = await fetch(b + encodeURI(q))
    const d = await r.json()
    return d.results.bindings
}

/**
 * Add wikipedia articles to the map.
 * @param {*} map 
 * @param {Array.<title, lat, lon>} articles 
 * @returns {Map.<title, L.marker>}
 */
export const addWikipediaArticlesToTheMap = (map, articles) => {
    const lg = L.layerGroup()
    const markers = new Map()
    articles.forEach(({ url, title, lat, lon }) => {
        const html = `<div><a href="${url}" target="osm" title="Wiki">${title}</a></div>`
        const marker = L.marker([lat, lon]).bindPopup(html).addTo(lg)
        markers.set(title, marker)
    })
    lg.addTo(map)
    return markers
}
