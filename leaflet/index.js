
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
     * Query an openstreetmap server to fetch POIs
     * 
     * @param {*} bbox the rectangle where to perform the query
     * @param {*} categories of pois. Like restaurant, cafe...
     * @returns Promise<Poi[]>
     */
    #getPois(bbox, categories) {
        const url = 'https://overpass-api.de/api/interpreter';

        let quest = '';
        categories.forEach(c => {
            const p = `
          node['amenity'='${c}'](${bbox});
          way['amenity'='${c}'](${bbox});
          relation['amenity'='${c}'](${bbox});`;
            quest += p;
        });

        const q = `
        [out:json][timeout:25];
        (
            ${quest}
        );
        out body;
        >;
        out skel qt;`;

        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(q);
        return new Promise(resolve => {
            xhr.onload = function () {
                const data = JSON.parse(this.responseText);
                const pois = data.elements.filter(p => p.tags).map(p => {
                    p = { ...p, ...p.tags } // merge the tags object into the main one
                    delete p.tags
                    p.osm_url = `https://www.openstreetmap.org/${p.type}/${p.id}`
                    p.osm_url_edit = `https://www.openstreetmap.org/edit?${p.type}=${p.id}`
                    return p
                })
                resolve(pois)
            };
        })
    }

    /**
     * 
     * @returns Promise<POI[]> restaurants and cafes
     */
    getRestaurants() {
        return this.#getPois('37.8451386,-122.300148,37.8764455,-122.271823', ['cafe', 'restaurant'])
    }

    async getRestaurantsAroundMe() {
        const { latitude, longitude } = await this.#getLocation()
        const bbox = []
        bbox.push(latitude - 0.01)
        bbox.push(longitude - 0.01)
        bbox.push(latitude + 0.01)
        bbox.push(longitude + 0.01)
        const pois = await this.#getPois(bbox.join(','), ['cafe', 'restaurant'])
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