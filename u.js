const fs = require('fs')

const BASE = `https://www.magasins-u.com/`
const FILE_JSON = 'u.json'
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
    const url = BASE + `annuaire-magasin.m21635`
    const response = await fetch(url, { headers: { Referer: BASE } })
    const content = await response.text()
    const shopLinks = content
        .split('\n')
        .filter((line) => line.includes('u-list-magasin__link'))
        .map((l) => l.split('"')[3])

    const promises = shopLinks.slice(10).map(async (website) => {
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
            const osmShops = await openstreetmapGetPOIs(bbox, [['shop', 'supermarket']])
            const osm = osmShops.find((poi) => poi.brand.toLowerCase().includes('u'))
            const osm_area =  `https://www.openstreetmap.org/?mlat=${lon}&mlon=${lat}#map=19/${lon}/${lat}`
            const shop = { website, lon, lat, osm, osm_area }
            console.log(shop)
            output.push(shop)
        } catch (e) {}
    })
    await Promise.all(promises)
    fs.writeFileSync(FILE_JSON, JSON.stringify(output))
}

fetchInfo()
