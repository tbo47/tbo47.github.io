export const CACHE_KEYS = {
    bidJobs: 'bidJobs',
};
function initDb(dbName = 'CacheDB', storeName = 'httpGet') {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName))
                db.createObjectStore(storeName);
        };
        request.onsuccess = (event) => {
            const db = event.target.result;
            resolve({ db, storeName });
        };
        request.onerror = (event) => {
            console.error('Database error:', event.target.error);
            reject(event.target.error);
        };
    });
}
async function getDataFromLocalCache(key, db) {
    if (!db)
        db = await initDb();
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('IndexedDB is not initialized');
            return;
        }
        const transaction = db.db.transaction([db.storeName], 'readonly');
        const store = transaction.objectStore(db.storeName);
        const request = store.get(key);
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}
async function setDataToLocalCache(key, data, db) {
    if (!db)
        db = await initDb();
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('IndexedDB is not initialized');
            return;
        }
        const transaction = db.db.transaction([db.storeName], 'readwrite');
        const store = transaction.objectStore(db.storeName);
        const request = store.put(data, key);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}
const tileSize = 256;
export class Map {
    #canvas;
    #ctx;
    #zoom = 19;
    #center = [-17.477656, 14.709076];
    #token;
    #imgs = [];
    #db;
    #style = `osm`;
    async init(opts) {
        this.#canvas = this.#createCanvas(opts.container);
        this.#ctx = this.#canvas.getContext('2d');
        this.#zoom = opts.zoom;
        this.#center = opts.center;
        this.#token = opts.token;
        this.#style = opts.style || `osm`;
        this.#db = await initDb();
        await this.#draw(opts);
        this.#addScrollHandler();
        return this;
    }
    #createCanvas(container) {
        const mapDiv = document.querySelector(container);
        if (!mapDiv) {
            throw new Error('Container not found');
        }
        const canvas = document.createElement('canvas');
        mapDiv.appendChild(canvas);
        canvas.width = mapDiv.clientWidth;
        canvas.height = mapDiv.clientHeight;
        return canvas;
    }
    #latLonToTile(lat, lon, zoom) {
        const latRad = (lat * Math.PI) / 180;
        const n = Math.pow(2, zoom);
        const x = Math.floor(((lon + 180) / 360) * n);
        const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
        return { x, y };
    }
    async #drawTile(url, x, y) {
        let theBlob = (await getDataFromLocalCache(url, this.#db));
        if (!theBlob) {
            const response = await fetch(url);
            theBlob = await response.blob();
            await setDataToLocalCache(url, theBlob, this.#db);
        }
        const img = new Image();
        img.src = URL.createObjectURL(new Blob([theBlob], { type: 'image/png' }));
        img.onload = () => this.#ctx.drawImage(img, x, y, 256, 256);
        this.#imgs.push(img);
    }
    #getUrl(x, y) {
        if (this.#style === `jawg`)
            return `https://tile.jawg.io/jawg-streets/${this.#zoom}/${x}/${y}.png?access-token=${this.#token}`;
        else
            return `https://tile.openstreetmap.org/${this.#zoom}/${x}/${y}.png`;
    }
    async #draw({ zoom, center }) {
        const [lat, lon] = center;
        const { x, y } = this.#latLonToTile(lat, lon, zoom);
        const canvasWidth = this.#canvas.width;
        const canvasHeight = this.#canvas.height;
        const centerX = Math.floor(canvasWidth / 2) - tileSize / 2;
        const centerY = Math.floor(canvasHeight / 2) - tileSize / 2;
        const tilesHorizontally = Math.ceil(canvasWidth / tileSize);
        const tilesVertically = Math.ceil(canvasHeight / tileSize);
        const promises = [];
        for (let dx = -Math.floor(tilesHorizontally / 2); dx <= Math.floor(tilesHorizontally / 2); dx++) {
            for (let dy = -Math.floor(tilesVertically / 2); dy <= Math.floor(tilesVertically / 2); dy++) {
                const u = this.#getUrl(x + dx, y + dy);
                promises.push(this.#drawTile(u, centerX + dx * tileSize, centerY + dy * tileSize));
            }
        }
        await Promise.all(promises);
    }
    #addScrollHandler() {
        let isDragging = false;
        let startX, startY;
        let startLat, startLon;
        this.#canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const [lat, lon] = this.#center;
            startLat = lat;
            startLon = lon;
        });
        this.#canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });
        this.#canvas.addEventListener('mousemove', (e) => {
            if (!isDragging)
                return;
            const dx = startX - e.clientX;
            const dy = startY - e.clientY;
            const sensitivityFactor = 1.4; // Increase this factor to increase sensitivity
            const dLon = ((dx / tileSize) * 360 * sensitivityFactor) / Math.pow(2, this.#zoom);
            const dLat = ((dy / tileSize) * 360 * sensitivityFactor) / Math.pow(2, this.#zoom);
            const newLat = startLat - dLat;
            const newLon = startLon + dLon;
            this.#center = [newLat, newLon];
            // this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height)
            this.#draw({ zoom: this.#zoom, center: this.#center });
            this.#imgs.forEach((img, index) => {
                this.#imgs.splice(index, 1);
                img.remove();
            });
        });
        /*
        this.#canvas.addEventListener('wheel', (e) => {
            e.preventDefault()
            const delta = Math.sign(e.deltaY) * 0.1 // Adjust zoom sensitivity
            this.#zoom = Math.max(1, Math.min(20, this.#zoom - delta))
            this.#draw({ zoom: this.#zoom, center: this.#center })
        })
        */
    }
}
//# sourceMappingURL=maps-es.js.map