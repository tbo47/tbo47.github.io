/**
 * This file is the entry point of the application. It will initialize the map and add the POIs on it.
 * Start from the bottom of the file to understand the logic.
 */
import { leafletAddPOIsToTheMap, leafletCreateLayerOnMap, leafletInitMap } from '../ez-leaflet.js';
import { OSM_CATEGORIES, openstreetmapExtractDiets, openstreetmapGetPOIsBbox } from '../ez-opendata.js';
const renderMap = async (map, markers, layerGroup) => {
    document.getElementById(`diets`).innerHTML = ``;
    document.getElementById(`pois`).innerHTML = ``;
    document.getElementById(`loading`).innerHTML = `Loading`;
    const bounds = map.getBounds();
    const pois = await openstreetmapGetPOIsBbox(bounds, OSM_CATEGORIES.food);
    leafletAddPOIsToTheMap(layerGroup, pois, markers);
    const diets = openstreetmapExtractDiets(pois);
    const getHtml = (d) => `<span class="">${d.at(0)} (${d.at(1)})</span>`;
    const dietsHtml = diets.map(getHtml).join(` | `);
    document.getElementById(`diets`).innerHTML += dietsHtml;
    pois.forEach((poi) => {
        // if (!poi.name) return;
        const div = document.createElement('div');
        const a = document.createElement('a');
        a.innerHTML = poi.name;
        div.appendChild(a);
        a.addEventListener('click', () => {
            const leafletMarker = markers.get(poi);
            if (leafletMarker) {
                leafletMarker.openPopup();
            }
        });
        document.getElementById(`pois`).appendChild(div);
    });
    document.getElementById(`loading`).innerHTML = ``;
};
/**
 * The `main` function is the entry point of the app.
 */
const main = async () => {
    const { map } = await leafletInitMap();
    // markers is a Map<osm poi, leaflet marker instance>
    const markers = new Map();
    const layerGroup = leafletCreateLayerOnMap(map);
    await renderMap(map, markers, layerGroup);
    map.on('moveend', async () => await renderMap(map, markers, layerGroup));
};
main();
//# sourceMappingURL=index.js.map