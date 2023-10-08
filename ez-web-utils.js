/**
 * Collection of utility functions for the browser (not for nodejs).
 */
/**
 * Get the current location of the user. Will only work on https or localhost.
 *
 * @param defaultCenter default center if geolocation fails
 *
 * ```const [longitude, latitude] = await getCurrentPosition()```
 */
export const getCurrentPosition = (defaultCenter = [2, 48], timeout = 3000) => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(defaultCenter), timeout);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((p) => resolve([p.coords.longitude, p.coords.latitude]), () => resolve(defaultCenter));
        }
        else {
            resolve(defaultCenter);
        }
    });
};
export const getLatLngZoomFromUrl = () => {
    // #map=17/14.71241/-17.48513/323
    const hash = window.location.hash.substring(1).split('/');
    const zoom = Number(hash[0]);
    const lat = Number(hash[1]);
    const lng = Number(hash[2]);
    const id = Number(hash[3]);
    return { lat, lng, zoom, id };
};
export const saveLatLngZoomToUrl = (latNew, lngNew, zoomNew, idNew = 0) => {
    const { lat, lng, zoom, id } = getLatLngZoomFromUrl();
    if (latNew === lat && lngNew === lng && zoomNew === zoom && idNew === id)
        return;
    window.location.hash = `${zoomNew}/${latNew}/${lngNew}` + (idNew ? `/${idNew}` : '');
};
export const swapListening = (ele, callback) => {
    let touchstartX = 0;
    let touchstartY = 0;
    let touchendX = 0;
    let touchendY = 0;
    ele.addEventListener('touchstart', (event) => {
        touchstartX = event.changedTouches[0].screenX;
        touchstartY = event.changedTouches[0].screenY;
    }, false);
    ele.addEventListener('touchend', (event) => {
        touchendX = event.changedTouches[0].screenX;
        touchendY = event.changedTouches[0].screenY;
        handleGesture();
    }, false);
    const handleGesture = () => {
        if (touchendX < touchstartX) {
            callback(new Event('swipeleft'));
        }
        if (touchendX > touchstartX) {
            callback(new Event('swiperight'));
        }
        if (touchendY < touchstartY) {
            callback(new Event('swipeup'));
        }
        if (touchendY > touchstartY) {
            callback(new Event('swipedown'));
        }
        if (touchendY === touchstartY) {
            callback(new Event('tap'));
        }
    };
};
