const fs = require('fs')
const osmutils = require('./utils.js')
const openstreetmapGetPOIs = osmutils.openstreetmapGetPOIs

// https://magasins.naturalia.fr/naturalia/fr
// https://www.auchan.fr/nos-magasins
// https://www.carrefour.fr/magasin/market-ernee

//https://www.carrefour.fr/magasin

const BASE = `https://www.carrefour.fr/`
const FILE_JSON = 'carrefour.json'
const range = 0.005

const fetchInfo = async () => {
    const r = await fetch(
        'https://api.woosmap.com/stores/search?key=woos-26fe76aa-ff24-3255-b25b-e1bde7b7a683&lat=48.54&lng=2.05&max_distance=1000000&stores_by_page=300&limit=300&page=1&query=(user.banner%3A%22CARREFOUR%22%20OR%20(user.banner%3A%22CARREFOUR%20MARKET%22%20OR%20user.banner%3A%22MARKET%22)%20OR%20user.banner%3A%22CARREFOUR%20CONTACT%22%20OR%20user.banner%3A%22CARREFOUR%20CITY%22%20OR%20user.banner%3A%22CARREFOUR%20EXPRESS%22%20OR%20user.banner%3A%22CARREFOUR%20MONTAGNE%22%20OR%20user.banner%3A%22BON%20APP%22)',
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
            const osmShops = await openstreetmapGetPOIs(bbox)
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
