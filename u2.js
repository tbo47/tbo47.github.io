
// https://jsfiddle.net/tbo47/dt4hLy3s/

const myDiv = document.getElementById('my-div')

const fetchData = async () => {
    const res = await fetch('https://tbo47.github.io/u.json')
    const shops = await res.json()
    shops.map(async (shop) => {
        const { website, lon, lat, osm, osm_area } = shop
        // if (osmShop && !osmShop.website.startsWith(shopLink)) {
        if (osm && !osm.website) {
            myDiv.innerHTML += `<a href="${website}" target="_blank">${website}</a> | `
            myDiv.innerHTML += `<a href="${osm.osm_url}" target="_blank">${osm.brand}</a><br>`
        }
    })
}

fetchData()
