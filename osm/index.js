
class PoiComponent {

    static MAPS_PROVIDER = {
        osm_fr: ' //tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        osm: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        arcgis: '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        mapquest: '//tileproxy.cloud.mapquest.com/tiles/1.0.0/sat/{z}/{x}/{y}.png',
    }
    #globe

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
        const url = PoiComponent.MAPS_PROVIDER[mapProvider]
        const osm = new og.layer.XYZ('o', { url })
        this.#globe = new og.Globe({ target, name: 'e', terrain: new og.terrain.EmptyTerrain(), layers: [osm] })
        this.#globe.renderer.backgroundColor.set(0.09, 0.09, 0.09)
    }

    addRestaurants(pois) {
        const entities = []
        pois.forEach(poi => {
            entities.push(new og.Entity({
                name: poi.name,
                poi,
                lonlat: [poi.lon, poi.lat, 0],
                billboard: {
                    src: './restaurant.png',
                    size: [240, 240],
                },
            }));
        })

        const poisCollection = new og.EntityCollection({ entities });

        /*
        pois.events.on('draw', c => {
            c.each(e => {
                let c = e.getLonLat();
                let ll = this.#globe.planet.ellipsoid.getBearingDestination(c, e.properties.bearing, 2000);
                e.properties.bearing = og.Ellipsoid.getFinalBearing(c, ll);
                e.setLonLat(new og.LonLat(ll.lon, ll.lat, c.height));
                e.billboard.setRotation(e.billboard.getRotation() + 0.01);
            });
        });

        pois.events.on('mouseleave', e => {
            let b = e.pickingObject.billboard;
            b.setColorHTML(e.pickingObject.properties.color);
        });
        */
        poisCollection.events.on('ldown', e => {
            let b = e.pickingObject.billboard;
            b.setColor(1, 1, 1);
            console.log(e)
            console.log(e.pickingObject)
            window.alert(e.pickingObject?.properties?.name)
            // window.open("https://www.geeksforgeeks.org", "_blank");
        });


        poisCollection.addTo(this.#globe.planet);
    }

    goTo(lon = 0, lat = 0) {
        const ell = this.#globe.planet.ellipsoid;
        const destPos = new og.LonLat(lon, lat - 0.19, 30000);
        const viewPoi = new og.LonLat(lon, lat);
        const lookCart = ell.lonLatToCartesian(viewPoi);
        const upVec = ell.lonLatToCartesian(destPos).normalize();
        return new Promise(res => this.#globe.planet.camera.flyLonLat(destPos, lookCart, upVec, 0, res));
    }

}

(async () => {

    const poiComponent = new PoiComponent()
    poiComponent.initMap()
    const { pois, latitude, longitude } = await poiComponent.getRestaurantsAroundMe()
    console.log(`https://www.openstreetmap.org/#map=16/${latitude}/${longitude}`)
    console.log(pois)
    poiComponent.goTo(longitude, latitude)
    document.getElementById('progress').style.visibility = 'hidden'
    poiComponent.addRestaurants(pois)
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