/**
 * This file is the entry point of the application. It will initialize the map and add the pictures on it.
 * Start from the bottom of the file to understand the logic.
 */
import { getFromCacheOrDownload, maplibreAddWikimedia, maplibreHasBoundsChanged, maplibreInitMap, } from '../ez-maplibre.js';
import { wikimediaGetThumb, wikimediaQueryBound } from '../ez-opendata.js';
import { getLatLngZoomFromUrl, saveLatLngZoomToUrl, setHtmlHeaders, swapListening } from '../ez-web-utils.js';
/**
 * This function is called every time a picture is clicked on the map.
 */
const onPicClick = async (pic, map, detailsEle) => {
    detailsEle.innerHTML = `Loading...`;
    detailsEle.style.flex = `2`;
    const { height, width } = detailsEle.getBoundingClientRect();
    const thumb = await wikimediaGetThumb(pic.pageid, height, width);
    setHtmlHeaders({ title: thumb.objectname, image: thumb.thumburl, description: thumb.objectname });
    const fromCache = await getFromCacheOrDownload(thumb.thumburl);
    const picHtml = document.createElement('img');
    picHtml.className = 'detail-pic';
    picHtml.title = 'Double click for more pictures from this author';
    const detailHtml = document.createElement('div');
    detailHtml.appendChild(picHtml);
    detailHtml.className = 'detail';
    if (fromCache !== 429)
        picHtml.src = fromCache;
    detailsEle.innerHTML = ``;
    detailsEle.appendChild(detailHtml);
    detailsEle.addEventListener('dblclick', () => {
        const a = document.getElementById('hiddenlink');
        a.href = thumb.artistUrl;
        a.target = thumb.artist;
        setTimeout(() => a.click(), 100);
    });
    detailsEle.addEventListener('click', () => map.flyTo({ center: [pic.lon, pic.lat], zoom: 16 }));
    saveLatLngZoomToUrl(map.getCenter().lat, map.getCenter().lng, map.getZoom(), pic.pageid);
};
/**
 * If the picture in the details section is not on the map anymore, hide the details.
 */
const hideDetailsIfNotOnPageAnymore = (pics, detailsEle) => {
    if (!pics.find((p) => p.pageid === getLatLngZoomFromUrl().id)) {
        detailsEle.innerHTML = ``;
        detailsEle.style.flex = `0`;
    }
};
/**
 * Calls Wikimedia Commons REST endpoint and place the pictures on the map.
 */
const renderMap = async (map, markers, detailsEle) => {
    try {
        const pics = await wikimediaQueryBound(map.getBounds(), 100);
        const newMarkers = await maplibreAddWikimedia(map, pics, markers);
        newMarkers.forEach((marker, pic) => {
            marker.getElement().addEventListener('click', () => onPicClick(pic, map, detailsEle));
        });
        // TODO hideDetailsIfNotOnPageAnymore(pics)
        saveLatLngZoomToUrl(map.getCenter().lat, map.getCenter().lng, map.getZoom(), getLatLngZoomFromUrl().id);
    }
    catch (error) {
        console.error(error);
    }
};
/**
 * It loads the details section for the picture in the URL.
 */
const initialShowPicInDetails = (map, markers, detailsEle) => {
    const urlPicId = getLatLngZoomFromUrl().id;
    if (urlPicId) {
        markers.forEach((marker, pic) => {
            if (pic.pageid === urlPicId) {
                onPicClick(pic, map, detailsEle);
            }
        });
    }
};
/**
 * Initialize the swipe logic to change the picture in the details section. For smartphones.
 */
const initSwipeLogic = (map, markers, detailsEle) => {
    swapListening(detailsEle, (type) => {
        console.log(type);
        const urlPicId = getLatLngZoomFromUrl().id;
        let add = 0;
        if (type === 'swipeleft')
            add = 1;
        else if (type === 'swiperight')
            add = -1;
        else
            return;
        Array.from(markers.keys()).every((pic, index, pics) => {
            if (pic.pageid === urlPicId) {
                let newPicIndex = index + add;
                if (newPicIndex < 0)
                    newPicIndex = pics.length - 1;
                else if (newPicIndex >= pics.length)
                    newPicIndex = 0;
                const newPic = pics[newPicIndex];
                onPicClick(newPic, map, detailsEle);
                map.flyTo({ center: [newPic.lon, newPic.lat], zoom: 16 });
                return false;
            }
            return true;
        });
    });
};
/**
 * Initialize all the events listeners on the map. It will call renderMap() when needed.
 */
const initMapEventsListening = (map, markers, detailsEle) => {
    let bounds = map.getBounds();
    const onChange = async () => {
        if (maplibreHasBoundsChanged(map, bounds)) {
            bounds = map.getBounds();
            await renderMap(map, markers, detailsEle);
            // TODO implement a debounce
        }
    };
    map.on('mouseup', onChange);
    map.on('zoomend', onChange);
    map.on('touchend', onChange);
};
/**
 * The `main` function is the entry point of the app.
 */
const main = async () => {
    debugger;
    /**
     * `markers` is a javascript Map.
     * The keys of the map are the Wikimedia Commons picture instances, the values are the Maplibre marker instances.
     */
    const markers = new Map(); // TODO clean up markers if too big
    const detailsEle = document.getElementById('details');
    const map = await maplibreInitMap();
    await renderMap(map, markers, detailsEle);
    initialShowPicInDetails(map, markers, detailsEle);
    initMapEventsListening(map, markers, detailsEle);
    initSwipeLogic(map, markers, detailsEle);
};
main();
//# sourceMappingURL=index.js.map