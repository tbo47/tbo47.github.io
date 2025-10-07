import { Konva } from '../konva-es.10.0.2.js'

function go() {
    const stage = new Konva.Stage({
        container: 'container', // id of container <div>
        width: window.innerWidth,
        height: window.innerHeight,
    })

    const layer = new Konva.Layer()
    stage.add(layer)

    // Function to create a small star
    function createStar() {
        return new Konva.Star({
            x: Math.random() * stage.width(),
            y: Math.random() * stage.height(),
            numPoints: 5,
            innerRadius: 4,
            outerRadius: 8,
            fill: '#FFD700',
            stroke: 'black',
            strokeWidth: 1,
        })
    }

    // Create and add multiple stars to the layer
    const stars = []
    for (let i = 0; i < 500; i++) {
        const star = createStar()
        stars.push(star)
        layer.add(star)
    }

    // Animation to move stars randomly
    const anim = new Konva.Animation((frame) => {
        stars.forEach((star) => {
            star.x(star.x() + Math.random() - 0.6)
            if (star.x() < 0) star.x(star.x() + stage.width())
            star.y(star.y() + (Math.random() + 1) * 0.6)
            if (star.y() > stage.height()) star.y(0)
        })
    }, layer)

    anim.start()
}

go()

// Adjust canvas size on window resize
window.addEventListener('resize', () => {
    const stage = Konva.stages[0]
    stage.width(window.innerWidth)
    stage.height(window.innerHeight)
})
