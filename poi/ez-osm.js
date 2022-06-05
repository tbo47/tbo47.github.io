
const zoom = 16 // the default map zoom

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

const getCurrentPositionLink = async () => {
    const position = await getCurrentPosition()
    const url = `https://www.openstreetmap.org/#map=17/${position.latitude}/${position.longitude}`
    return url
}

/**
 * Query an openstreetmap server to fetch POIs
 * 
 * @param {*} bbox the rectangle where to perform the query
 * @param {Array.<Array>} categories of pois. Like restaurant, cafe...
 * @returns Promise<Poi[]>
 */
export const getPois = (bbox, categories) => {
    const url = 'https://overpass-api.de/api/interpreter';

    let quest = '';
    categories.forEach(([key, value]) => {
        const p = `
          node["${key}"="${value}"](${bbox});
          way["${key}"="${value}"](${bbox});
          relation["${key}"="${value}"](${bbox});`;
        quest += p;
    });

    const q = `
        [out:json][timeout:25];
        (
            ${quest}
        );
        out body;
        >;
        out skel qt;`;

    const xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(q)
    return new Promise((resolve, reject) => {
        xhr.onload = function () {
            try {
                const data = JSON.parse(this.responseText)
                const pois = data.elements.filter(p => p.tags).map(p => {
                    p = { ...p, ...p.tags } // merge the tags object into the main one
                    delete p.tags
                    const type = p.members ? 'relation' : p.type
                    if (!p.website && p[`contact:website`]) p.website = p[`contact:website`]
                    p.osm_url = `https://www.openstreetmap.org/${type}/${p.id}`
                    p.osm_url_edit = `https://www.openstreetmap.org/edit?${type}=${p.id}`
                    return p
                })
                resolve(pois)
            } catch (error) {
                reject(error)
            }
        };
    })
}

/**
 * 
 * @returns Promise<POI[]> restaurants and cafes
 */
export const getRestaurants = () => {
    return getPois('37.8,-122.3,37.8,-122.2', [{ key: 'amenity', value: 'cafe' }, { key: 'amenity', value: 'restaurant' }])
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
    const pois = await getPois(bbox.join(','), categories)
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
        map.locate({ setView: true, maxZoom: 16 });
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
