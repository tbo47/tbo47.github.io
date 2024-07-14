const fs = require('fs')

const FILE_JSON = 'monoprix.json'
const range = 0.001

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
            const osmShops = await openstreetmapGetPOIs(bbox, [['shop', 'supermarket']])
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
