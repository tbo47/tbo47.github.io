## Steps to tile a pdf

### Tranform a pdf to image

In python, you first need to install poopler: `apt-get install poppler-utils` for linux and `brew install poppler` for macos.

```python
from pdf2image import convert_from_path
from pypdf import PdfReader, PdfWriter
from pypdf.annotations import Link, Rectangle

def convert_pdf_to_png(pdf_path: str, img_name: str):
    reader = PdfReader(pdf_path)
    media_box = reader.pages[0].mediabox
    x0, y0 = media_box.lower_left
    x1, y1 = media_box.upper_right
    width = x1 - x0
    height = y1 - y0
    images = convert_from_path(pdf_path, size=(width*2, height*2))
    images[0].save(img_name, 'TIFF')
    images[0].save("test2.tiff", 'TIFF')


convert_pdf_to_png("mypdf.pdf", 'mypdf.tiff')
```

Or in javascript

```
npm i -g pdf-to-img@latest
pdf2img inputFile.pdf
```

### Tile an image with qgis

In [qgis](https://www.qgis.org/), Layer>Georefencer add tiff file and add 2 points(0.1 0 and 0 0). And in "transformation Settings", select "Create world file only"

In qgis, left click on the new layer and "Zoom to layer"

In qgis, Processing>Toolbox "Raster tools"> "Generate XYZ tiles (MBtiles)". Min 0 Max 20

Serve the file with [martin](https://github.com/maplibre/martin): `./martin mypdf.mbtiles`

### Render the tiles 

With [maplibre](https://maplibre.org/):

```javascript
const center: maplibregl.LngLatLike = [-0.01316, 0.0259]
const map = new maplibregl.Map({
    container: 'jawg-map',
    zoom: 12,
    center,
    attributionControl: false,
    hash: true,
    style: {
        version: 8,
        sources: {
            // using martin serving qgis made mbtiles
            martin: {
                type: 'raster',
                tiles: ['http://localhost:3000/mypdf/{z}/{x}/{y}'],
                tileSize: 256,
                maxzoom: 19,
            },
            osm: {
                type: 'raster',
                tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 19,
            },
        },
        layers: [
            {
                id: 'martin',
                type: 'raster',
                source: 'martin',
            },
        ],
    },
}).addControl(new maplibregl.NavigationControl(), 'bottom-right')
```
