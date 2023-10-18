import { wikimediaGetThumb } from './ez-opendata.js';
import { getCurrentPosition, getLatLngZoomFromUrl } from './ez-web-utils.js';
const DEFAULT_ZOOM = 16;
/**
 * Initialize the maplibre map with openstreetmap tiles.
 */
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
const OBJECT_STORE_NAME = 'image1';
const openDb = () => {
    return new Promise((resolve, reject) => {
        const DBOpenRequest = window.indexedDB.open(`ez-web-utils`, 7);
        DBOpenRequest.onerror = () => reject('Error loading database.');
        DBOpenRequest.onsuccess = () => resolve(DBOpenRequest.result);
        DBOpenRequest.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.onerror = (event) => console.error('Error loading database.' + event);
            db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
        };
    });
};
const readDb = (url, db) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(OBJECT_STORE_NAME, 'readonly');
        const image = transaction.objectStore(OBJECT_STORE_NAME);
        transaction.onerror = () => reject(false);
        image.get(url).onsuccess = (event) => resolve(event.target.result?.blob);
    });
};
const setDb = (id, blob, db) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(OBJECT_STORE_NAME, 'readwrite');
        const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
        // TODO would it be faster to combine all writes to db in one transaction?
        // transaction.oncomplete = () => console.log('Transaction done')
        const image = { id, blob };
        const addition = objectStore.put(image);
        addition.onsuccess = () => resolve(true);
        addition.onerror = () => reject(false);
    });
};
/**
 * Get the image from the cache or download it and store it in the cache.
 */
export const getFromCacheOrDownload = async (url, db) => {
    const doWeOpenTheDb = !db;
    if (!db)
        db = await openDb();
    let blob = await readDb(url, db);
    if (!blob) {
        const response = await fetch(url);
        if (response.status === 429) {
            return 429;
        }
        blob = await response.blob();
        await setDb(url, blob, db);
    }
    if (doWeOpenTheDb)
        db.close();
    return URL.createObjectURL(blob);
};
/**
 * Add the pics to the maplibre map and add the markers to the markers map.
 */
export const maplibreAddWikimedia = async (map, pics, markers) => {
    const db = await openDb();
    const picsAlreadyOnTheMap = Array.from(markers.keys());
    const picsToAdd = pics.filter((p) => !picsAlreadyOnTheMap.some((p2) => p.pageid === p2.pageid));
    // we only want to download a few images at a time, not the whole list. Bc it would take too long.
    const modulos = Math.ceil(picsToAdd.length / 6);
    const newMarkers = new Map();
    const promises = picsToAdd.map(async (pic, index) => {
        if (index % modulos !== 0)
            return;
        console.log(`Loading ${index} of ${picsToAdd.length}`);
        const maxSize = window.innerWidth > 400 ? window.innerWidth / 8 : window.innerWidth / 4;
        const info = await wikimediaGetThumb(pic.pageid, maxSize, maxSize);
        const element = document.createElement('img');
        const fromCache = await getFromCacheOrDownload(info.thumburl, db);
        if (fromCache === 429) {
            // TODO how to handle this?
        }
        else {
            element.src = fromCache;
        }
        const marker = new maplibregl.Marker({ element }).setLngLat([pic.lon, pic.lat]).addTo(map);
        markers.set(pic, marker);
        newMarkers.set(pic, marker);
    });
    await Promise.all(promises);
    db.close();
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
//# sourceMappingURL=ez-maplibre.js.map