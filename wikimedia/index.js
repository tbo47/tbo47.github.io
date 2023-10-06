import { leafletAddWikimedia, leafletInitMap } from '../ez-leaflet.js';
import { wikimediaQuery } from '../ez-opendata.js';
const showErrorMessage = (error) => {
    const errorDiv = document.getElementById('error');
    if (!errorDiv)
        return;
    errorDiv.innerHTML = error.info;
    errorDiv.style.display = 'block';
    setTimeout(() => errorDiv.style.display = 'none', 5000);
};
const renderMap = async (map) => {
    const bounds = map.getBounds();
    try {
        const wmedia = await wikimediaQuery(bounds.getNorthEast(), bounds.getSouthWest(), 5000);
        return leafletAddWikimedia(map, wmedia);
    }
    catch (error) {
        showErrorMessage(error);
        return [];
    }
};
(async () => {
    const { map } = await leafletInitMap();
    let markers = await renderMap(map);
    map.on('moveend', async () => {
        markers.forEach(marker => map.removeLayer(marker));
        markers = await renderMap(map);
    });
})();
