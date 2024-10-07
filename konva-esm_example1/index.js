// import * as Konva from 'https://tbo47.github.io/konva-es.9.3.15.min.js'
import * as Konva from 'https://tbo47.github.io/konva-es.9.3.15_2.js'

function go() {
    const stage = new Konva.lib.Stage({
        container: 'container', // id of container <div>
        width: 500,
        height: 500,
    })

    const layer = new Konva.default.Layer()

    stage.add(layer)

    // Create a rectangle shape
    const rectangle = new Konva.default.Rect({
        x: 20,
        y: 20,
        width: 100,
        height: 50,
        fill: 'red',
        stroke: 'black',
        strokeWidth: 4,
    })

    // Add the rectangle to the layer
    layer.add(rectangle)

    // Draw the layer
    layer.draw()
}

go()
