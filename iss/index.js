
class GlobeComponent {

    globus;
    kmlLayer;
    #maps = {
        openstreetmap: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        arcgis: '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        mapquest: "//tileproxy.cloud.mapquest.com/tiles/1.0.0/sat/{z}/{x}/{y}.png",
    };


    async ngOnInit() {
        this.globus = this._initMap();
        this._initIss(this.globus);
    }

    viewExtent() {
        this.globus.planet.flyExtent(this.kmlLayer.getExtent());
    }

    _initIss(globus) {
        let iss;
        let issTrack;
        let needToCenterTheMap = true
        let footprintEntityCollection
        setInterval(async () => {
            if (document.visibilityState === 'hidden') {
                issTrack?.polyline?.clear()
                needToCenterTheMap = true
                return
            }
            const { longitude, latitude, altitude, timestamp } = (await this._get('https://api.wheretheiss.at/v1/satellites/25544'));
            if (!iss) {
                iss = new og.Entity({
                    name: 'iss', lonlat: [], label: { text: '' }, billboard: {
                        src: './sat.png',
                        size: [24, 24],
                    },
                });
                issTrack = new og.Entity({ name: 'path', polyline: { pathLonLat: [], thickness: 2, color: '#fff' } });
                const e = new og.EntityCollection({ entities: [iss, issTrack] });
                e.addTo(globus.planet);
            }
            if (needToCenterTheMap) {
                this._goTo(globus, latitude, longitude, latitude - 16, longitude, altitude * 2000)
                needToCenterTheMap = false
            }
            const newPoint = new og.LonLat(longitude, latitude, altitude * 1000);
            iss.setLonLat(newPoint);
            issTrack.polyline.addPointLonLat(newPoint);
            const circle = this.#createCircle(globus.planet.ellipsoid, newPoint)
            footprintEntityCollection?.remove()
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
            footprintEntityCollection?.addTo(globus.planet)
        }, 1000);
    }

    #createCircle(ellipsoid, center, radius = 80000) {
        let circleCoords = [];
        for (let i = 0; i < 360; i += 5) {
            circleCoords.push(ellipsoid.getGreatCircleDestination(center, i, radius));
        }
        return circleCoords;
    }

    _goTo(globus, lat, lon, cameraLat, cameraLng, cameraAlt) {
        const ell = globus.planet.ellipsoid;
        const destPos = new og.LonLat(cameraLng, cameraLat, cameraAlt);
        const viewPoi = new og.LonLat(lon, lat);
        const lookCart = ell.lonLatToCartesian(viewPoi);
        const upVec = ell.lonLatToCartesian(destPos).normalize();
        return new Promise(res => globus.planet.camera.flyLonLat(destPos, lookCart, upVec, 0, res));
    }

    _initMap() {
        const osm = new og.layer.XYZ('o', { url: this.#maps.arcgis });
        const globe = new og.Globe({ target: 'globus', name: 'e', terrain: new og.terrain.EmptyTerrain(), layers: [osm] });
        globe.renderer.backgroundColor.set(0.09, 0.09, 0.09);
        return globe
    }

    _get(url) {
        return new Promise((resolve) => {
            const http = new XMLHttpRequest();
            http.onreadystatechange = () => {
                if (http.status === 200 && http.readyState === 4) { resolve(JSON.parse(http.response)); }
            };
            http.open('GET', url, true);
            http.send(null);
        });
    }
}

const comp = new GlobeComponent()
comp.ngOnInit();