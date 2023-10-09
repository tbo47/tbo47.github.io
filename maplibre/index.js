import { maplibreAddWikimedia, maplibreHasBoundsChanged, maplibreInitMap } from '../ez-maplibre.js';
import { wikimediaQueryBound, wikimediaSetHeightInfo } from '../ez-opendata.js';
import { getLatLngZoomFromUrl, saveLatLngZoomToUrl, swapListening } from '../ez-web-utils.js';
const detailsEle = document.getElementById('details');
/**
 * This function is called every time a picture is clicked on the map.
 */
const onPicClick = async (pic, map) => {
    detailsEle.innerHTML = `Loading...`;
    detailsEle.style.flex = `2`;
    const h = Math.floor(detailsEle.getBoundingClientRect().height);
    const thumbInfo = await wikimediaSetHeightInfo([pic.pageid], h);
    // const user = await wikimediaGetAuthor(thumbInfo.title, pic.pageid)
    // const userLink = wikimediaGetAuthorLink(user)
    const thumbUrl = thumbInfo[pic.pageid].imageinfo[0].thumburl;
    const html = `<div class="detail">
            <a href="${thumbInfo.descriptionurl}" target="wm" title="${thumbInfo.name}"><img src="${thumbUrl}"></a>
        </div>`;
    // <a href="${userLink}" target="mp">More</a>
    detailsEle.innerHTML = html;
    detailsEle.style.height = `${h}px`;
    saveLatLngZoomToUrl(map.getCenter().lat, map.getCenter().lng, map.getZoom(), pic.pageid);
};
/**
 * If the picture in the details section is not on the map anymore, hide the details.
 */
const hideDetailsIfNotOnPageAnymore = (pics) => {
    if (!pics.find((p) => p.pageid === getLatLngZoomFromUrl().id)) {
        detailsEle.innerHTML = ``;
        detailsEle.style.flex = `0`;
    }
};
/**
 * This function is called every time the map is moved or zoomed.
 * We call Wikimedia Common REST endpoint and place the pictures on the map if needed.
 */
const renderMap = async (map, markers) => {
    try {
        const pics = await wikimediaQueryBound(map.getBounds());
        const newMarkers = await maplibreAddWikimedia(map, pics, markers);
        newMarkers.forEach((marker, pic) => marker.getElement().addEventListener('click', () => onPicClick(pic, map)));
        hideDetailsIfNotOnPageAnymore(pics);
        saveLatLngZoomToUrl(map.getCenter().lat, map.getCenter().lng, map.getZoom(), getLatLngZoomFromUrl().id);
    }
    catch (error) {
        console.error(error);
    }
};
/**
 * Called only once when the page is loaded. It loads the details section for the picture in the URL.
 */
const initialShowPicInDetails = (map, markers) => {
    const urlPicId = getLatLngZoomFromUrl().id;
    if (urlPicId) {
        markers.forEach((marker, pic) => {
            if (pic.pageid === urlPicId) {
                onPicClick(pic, map);
            }
        });
    }
};
const initSwipeLogic = (map, markers) => {
    const urlPicId = getLatLngZoomFromUrl().id;
    swapListening(detailsEle, (type) => {
        let add = 0;
        if (type === 'swipeleft')
            add = -1;
        if (type === 'swiperight')
            add = 1;
        Array.from(markers.keys()).every((pic, index, pics) => {
            if (pic.pageid === urlPicId && index > 0 && index < pics.length - 1) {
                const newPic = pics[index + add];
                onPicClick(newPic, map);
                map.flyTo({ center: [newPic.lon, newPic.lat] });
                return false;
            }
            return true;
        });
    });
};
const initMapEventsListening = (map, markers) => {
    let isFetchingData = false;
    let bounds = map.getBounds();
    const onChange = async () => {
        if (!isFetchingData && maplibreHasBoundsChanged(map, bounds)) {
            bounds = map.getBounds();
            isFetchingData = true;
            await renderMap(map, markers);
            setTimeout(() => (isFetchingData = false), 100);
        }
    };
    map.on('mouseup', onChange);
    map.on('zoomend', onChange);
    map.on('touchend', onChange);
};
(async () => {
    /**
     * Map<wikimedia picture, maplibre marker>
     */
    const markers = new Map();
    const map = await maplibreInitMap();
    await renderMap(map, markers);
    initialShowPicInDetails(map, markers);
    initMapEventsListening(map, markers);
    initSwipeLogic(map, markers);
})();
