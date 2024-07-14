const fs = require('fs')

// https://magasins.naturalia.fr/naturalia/fr
// https://www.auchan.fr/nos-magasins
// https://www.carrefour.fr/magasin/market-ernee

//https://www.carrefour.fr/magasin

const BASE = `https://www.carrefour.fr/`
const FILE_JSON = 'carrefour.json'
const range = 0.005

const openstreetmapGetPOIs = async (
    bbox = '37.8,-122.3,37.8,-122.2',
    categories = [['shop', 'supermarket']],
    timeout = 25_000
) => {
    const url = 'https://overpass-api.de/api/interpreter'
    let quest = ''
    categories.forEach(([key, value]) => {
        const p = `
          node["${key}"="${value}"](${bbox});
          way["${key}"="${value}"](${bbox});
          relation["${key}"="${value}"](${bbox});`
        quest += p
    })
    const body = `
        [out:json][timeout:25];
        (
            ${quest}
        );
        out body;
        >;
        out skel qt;`
    const response = await fetch(url, { method: 'POST', body, timeout })
    const data = await response.json()
    return data.elements
        .filter((p) => p.tags)
        .map((p) => {
            p = { ...p, ...p.tags } // merge the tags object into the main one
            delete p.tags
            const type = p.members ? 'relation' : p.type
            if (!p.website && p[`contact:website`]) {
                p.website = p[`contact:website`]
            }
            p.osm_url = `https://www.openstreetmap.org/${type}/${p.id}`
            p.osm_url_edit = `https://www.openstreetmap.org/edit?${type}=${p.id}`
            return p
        })
}

const fetchInfo = async () => {
    const r = await fetch(
        'https://api.woosmap.com/stores/search?key=woos-26fe76aa-ff24-3255-b25b-e1bde7b7a683&lat=48.54&lng=2.05&max_distance=100000&stores_by_page=300&limit=300&page=1&query=(user.banner%3A%22CARREFOUR%22%20OR%20(user.banner%3A%22CARREFOUR%20MARKET%22%20OR%20user.banner%3A%22MARKET%22)%20OR%20user.banner%3A%22CARREFOUR%20CONTACT%22%20OR%20user.banner%3A%22CARREFOUR%20CITY%22%20OR%20user.banner%3A%22CARREFOUR%20EXPRESS%22%20OR%20user.banner%3A%22CARREFOUR%20MONTAGNE%22%20OR%20user.banner%3A%22BON%20APP%22)',
        {
            headers: {
                accept: '*/*',
                'accept-language': 'en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7',
                priority: 'u=1, i',
                'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                Referer: 'https://www.carrefour.fr/',
                'Referrer-Policy': 'strict-origin-when-cross-origin',
            },
            body: null,
            method: 'GET',
        }
    )
    // const response = await fetch(url, { headers: { Referer: BASE } })
    const content = await r.json()
    console.log(content.features.length)

    const output = []
    const promises = content.features.map(async (f) => {
        try {
            const [lat, lon] = f.geometry.coordinates
            const bbox = [lon - range, lat - range, lon + range, lat + range].join(',')
            const osmShops = await openstreetmapGetPOIs(bbox, [
                ['shop', 'supermarket'],
                ['shop', 'convenience'],
            ])
            const osm = osmShops.find((poi) => poi.brand && poi.brand.toLowerCase().includes('carrefour'))
            const osm_area = `https://www.openstreetmap.org/?mlat=${lon}&mlon=${lat}#map=19/${lon}/${lat}`
            const shop = { f, lon, lat, osm, osm_area }
            output.push(shop)
        } catch (e) {
            console.log(e)
        }
    })
    await Promise.all(promises)
    fs.writeFileSync(FILE_JSON, JSON.stringify(output, null, 4))
}

fetchInfo()
