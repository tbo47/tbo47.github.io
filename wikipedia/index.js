import { addWikipediaArticlesToTheMap, extractDiets, initLeafletMap, wikipedia } from '../ez-osm.js';

const renderMap = async (map) => {

    map.eachLayer(layer => {
        if (!layer._url) map.removeLayer(layer)
    })
    document.getElementById(`diets`).innerHTML = ``
    document.getElementById(`pois`).innerHTML = ``
    document.getElementById(`loading`).innerHTML = `Loading`;

    const { lat, lng } = map.getCenter()
    const language = window.navigator.language?.split('-').at(0);
    const articles = await wikipedia(lat, lng, language)
    const markers = addWikipediaArticlesToTheMap(map, articles)
    return

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
    const { map } = await initLeafletMap()
    await renderMap(map)
    map.on('moveend', () => renderMap(map))
})();