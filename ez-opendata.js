/**
 * Description: A library to query open data sources (wikipedia, openstreetmap, wikimedia...).
 * https://github.com/tbo47/ez-opendata
 */
export const WIKI_COMMONS = 'https://commons.wikimedia.org/w/api.php';
export const USER_AGENT = 'github.com/tbo47/ez-opendata';
export const OPTIONS_WITH_USER_AGENT = { headers: { 'User-Agent': USER_AGENT } };
export const OSM_CATEGORIES = {
    sustenance: [
        ['amenity', 'bar'],
        ['amenity', 'biergarten'],
        ['amenity', 'cafe'],
        ['amenity', 'restaurant'],
        ['amenity', 'fast_food'],
        ['amenity', 'food_court'],
        ['amenity', 'ice_cream'],
    ],
    food: [
        ['amenity', 'cafe'],
        ['amenity', 'restaurant'],
        ['shop', 'deli'],
        ['amenity', 'ice_cream'],
        ['amenity', 'fast_food'],
    ],
    leisure: [
        ['leisure', 'park'],
        ['leisure', 'swimming_pool'],
    ],
};
/**
 * Query an openstreetmap server to fetch POIs
 *
 * https://wiki.openstreetmap.org/wiki/Key:amenity#Values
 *
 * @param bbox the rectangle where to perform the query
 * @param categories of pois. Like restaurant, cafe...
 */
export const openstreetmapGetPOIs = async (bbox = '37.8,-122.3,37.8,-122.2', categories = OSM_CATEGORIES.sustenance, timeout = 25_000) => {
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
    const response = await fetch(url, { method: 'POST', body, timeout });
    const data = await response.json();
    return data.elements
        .filter((p) => p.tags)
        .map((p) => {
        p = { ...p, ...p.tags }; // merge the tags object into the main one
        delete p.tags;
        const type = p.members ? 'relation' : p.type;
        if (!p.website && p[`contact:website`]) {
            p.website = p[`contact:website`];
        }
        p.osm_url = `https://www.openstreetmap.org/${type}/${p.id}`;
        p.osm_url_edit = `https://www.openstreetmap.org/edit?${type}=${p.id}`;
        return p;
    });
};
/**
 * Useful to get POIs around a given location if you are using leaflet.
 * ```
 * const { _northEast, _southWest } = map.getBounds() // leaflet map
 * openstreetmapGetPOIsBbox({ _northEast, _southWest }, OSM_CATEGORIES.food)
 * ```
 */
export const openstreetmapGetPOIsBbox = async ({ _northEast, _southWest, }, categories = OSM_CATEGORIES.food) => {
    const bbox = [];
    bbox.push(_southWest.lat);
    bbox.push(_southWest.lng);
    bbox.push(_northEast.lat);
    bbox.push(_northEast.lng);
    const pois = await openstreetmapGetPOIs(bbox.join(','), categories);
    return pois;
};
/**
 * @deprecated use openstreetmapGetPOIbbox({ _northEast, _southWest }, CATEGORIES.food)
 */
export const getFoodShops = async ({ _northEast, _southWest, }) => {
    return openstreetmapGetPOIsBbox({ _northEast, _southWest }, OSM_CATEGORIES.food);
};
/**
 * @deprecated use openstreetmapGetRestaurants instead
 */
export const extractDiets = (pois) => {
    return openstreetmapExtractDiets(pois);
};
/**
 * extract diets from POIs (only makes sense for restaurants)
 */
export const openstreetmapExtractDiets = (pois) => {
    const dietsMap = new Map(); // stores ['thai': 3] if thai restaurants have been seen 3 times
    pois.forEach((poi) => {
        const diets = new Set();
        // extract poi.cuisine
        poi.cuisine?.split(`;`)?.forEach((c) => diets.add(c?.trim()?.toLowerCase()));
        // extract poi.diet:thai == yes for example
        Object.keys(poi)
            .filter((key) => key.startsWith(`diet`) && poi[key] === `yes`)
            .forEach((key) => {
            const diet = key.split(`:`).at(1);
            if (diet)
                diets.add(diet);
        });
        diets.forEach((diet) => {
            if (dietsMap.has(diet))
                dietsMap.set(diet, dietsMap.get(diet) + 1);
            else
                dietsMap.set(diet, 1);
        });
    });
    const dietsSorted = Array.from(dietsMap.entries()).sort((a, b) => b[1] - a[1]);
    return dietsSorted;
};
/**
 * Geocode a location using openstreetmap.
 * https://nominatim.org/release-docs/develop/api/Search/
 */
