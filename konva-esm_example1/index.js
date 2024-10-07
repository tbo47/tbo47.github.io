import { Konva } from 'https://tbo47.github.io/konva-es.9.3.15.js'

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
            innerRadius: 5,
            outerRadius: 10,
            fill: '#FFD700',
            stroke: 'black',
            strokeWidth: 1,
        })
    }

    // Create and add multiple stars to the layer
    const stars = []
    for (let i = 0; i < 50; i++) {
        const star = createStar()
        stars.push(star)
        layer.add(star)
    }

    // Animation to move stars randomly
    const anim = new Konva.Animation((frame) => {
        stars.forEach((star) => {
            star.x(star.x() + Math.random() * 2 - 1)
            star.y(star.y() + Math.random() * 2 - 1)
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
