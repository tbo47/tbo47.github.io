// https://jsfiddle.net/tbo47/dt4hLy3s/

const myDiv = document.getElementById('my-div')

const fetchData = async () => {
    const res = await fetch('https://tbo47.github.io/u.json')
    const shops = await res.json()
    shops.map((shop) => {
        const { website, lon, lat, osm, osm_area } = shop
        // if (osmShop && !osmShop.website.startsWith(shopLink)) {
        // if (!osm) {
        if (osm && !osm.website) {
            console.log(osm)
            myDiv.innerHTML += `<a href="${osm.osm_url_edit}" target="_blank">shop</a> | `
            myDiv.innerHTML += `${website} <br><br>`
        }
    })
}

fetchData()
