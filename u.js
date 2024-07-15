const fs = require('fs')
const osmutils = require('./utils.js')
const openstreetmapGetPOIs = osmutils.openstreetmapGetPOIs

// https://magasins.naturalia.fr/naturalia/fr
// https://www.auchan.fr/nos-magasins
// https://www.carrefour.fr/magasin/market-ernee

const BASE = `https://www.magasins-u.com/`
const FILE_JSON = 'u.json'
const range = 0.005

const fetchInfo = async () => {
    const output = []
    const url = BASE + `annuaire-magasin.m21635`
    const response = await fetch(url, { headers: { Referer: BASE } })
    const content = await response.text()
    const shopLinks = content
        .split('\n')
        .filter((line) => line.includes('u-list-magasin__link'))
        .map((l) => l.split('"')[3])

    const promises = shopLinks.map(async (website) => {
        try {
            const r = await fetch(website, { headers: { Referer: BASE } })
            const c = await r.text()
            const rawCoord = c.split('\n').find((line) => line.includes('google.com/maps'))
            const [lon, lat] = rawCoord
                .split('"')[1]
                .split('=')[2]
                .split('%2C')
                .map((co) => parseFloat(co))
            const bbox = [lon - range, lat - range, lon + range, lat + range].join(',')
            const osmShops = await openstreetmapGetPOIs(bbox)
            const osm = osmShops.find((poi) => poi?.brand?.toLowerCase().includes('u'))
            const osm_area = `https://www.openstreetmap.org/?mlat=${lon}&mlon=${lat}#map=19/${lon}/${lat}`
            const shop = { website, lon, lat, osm, osm_area }
            output.push(shop)
        } catch (e) {
            console.log(e)
        }
    })
    await Promise.all(promises)
    fs.writeFileSync(FILE_JSON, JSON.stringify(output, null, 4))
    console.log('done: ', output.length)
}

fetchInfo()