export const openstreetmapGeocoding = async (q, limit = 10) => {
    const url = `https://nominatim.openstreetmap.org/search?addressdetails=1&q=${q}&format=jsonv2&limit=${limit}`;
    const raw = await fetch(url, OPTIONS_WITH_USER_AGENT);
    const json = await raw.json();
    return json;
};
/**
 * Return the wikipedia articles around a given location.
 */
export const wikipediaQuery = async (lat = 37, lon = -122, language = 'en', radius = 10_000, limit = 100) => {
    const b = `https://${language}.wikipedia.org/w/api.php`;
    const u = `${b}?action=query&list=geosearch&gscoord=${lat}%7C${lon}&gsradius=${radius}&gslimit=${limit}&origin=*&format=json`;
    const r = await fetch(u, OPTIONS_WITH_USER_AGENT);
    const d = await r.json();
    if (d.error) {
        throw d.error;
    }
    return d.query.geosearch.map((a) => {
        a.url = `https://${language}.wikipedia.org/wiki/${a.title}`;
        return a;
    });
};
export const wikidataQuery = async (northEast, southWest, limit = 3000) => {
    const b = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=';
    const q = `SELECT ?q ?qLabel ?location ?image ?reason ?desc ?commonscat WHERE {
                  SERVICE wikibase:box {
                    ?q wdt:P625 ?location.
                    bd:serviceParam wikibase:cornerSouthWest "Point(${southWest.lng} ${southWest.lat})"^^geo:wktLiteral;
                      wikibase:cornerNorthEast "Point(${northEast.lng} ${northEast.lat})"^^geo:wktLiteral.
                  }
                  OPTIONAL { ?q wdt:P18 ?image. } 
                  OPTIONAL { ?q wdt:P373 ?commonscat. }
                  SERVICE wikibase:label {
                    bd:serviceParam wikibase:language "[AUTO_LANGUAGE]".
                    ?q schema:description ?desc;
                      rdfs:label ?qLabel.
                  }
            }
            LIMIT ${limit}`;
    // console.log('https://query.wikidata.org/#' + encodeURI(q))
    const u = b + encodeURI(q);
    try {
        const r = await fetch(u, OPTIONS_WITH_USER_AGENT);
        const d = await r.json();
        const items = d.results.bindings || [];
        items.forEach((i) => {
            i.id = i.qLabel.value;
            const [lng, lat] = i.location?.value
                ?.slice(6, -1)
                .split(' ')
                .map((s) => parseFloat(s));
            i.lat = lat;
            i.lng = lng;
        });
        return items;
    }
    catch (error) {
        const r = await fetch(u, OPTIONS_WITH_USER_AGENT);
        const err = await r.text();
        throw new Error(err);
    }
};
export const wikimediaQueryBound = async (bounds, limit = 5000) => {
    return await wikimediaQuery(bounds.getNorthEast(), bounds.getSouthWest(), limit);
};
export const wikimediaQuery = async (northEast, southWest, limit = 100) => {
    const q = `${WIKI_COMMONS}?action=query&list=geosearch&gsbbox=${northEast.lat}%7C${southWest.lng}%7C${southWest.lat}%7C${northEast.lng}&gsnamespace=6&gslimit=${limit}&format=json&origin=*`;
    const res = await fetch(q, OPTIONS_WITH_USER_AGENT);
    const d = await res.json();
    if (d.error) {
        throw d.error;
    }
    else {
        return (d.query.geosearch || []);
    }
};
/*
 * https://www.mediawiki.org/wiki/API:Imageinfo
 *
 * Consider using `wikimediaGetThumb` instead
 */
export const wikimediaGetThumbs = async (pageids, orientation, value = 600) => {
    value = Math.floor(value);
    const pageidsStr = pageids.join('|');
    const q = `${WIKI_COMMONS}?action=query&pageids=${pageidsStr}&prop=imageinfo&iiprop=extmetadata|url&iiurl${orientation}=${value}&format=json&origin=*`;
    const res = await fetch(q, OPTIONS_WITH_USER_AGENT);
    const d = await res.json();
    return d.query.pages;
};
/**
 * @deprecated use wikimediaGetThumbs instead
 */
