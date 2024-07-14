// https://jsfiddle.net/tbo47/dt4hLy3s/

const myDiv = document.getElementById('my-div')

const fetchData = async () => {
    const res = await fetch('https://tbo47.github.io/u.json')
    const shops = await res.json()
    console.log(shops)
    myDiv.innerHTML += `<h2>Missing OSM website</h2>`
    shops.map((shop) => {
        const { website, lon, lat, osm, osm_area } = shop
        if (osm && !osm.website) {
            myDiv.innerHTML += `<a href="${osm.osm_url_edit}" target="_blank">shop</a> | `
            myDiv.innerHTML += `${website} <br>`
        }
    })
    myDiv.innerHTML += `<h2>Missing OSM poi</h2>`
    shops.map((shop) => {
        const { website, lon, lat, osm, osm_area } = shop
        if (!osm) {
            myDiv.innerHTML += `<a href="${osm_area}" target="_blank">area</a> | `
            myDiv.innerHTML += `${website} <br>`
        }
    })
    myDiv.innerHTML += `<h2>Questionning the website</h2>`
    shops.map((shop) => {
        const { website, lon, lat, osm, osm_area } = shop
        if (osm && !osm.website.startsWith(website)) {
            myDiv.innerHTML += `<a href="${osm.osm_url_edit}" target="_blank">shop</a> | `
            myDiv.innerHTML += `${website} <br>`
        }
    })
}

fetchData()
