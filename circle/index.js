import { initLeafletMap } from '../ez-opendata.js';

(async () => {
    const { map } = await initLeafletMap()

    // https://leafletjs.com/reference.html#control-scale-option
    L.control.scale({ maxWidth: 500, imperial: false, updateWhenIdle: true }).addTo(map)

    map.setView([12.97, -12.9941], 10)
    const radius = 100_000 / (2 * Math.PI)
    L.circle([13.1206, -13.2344], { color: 'green', radius }).addTo(map)

    const perimeter = 100_000 // 100km
    const circle = L.circle([13.1206, -13.2344], { radius: perimeter / 8 }).addTo(map)
    const { _northEast, _southWest } = circle.getBounds()
    // new L.Rectangle([[X, Y], [X, Y]], {color: "#ff7800", weight: 1})
    // map.removeLayer(circle)

    L.polygon([
        [13.1708, -12.8876],
        [13.0072, -12.5189],
        [12.9698, -12.5327],
        [13.1437, -12.9082],
    ], { color: 'green' }).addTo(map)
})();
