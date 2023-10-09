import { wikimediaInfo } from './ez-opendata.js';
import { getCurrentPosition, getLatLngZoomFromUrl } from './ez-web-utils.js';
const DEFAULT_ZOOM = 16;
export const maplibreInitMap = async () => {
    let { lat, lng, zoom } = getLatLngZoomFromUrl();
    let center = [lng, lat];
    if (!lat || !lng || !zoom) {
        center = await getCurrentPosition();
        zoom = DEFAULT_ZOOM;
    }
    const style = {
        version: 8,
        sources: {
            osm: {
                type: 'raster',
                tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 19,
            },
        },
        layers: [
            {
                id: 'osm',
                type: 'raster',
                source: 'osm', // This must match the source key above
            },
        ],
    };
    const map = new maplibregl.Map({ container: 'map', style, center, zoom });
    return map;
};
export const maplibreAddWikimedia = async (map, pics, markers) => {
    const picsAlreadyOnTheMap = Array.from(markers.keys());
    const picsToAdd = pics.filter((p) => !picsAlreadyOnTheMap.some((p2) => p.pageid === p2.pageid));
    const newMarkers = new Map();
    const promises = picsToAdd.map(async (pic) => {
        const width = Math.min(Math.floor(window.innerWidth * 0.8), 100); // TODO
        const info = await wikimediaInfo(pic.pageid, width);
        const element = document.createElement('img');
        element.src = info.thumburl;
        const marker = new maplibregl.Marker({ element }).setLngLat([pic.lon, pic.lat]).addTo(map);
        markers.set(pic, marker);
        newMarkers.set(pic, marker);
    });
    await Promise.all(promises);
    return newMarkers;
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
