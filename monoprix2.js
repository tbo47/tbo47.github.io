import { openstreetmapGetPOIs } from 'https://tbo47.github.io/ez-opendata.js'

// https://jsfiddle.net/tbo47/c9sn3mav/

const myDiv = document.getElementById('my-div')

const fetchData = async () => {
    const res = await fetch('https://tbo47.github.io/monoprix.json')
    const shops = await res.json()
    shops.map((shop) => {
        const [lon, lat] = shop.geometry.coordinates
        const { phone, website } = shop.properties.contact
        const { osm } = shop
        if (osm && osm.website !== website) {
            myDiv.innerHTML += `<a href="${website}" target="_blank">${shop.properties.name}</a> | ${phone} | `
            myDiv.innerHTML += `<a href="${osm.osm_url}" target="_blank">${osm.brand}</a><br>`
        }
    })
}

fetchData()
