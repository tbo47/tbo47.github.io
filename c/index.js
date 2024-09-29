// Create a new stage
const stage = new Konva.Stage({
    container: 'container',
    width: window.innerWidth,
    height: window.innerHeight,
})
// Create a new layer
const layer = new Konva.Layer()
stage.add(layer)
// Draw the base of the card
const WIDTH = 830
layer.draw()

const webpFiles = [
    'IMG_0381.webp',
    'IMG_20240302_162719563.webp',
    'IMG_20240306_164022180.webp',
    'IMG_20240503_085740.webp',
    'IMG_20240504_111711.webp',
    'IMG_20240709_141822.webp',
    'IMG_2223.webp',
    'PXL_20240810_233803355.webp',
    'PXL_20240813_010309031.webp',
    'PXL_20240816_030103165.PORTRAIT.webp',
    'PXL_20240906_124804320.webp',
    'PXL_20240907_133000755.jpg',
    'PXL_20240914_164644577.jpg',
    'PXL_20240915_080829680.jpg',
]
// Function to load and display images
async function loadImages(imageFiles) {
    const imgs = await Promise.all(
        imageFiles.map((file, index) => {
            return new Promise((resolve) => {
                Konva.Image.fromURL('./i/' + file, (image) => {
                    image.setAttrs({
                        x: (index % 5) * 300,
                        y: Math.floor(index / 5) * 300,
                        width: 300,
                        height: image.height() * (300 / image.width()),
                    })
                    layer.add(image)
                    layer.draw()
                    resolve(image)
                })
            })
        })
    )
    imgs.forEach((img) => {
        img.on('click', () => {
            img.moveToTop()
            img.to({
                duration: 1,
                rotation: 360,
                easing: Konva.Easings.EaseInOut,
            })
        })
    })
    return imgs
}

// Load and display images from webpFiles array
loadImages(webpFiles)
