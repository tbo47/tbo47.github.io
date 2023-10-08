import { wikimediaGetAuthor, wikimediaGetAuthorLink, wikimediaInfo } from './ez-opendata.js';
import { getCurrentPosition, getLatLngZoomFromUrl, setLatLngZoomIfNeeded } from './ez-web-utils.js';
const DEFAULT_ZOOM = 16;
const MARKER_OPTIONS = {
    color: '#FFFFFF',
};
export const maplibreInitMap = async () => {
    let { lat, lng, zoom } = getLatLngZoomFromUrl();
    let center = [lng, lat];
    debugger;
    if (!lat || !lng || !zoom) {
        center = await getCurrentPosition();
        zoom = DEFAULT_ZOOM;
    }
    const map = new maplibregl.Map({
        container: 'map',
        style: 'https://api.maptiler.com/maps/streets/style.json?key=52Jm6r7frh3pSGiGGn3t',
        center,
        zoom,
    });
    const pos = map.getCenter();
    setLatLngZoomIfNeeded(pos.lat.toString(), pos.lng.toString(), map.getZoom().toString());
    return map;
};
export const maplibreAddWikimedia = async (map, pics, markers) => {
    const picsAlreadyOnTheMap = Array.from(markers.keys());
    const picsToAdd = pics.filter((p) => !picsAlreadyOnTheMap.some((p2) => p.pageid === p2.pageid));
    console.log(picsToAdd);
    picsToAdd.forEach(async (pic) => {
        const info = await wikimediaInfo(pic.pageid, 600);
        const user = await wikimediaGetAuthor(info.title, pic.pageid);
        const userLink = wikimediaGetAuthorLink(user);
        const html = `<div>
                        <a href="${info.descriptionurl}" target="wm">${info.name}<img src="${info.thumburl}"></a>
                        <a href="${userLink}" target="mp">More photos from ${user}</a>
                      </div>`;
        const marker = new maplibregl.Marker(MARKER_OPTIONS)
            .setLngLat([pic.lon, pic.lat])
            .setPopup(new maplibregl.Popup().setHTML(html))
            .addTo(map);
        markers.set(pic, marker);
    });
};
export const maplibreHasBoundsChanged = (map, knownBounds) => {
    const currentBounds = map.getBounds();
    if (currentBounds.getNorthEast().lat !== knownBounds.getNorthEast().lat)
        return true;
    if (currentBounds.getNorthEast().lat !== knownBounds.getNorthEast().lat)
        return true;
    if (currentBounds.getSouthWest().lng !== knownBounds.getSouthWest().lng)
        return true;
    if (currentBounds.getSouthWest().lng !== knownBounds.getSouthWest().lng)
        return true;
    return false;
};
