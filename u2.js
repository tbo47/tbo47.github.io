const fs = require('fs')

const fetchData = async () => {
    const res = await fetch('https://tbo47.github.io/u.json')
    const shops = await res.json()
    const output = []
    console.log(shops)
    output.push(`<h2>Missing OSM website</h2>`)
    shops.map((shop) => {
        const { website, lon, lat, osm, osm_area } = shop
        if (osm && !osm.website) {
            output.push(`<a href="${osm.osm_url_edit}" target="osmedit">${osm.osm_url_edit}</a><br>${website} <br><br>`)
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
