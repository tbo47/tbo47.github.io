const fs = require('fs')
const osmutils = require('./utils.js')
const openstreetmapGetPOIs = osmutils.openstreetmapGetPOIs

const FILE_JSON = 'monoprix.json'
const range = 0.001

const fetchInfo = async () => {
    const output = []
    for (let i = 1; i < 3; i++) {
        const url = `https://api.woosmap.com/stores/${i}?key=woos-ef21433b-45e1-3752-851f-6653279c035a`
        console.log(url)
        try {
            const response = await fetch(url, { headers: { Referer: 'https://www.monoprix.fr/' } })
            const j = await response.json()
            console.log(j)
            output.push(j)
        } catch (e) {
            console.log(e)
        }
    }
    return output
}

const parseInfo = async (shops) => {
    for (const shop of shops) {
        const [lon, lat] = shop.geometry.coordinates
        shop.osm_area = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=19/${lat}/${lon}`
        const { phone, website } = shop.properties.contact
        try {
            const bbox = [lat - range, lon - range, lat + range, lon + range].join(',')
            const osmShops = await openstreetmapGetPOIs(bbox)
            shop.osm = osmShops.find((poi) => poi.brand.toLowerCase().includes('monop'))
        } catch (e) {
            console.log(e)
        }
    }
    return shops
}

const main = async () => {
    const raw = await fetchInfo()
    const shops = await parseInfo(raw)
    fs.writeFileSync(FILE_JSON, JSON.stringify(shops, null, 4))
    console.log(shops.length)
}

main()
