/**
 * This file is the entry point of the application. It will initialize the map and add the pictures on it.
 * Start from the bottom of the file to understand the logic.
 */
import { leafletAddWikimedia, leafletInitMap } from '../ez-leaflet.js';
import { wikimediaQueryBound } from '../ez-opendata.js';
const showErrorMessage = (error) => {
    const errorDiv = document.getElementById('error');
    if (!errorDiv)
        return;
    errorDiv.innerHTML = error.info;
    errorDiv.style.display = 'block';
    setTimeout(() => (errorDiv.style.display = 'none'), 2000);
};
const renderMap = async (map, markers) => {
    try {
        const pics = await wikimediaQueryBound(map.getBounds());
        const picsToAdd = pics.filter((p) => !markers.has(p.pageid));
        const newMarkers = leafletAddWikimedia(map, picsToAdd);
        newMarkers.forEach((marker, id) => markers.set(id, marker));
    }
    catch (error) {
        showErrorMessage(error);
    }
};
/**
 * The `main` function is the entry point of the app.
 */
const main = async () => {
    /**
     * Map<id of the wikimedia page -> leaflet marker>
     */
    const markers = new Map(); // TODO replace id by instance
    const { map } = await leafletInitMap();
    await renderMap(map, markers);
    let isFetchingData = false;
    map.on('moveend', async () => {
        if (isFetchingData)
            return;
        isFetchingData = true;
        await renderMap(map, markers);
        isFetchingData = false;
    });
};
main();
