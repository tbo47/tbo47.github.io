import * as Konva from 'https://tbo47.github.io/konva-es.9.3.15.min.js'

function go() {
    const stage = new Konva.Stage({
        container: 'container', // id of container <div>
        width: 500,
        height: 500,
    })

    const layer = new Konva.Layer()

    stage.add(layer)
}

go()
