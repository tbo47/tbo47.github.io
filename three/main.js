// import * as THREE from './node_modules/three/build/three.module.js'
import * as THREE from 'three';

const scene = new THREE.Scene()

const geometry = new THREE.SphereGeometry(3, 64, 64)

const material = new THREE.MeshStandardMaterial({ color: '#00ff83' })

const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
const light = new THREE.PointLight(0xffffff, 1, 100)
light.position.set(0, 10, 10)
scene.add(light)

const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height)
camera.position.z = 20
scene.add(camera)

const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({ canvas })

renderer.setSize(sizes.width, sizes.height)

renderer.render(scene, camera)

document.addEventListener('keydown', (event) => {
    if (event.key === 'w' || event.key === 'W') {
        camera.position.z -= 2
    }
    if (event.key === 's' || event.key === 'S') {
        camera.position.z += 2
    }
    if (event.key === 'a' || event.key === 'A') {
        camera.position.x -= 2
    }
    if (event.key === 'd' || event.key === 'D') {
        camera.position.x += 2
    }
}, false);

const loop = () =>{
    renderer.render(scene,camera)
    window.requestAnimationFrame(loop)
}
loop()