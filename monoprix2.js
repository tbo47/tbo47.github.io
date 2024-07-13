import { openstreetmapGetPOIs } from 'https://tbo47.github.io/ez-opendata.js'

// https://jsfiddle.net/tbo47/c9sn3mav/

const myDiv = document.getElementById('my-div')
const range = 0.0005

const fetchData = async () => {
    const res = await fetch('https://tbo47.github.io/monoprix.json')
    const shops = await res.json()
    shops.map(async (shop, index) => {
        const [lon, lat] = shop.geometry.coordinates
        const bbox = [lat - range, lon - range, lat + range, lon + range].join(',')
        const osmShops = await openstreetmapGetPOIs(bbox, [['shop', 'supermarket']])
        const osmShop = osmShops.find((poi) => poi.brand.toLowerCase().includes('monop'))
        const { phone, website } = shop.properties.contact
        console.log(shop.properties.name, phone, website)
        if (osmShop && osmShop.website !== website) {
            myDiv.innerHTML += `<a href="${website}" target="_blank">${shop.properties.name}</a> | ${phone} | `
            myDiv.innerHTML += `<a href="${osmShop.osm_url}" target="_blank">${osmShop.brand}</a><br>`
        }
    })
}

fetchData()
