import { extractDiets, getFoodShops } from '../ez-opendata.js';
import { leafletAddPOIsToTheMap, leafletInitMap } from '../ez-leaflet.js';

const renderMap = async (map) => {

    map.eachLayer(layer => {
        if (!layer._url) map.removeLayer(layer)
    })
    document.getElementById(`diets`).innerHTML = ``
    document.getElementById(`pois`).innerHTML = ``
    document.getElementById(`loading`).innerHTML = `Loading`;

    const bounds = map.getBounds()
    const pois = await getFoodShops(bounds);
    const markers = leafletAddPOIsToTheMap(map, pois)
    const diets = extractDiets(pois);
    const dietsHtml = diets
        .map((d) => `<span class="">${d.at(0)} (${d.at(1)})</span>`)
        .join(` | `);
    document.getElementById(`diets`).innerHTML += dietsHtml;

    pois.forEach((poi) => {
        if (!poi.name) return;
        const div = document.createElement("div");
        const a = document.createElement("a");
        a.innerHTML = poi.name;
        div.appendChild(a);
        a.addEventListener("click", () => {
            const leafletMarker = markers.get(poi);
            if (leafletMarker) {
                leafletMarker.openPopup();
                map.fitBounds(L.latLngBounds([leafletMarker.getLatLng()]));
            }
        });
        document.getElementById(`pois`).appendChild(div);
    });
    document.getElementById(`loading`).innerHTML = ``;
}

(async () => {
    const { map } = await leafletInitMap()
    await renderMap(map)
    map.on('moveend', () => renderMap(map))
})();