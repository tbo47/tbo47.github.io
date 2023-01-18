
class IssComponent {

    static MAPS_PROVIDER = {
        osm: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        arcgis: '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        mapquest: "//tileproxy.cloud.mapquest.com/tiles/1.0.0/sat/{z}/{x}/{y}.png",
    }

    #needToCenterTheMap = true
    #footprintRadius = 0

    /**
     * 
     * @param {string} [divId] the html div id where to render the globe
     * @param {number} [refreshRate]  number of ms to refresh the position of iss
     * @param {string} [satelliteLabel]
     * @param {number} [footprintRadius]
     */
    constructor(divId = 'globus', refreshRate = 1000, satelliteLabel = '', footprintRadius = 80000, mapProvider = 'osm') {
        this.#footprintRadius = footprintRadius
        const globus = this.#initMap(divId, mapProvider);
        this.#initIss(globus, refreshRate, satelliteLabel);
    }

    focus() {
        this.#needToCenterTheMap = !this.#needToCenterTheMap
    }

    #initIss(globus, refreshRate = 1000, satelliteLabel = '') {
        let iss;
        let footprintEntityCollection
        setInterval(async () => {
            if (document.visibilityState === 'hidden') {
                iss?.issTrackEntity?.polyline?.clear()
                this.#needToCenterTheMap = true
                return
            }
            try {
                const { longitude, latitude, altitude, timestamp } = (await this.#get('https://api.wheretheiss.at/v1/satellites/25544'));
                if (!iss) {
                    iss = this.#initIssCollections(globus, satelliteLabel);
                }
                if (this.#needToCenterTheMap) {
                    await this.#goTo(globus, latitude, longitude, latitude - 16, longitude, altitude * 2000)
                    this.#needToCenterTheMap = false
                }
                const newPoint = new og.LonLat(longitude, latitude, altitude * 1000);
                iss.issEntity.setLonLat(newPoint);
                iss.issTrackEntity.polyline.addPointLonLat(newPoint);
                footprintEntityCollection = this.#changeFootprint(globus, newPoint, footprintEntityCollection);
            } catch (error) {
                console.error(error)
            }
        }, refreshRate);
    }

    #changeFootprint(globus, newPoint, footprintEntityCollection) {
        const circle = this.#createCircle(globus.planet.ellipsoid, newPoint);
        footprintEntityCollection?.remove();
        const footprintEntity = new og.Entity({
            polyline: {
                pathLonLat: [circle],
                pathColors: [[[0.99, 0.99, 0.99]]],
                thickness: 3.3,
                isClosed: true,
                altitude: 2
            }
        });
        footprintEntityCollection = new og.EntityCollection({ entities: [footprintEntity] });
        footprintEntityCollection?.addTo(globus.planet);
        return footprintEntityCollection;
    }

    #initIssCollections(globus, text = '') {
        const issEntity = new og.Entity({
            name: 'iss', lonlat: [], label: { text }, billboard: {
                src: './sat.png',
                size: [24, 24],
            },
        });
        const issCollection = new og.EntityCollection({ entities: [issEntity] });
        issCollection.addTo(globus.planet);
        const issTrackEntity = new og.Entity({ name: 'path', polyline: { pathLonLat: [], thickness: 2, color: '#ff8282' } });
        const issTrackCollection = new og.EntityCollection({ entities: [issTrackEntity] });
        issTrackCollection.addTo(globus.planet);
        return { issEntity, issTrackEntity }
    }

    #createCircle(ellipsoid, center) {
        let circleCoords = [];
        for (let i = 0; i < 360; i += 5) {
            circleCoords.push(ellipsoid.getGreatCircleDestination(center, i, this.#footprintRadius));
        }
        return circleCoords;
    }

    #goTo(globus, lat = 0, lon = 0, cameraLat = 0, cameraLng = 0, cameraAlt = 0) {
        const ell = globus.planet.ellipsoid;
        const destPos = new og.LonLat(cameraLng, cameraLat, cameraAlt);
        const viewPoi = new og.LonLat(lon, lat);
        const lookCart = ell.lonLatToCartesian(viewPoi);
        const upVec = ell.lonLatToCartesian(destPos).normalize();
        return new Promise(res => globus.planet.camera.flyLonLat(destPos, lookCart, upVec, 0, res));
    }

    #initMap(target = '', mapProvider) {
        const url = IssComponent.MAPS_PROVIDER[mapProvider]
        const osm = new og.layer.XYZ('o', { url })
        const globe = new og.Globe({ target, name: 'e', terrain: new og.terrain.EmptyTerrain(), layers: [osm] })
        // globe.renderer.backgroundColor.set(0.09, 0.09, 0.09)
        return globe
    }

    // TODO replace by fetch
    #get(url = '') {
        return new Promise((resolve, reject) => {
            const http = new XMLHttpRequest();
            http.onreadystatechange = () => {
                if (http.status === 200 && http.response) {
                    resolve(JSON.parse(http.response));
                } else if (http.statusText && http.statusText !== 'OK') {
                    reject(http)
                }
            };
            http.open('GET', url, true);
            http.send(null);
        });
    }
}

const issComp = new IssComponent('globusDivId', 1000, '  iss')

function centerButtonOnClick() {
    issComp.focus()
}