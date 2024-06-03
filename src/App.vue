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
  actionID,
  progressBarDiv,
  positionY,
  pauseTime

function init() {
  canvas = document.getElementById('card')
  canvas.style.backgroundColor = 'transparent'

  progressBarDiv = document.querySelector('.loader')
  progressBarDiv.style.display = 'block'
  progressBarDiv.style.top = setPosition().progressBarPosition
  progressBarDiv.style.width = '100%'

  camera = new THREE.PerspectiveCamera(setPosition().fov, 3 / 2, 0.25, 200)
  camera.position.set(...setPosition().cameraPosition)

  scene = new THREE.Scene()

  new GLTFLoader().setPath('models/v2/').load('02.gltf', async function (gltf) {
    model = gltf.scene
    await renderer.compileAsync(model, camera, scene)

    scene.add(model)

    render()
    progressBarDiv.style.display = 'none'
  })

  renderer = new THREE.WebGLRenderer({ antialias: true, canvas, alpha: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerWidth * 0.67)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1

  const environment = new RoomEnvironment(renderer)
  const pmremGenerator = new THREE.PMREMGenerator(renderer)

  scene.environment = pmremGenerator.fromScene(environment).texture

  controls = new OrbitControls(camera, canvas)
  controls.addEventListener('change', render) // use if there is no animation loop
  controls.minDistance = 3
  controls.maxDistance = 3
  controls.target.set(...setPosition().targetPostion)
  controls.update()

  window.addEventListener('resize', onWindowResize)
}

function onWindowResize() {
  camera.aspect = 3 / 2
  camera.fov = setPosition().fov
  camera.position.set(...setPosition().cameraPosition)
  camera.updateProjectionMatrix()

  controls.target.set(...setPosition().targetPostion)
  controls.update()

  renderer.setSize(window.innerWidth, window.innerWidth * 0.67)

  render()
}

function setPosition() {
  var fov, cameraPosition, targetPostion, progressBarPosition

  if (window.innerWidth < 1600) {
    fov = 38
    cameraPosition = [1.4, 0, 2]
    targetPostion = [0, 0, 0]
    progressBarPosition = (window.innerWidth * 0.67) / 2 - 50 + 'px'
  } else {
    fov = 60
    cameraPosition = [1.4, 0, 2]
    targetPostion = [0, -0.5, 0]
    progressBarPosition = window.innerHeight / 2 + 'px'
  }

  return {
    fov,
    cameraPosition,
    targetPostion,
    progressBarPosition
  }
}

function render(time) {
  if (!isTouch && progressBarDiv.style.display == 'none') {
    time *= 0.00055

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
  <div class="loader">
    <div class="custom-loader"></div>
  </div>
  <canvas id="card"></canvas>
</template>
