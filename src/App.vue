<script setup>
import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment'

import { onMounted, onUnmounted } from 'vue'

let camera,
  scene,
  renderer,
  controls,
  canvas,
  model,
  isTouch = false,
  positionY,
  actionID

function init() {
  canvas = document.getElementById('card')

  camera = new THREE.PerspectiveCamera(55, 3 / 2, 0.25, 20)
  camera.position.set(0, 0, 2)

  scene = new THREE.Scene()

  new GLTFLoader().setPath('models/v2/').load('02.gltf', async function (gltf) {
    model = gltf.scene

    // wait until the model can be added to the scene without blocking due to shader compilation

    await renderer.compileAsync(model, camera, scene)

    scene.add(model)

    render()
  })

  renderer = new THREE.WebGLRenderer({ antialias: true, canvas })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerWidth * 0.67)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1

  const environment = new RoomEnvironment(renderer)
  const pmremGenerator = new THREE.PMREMGenerator(renderer)

  scene.background = new THREE.Color(0xbbbbbb)
  scene.environment = pmremGenerator.fromScene(environment).texture

  controls = new OrbitControls(camera, canvas)
  controls.addEventListener('change', render) // use if there is no animation loop
  controls.minDistance = 3
  controls.maxDistance = 3
  controls.target.set(0, -.5, 0)
  controls.update()

  window.addEventListener('resize', onWindowResize)
}

function onWindowResize() {
  camera.aspect = 3 / 2
  camera.updateProjectionMatrix()

  if (window.innerWidth <= 480) {
    controls.target.set(0, .25, 0)
    controls.update()
  }

  renderer.setSize(window.innerWidth, window.innerWidth * 0.67)

  render()
}

function render(time) {
  if (!isTouch) {
    time *= 0.0001

    if (model && model.rotation) {
      model.rotation.y = time
    }
  }
  
  renderer.render(scene, camera)
  actionID = requestAnimationFrame(render)
}

onMounted(() => {
  init()

  canvas.addEventListener('touchstart', (e) => {
    isTouch = true
    cancelAnimationFrame(actionID)
  })

  canvas.addEventListener('touchmove', (e) => {
    isTouch = true
    cancelAnimationFrame(actionID)
  })

  canvas.addEventListener('touchend', () => {
    isTouch = false
    requestAnimationFrame(render)
  })
})

onUnmounted(() => {
  renderer.setAnimationLoop(null)
  window.removeEventListener('resize', onWindowResize)
})
</script>

<template>
  <main>
    <canvas id="card"></canvas>
  </main>
</template>
