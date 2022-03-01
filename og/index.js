
class ConstellationComponent {
    constructor() {
        this.#init();
    }

    #init() {
        let entities = []

        const rnd = (min, max) => {
            return Math.random() * (max - min) + min;
        }

        for (let i = 0; i < 5000; i++) {
            entities.push(new og.Entity({
                name: 'sat-' + i,
                lonlat: [rnd(-180, 180), rnd(-90, 90), rnd(100000, 5000000)],
                billboard: {
                    src: './sat.png',
                    size: [24, 24],
                    rotation: rnd(0, 360)
                },
                properties: {
                    bearing: rnd(0, 360),
                }
            }));
        }

        let carrots = new og.EntityCollection({
            'entities': entities,
            'scaleByDistance': [6000000, 24000000, 10000000000]
        });

        carrots.events.on('draw', function (c) {
            c.each(function (e) {
                let c = e.getLonLat();
                let ll = globus.planet.ellipsoid.getBearingDestination(c, e.properties.bearing, 2000);
                e.properties.bearing = og.Ellipsoid.getFinalBearing(c, ll);
                e.setLonLat(new og.LonLat(ll.lon, ll.lat, c.height));
                e.billboard.setRotation(e.billboard.getRotation() + 0.01);
            });
        });

        carrots.events.on('mouseenter', function (e) {
            let b = e.pickingObject.billboard;
            b.setColor(1, 1, 1);
        });

        carrots.events.on('mouseleave', function (e) {
            let b = e.pickingObject.billboard;
            b.setColorHTML(e.pickingObject.properties.color);
        });


        let sat = new og.layer.XYZ('constellation', {
            isBaseLayer: true,
            url: '//tileproxy.cloud.mapquest.com/tiles/1.0.0/sat/{z}/{x}/{y}.png',
            visibility: true,
        });


        const globus = new og.Globe({
            target: 'globus',
            name: 'Earth',
            terrain: new og.terrain.GlobusTerrain(),
            layers: [sat]
        });

        carrots.addTo(globus.planet);

        globus.planet.flyLonLat(new og.LonLat(54.5, 43.5, 20108312));
        globus.renderer.backgroundColor.set(0.09, 0.09, 0.09);
    }
}

const comp = new ConstellationComponent()