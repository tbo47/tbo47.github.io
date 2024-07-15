const fs = require('fs')

const fetchData = async () => {
    const shops = JSON.parse(fs.readFileSync('u.json'))
    const output = []
    console.log(shops.length)
    output.push(`<h2>Missing OSM website</h2>`)
    shops.map((shop) => {
        const { website, lon, lat, osm, osm_area } = shop
        const osm_name = osm?.name?.toLowerCase()
        if (!osm_name) return
        const isU = ['super u', 'hyper u', 'u express', 'u drive', 'utile', 'station u', 'marché u'].includes(osm_name)
        if (osm && !osm.website && !isU) console.log(osm_name)
        if (osm && !osm.website && isU) {
            output.push(
                `<a href="${osm.osm_url_edit}" target="osmedit">${osm.osm_url_edit}</a><br>${osm.name}<br>${website} <br><br>`
            )
        }
    })
    output.push(`<h2>Missing OSM poi</h2>`)
    shops.map((shop) => {
        const { website, lon, lat, osm, osm_area } = shop
        if (!osm) {
            output.push(`<a href="${osm_area}" target="osmarea">${osm_area}</a><br>${website}<br><br>`)
        }
    })
    output.push(`<h2>Questionning the website</h2>`)
    shops.map((shop) => {
        const { website, lon, lat, osm, osm_area } = shop
        if (osm?.website && !osm.website.startsWith(website)) {
            output.push(
                `<a href="${osm.osm_url_edit}" target="osmedit">${osm.osm_url_edit}</a><br>${osm.website}<br>${website}<br><br>`
            )
        }
    })

    fs.writeFileSync(`u.html`, `<html><body>` + output.join('') + `</body></html>`)
    return output
}

fetchData()
