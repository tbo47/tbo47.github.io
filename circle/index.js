import { leafletInitMap } from '../ez-leaflet.js';

const D_STYLE = { color: "#ff7800", weight: 1 };

(async () => {
    const { map } = leafletInitMap()

    // https://leafletjs.com/reference.html#control-scale-option
    L.control.scale({ maxWidth: 500, imperial: false, updateWhenIdle: true }).addTo(map)

    map.setView([13, -13], 10)
    const radius = 100_000 / (2 * Math.PI)
    L.circle([13.1206, -13.2344], { ...D_STYLE, radius }).addTo(map)

    const perimeter = 100_000 // we want a rectangle with a 100km perimeter
    const recangleCenter = [13, -13]
    const circle = L.circle(recangleCenter, { radius: perimeter / 8 }).addTo(map)
    const { _northEast, _southWest } = circle.getBounds()
    map.removeLayer(circle)
    L.rectangle([[_northEast.lat, _northEast.lng], [_southWest.lat, _southWest.lng]], D_STYLE).addTo(map)

    L.polygon([
        [13.1708, -12.8876],
        [13.0072, -12.5189],
        [12.9698, -12.5327],
        [13.1437, -12.9082],
    ], D_STYLE).addTo(map)
})();