export const wikimediaInfoMultiplePages = wikimediaGetThumbs;
/**
 * Get a thumbnail from wikimedia commons which fits into the frame defines by the height and the width.
 * The thumbnail is going to fit into the frame, so it might be smaller than the frame.
 *
 * In this example, the thumbnail will fit into the div:
 * ```
 * const { height, width } = document.getElementById('my-div').getBoundingClientRect()
 * const { thumburl } = await wikimediaGetThumb(pic.pageid, height, width)
 * ```
 *
 * In this example, the thumbnail will fit the cellphone width but never exeed 2/3 of the height:
 * ```
 * const { height, width } = document.body.getBoundingClientRect()
 * const { thumburl } = await wikimediaGetThumb(pic.pageid, height * 0.66, width)
 * ```
 *
 * @param pageid wikimedia commons pageid
 * @param height max height of the thumbnail
 * @param width max width of the thumbnail
 * @returns
 */
export const wikimediaGetThumb = async (pageid, height, width) => {
    const format = (thumbRawArray) => {
        const { title, imageinfo } = thumbRawArray[pageid];
        const info = imageinfo[0];
        const result = { pageid, title, ...info };
        Object.keys(info.extmetadata).forEach((key) => {
            result[key.toLowerCase()] = info.extmetadata[key].value;
        });
        result.artistPage = result.artist;
        result.artist = result.artist?.replace(/<a.*?>(.*?)<\/a>/, '$1'); // remove <a ... >Riamorei</a> -> Riamorei
        result.artistUrl = wikimediaGetAuthorLink(result.artist);
        result.atomicUrl = `https://commons.wikimedia.org/w/index.php?curid=${pageid}`;
        result.gpslongitude = parseFloat(result.gpslongitude);
        result.gpslatitude = parseFloat(result.gpslatitude);
        return result;
    };
    const thumbWidth = format(await wikimediaGetThumbs([pageid], 'width', width));
    if (thumbWidth.thumbheight > height) {
        const thumbHeight = format(await wikimediaGetThumbs([pageid], 'height', height));
        return thumbHeight;
    }
    return thumbWidth;
};
export const wikimediaGetAuthor = async (title, pageid) => {
    const u = `${WIKI_COMMONS}?action=query&titles=${title}&prop=imageinfo&format=json&origin=*`;
    const res = await fetch(u, OPTIONS_WITH_USER_AGENT);
    const d = await res.json();
    return d.query.pages[pageid].imageinfo[0].user;
};
export const wikimediaGetAuthorLink = (name, limit = 40) => {
    return `https://commons.wikimedia.org/wiki/Special:ListFiles?limit=${limit}&user=${name}`;
};
/**
 * @deprecated use wikimediaGetThumb instead
 */
export const wikimediaInfo = async (pageid, thumbWidth = 600) => {
    const infos = await wikimediaGetThumbs([pageid], 'width', thumbWidth);
    const info = infos[pageid].imageinfo[0];
    const name = info.extmetadata.ObjectName.value;
    const date = info.extmetadata.DateTime.value;
    const categories = info.extmetadata.Categories.value;
    const description = info.extmetadata.ImageDescription.value;
    const artistHtml = info.extmetadata.Artist.value;
    const title = infos[pageid].title;
    return { name, date, categories, description, artistHtml, title, ...info };
};
/*
 * Return the browser language or 'en' if not found.
 * WARNING: This will not work in nodejs, only for the browser.
 */
export const getLang = () => {
    return window?.navigator?.language?.split('-')?.at(0) || 'en';
};
/**
 * Get the picture of the day from wikimedia commons.
 *
 * Leave lang empty to use the browser language. Set it to 'en' for example to force english.
 * You will have to set the lang if you use nodejs.
 */
export const wikimediaPicOfTheDay = async (lang = '') => {
    if (!lang) {
        lang = getLang();
    }
    const url = `${WIKI_COMMONS}?action=featuredfeed&feed=potd&feedformat=atom&language=${lang}&origin=*`;
    const match1 = 'href="https://commons.wikimedia.org/wiki/Special';
    // const match2 = 'typeof="mw:File"'
    const raw = await fetch(url, OPTIONS_WITH_USER_AGENT);
    const text = await raw.text();
    // const xml = new window.DOMParser().parseFromString(text, 'text/xml'); // doesn't work for nodejs
    const urls = text
        .split(/\n/)
        .filter((l) => l.includes(match1))
        .map((l) => l.split(/"/)[5]);
    return urls;
    /*
    const lastUrl = urls.slice(-1)[0]
    console.log(lastUrl)
    const raw2 = await fetch(lastUrl, { mode: 'no-cors', redirect: 'follow', headers: { 'Content-Type': 'text/html' }, referrer: 'no-referrer' })
    const text2 = await raw2.text()
    const picUrl = text2.split(/\n/).filter(l => l.includes(match2)).map(l => l.split(/"/)[7])
    const picName = picUrl[0].slice(11)
    return picName;
    */
};
