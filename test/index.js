
class PoiComponent {

    constructor() {
    }

    /**
     * Get the current location of the user. Will only work on https.
     * @returns { latitude, longitude }
     */
    #getLocation() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => resolve(position.coords))
            } else {
                reject('Geolocation is not supported by this browser.')
            }
        })
    }

    async getLocationLink() {
        const position = await this.#getLocation()
        const url = `https://www.openstreetmap.org/#map=17/${position.latitude}/${position.longitude}`
        return url
    }

    /**
     * 
     * @returns Promise<POI[]> restaurants and cafes
     */
    getRestaurants() {
        return openstreetmapGetPOIs('37.8451386,-122.300148,37.8764455,-122.271823', ['cafe', 'restaurant'])
    }

    async getRestaurantsAroundMe() {
        const { latitude, longitude } = await this.#getLocation()
        const bbox = []
        bbox.push(latitude - 0.01)
        bbox.push(longitude - 0.01)
        bbox.push(latitude + 0.01)
        bbox.push(longitude + 0.01)
        const pois = await openstreetmapGetPOIs(bbox.join(','), ['cafe', 'restaurant'])
        return { pois, latitude, longitude }
    }

    initMap(target = 'globus', mapProvider = 'osm') {
        let config = {
            minZoom: 7,
            maxZoom: 18,
        };
        const zoom = 18;
        const lat = 52.22977;
        const lng = 21.01178;

        const map = L.map('map', config).setView([lat, lng], zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        }).addTo(map);

        // one marker
        // L.marker([52.22983, 21.011728]).addTo(map).bindPopup('Center Warsaw');
    }

}

(async () => {

    const poiComponent = new PoiComponent()
    poiComponent.initMap()
    const { pois, latitude, longitude } = await poiComponent.getRestaurantsAroundMe()
    console.log(`https://www.openstreetmap.org/#map=16/${latitude}/${longitude}`)
    console.log(pois)
    // document.getElementById('progress').style.visibility = 'hidden'
    /*
    const list = document.querySelector('ul')
    pois.forEach(poi => {
        const element = document.createElement('li')
        const a = document.createElement('a')
        const aText = document.createTextNode(poi.name)
        a.setAttribute('href', poi.osm_url)
        a.appendChild(aText)
        element.appendChild(a)
        list.appendChild(element)
    })
    */

})()