<script setup>
import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment'

import { onMounted, onUnmounted } from 'vue'

let camera, scene, renderer, controls

function init() {
  const container = document.createElement('div')
  document.body.appendChild(container)

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 20)
  camera.position.set(-1.8, 0.6, 2.7)

  scene = new THREE.Scene()

  new GLTFLoader().setPath('models/v2/').load('02.gltf', async function (gltf) {
    const model = gltf.scene

    // wait until the model can be added to the scene without blocking due to shader compilation

    await renderer.compileAsync(model, camera, scene)

    scene.add(model)

    render()
  })

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1
  container.appendChild(renderer.domElement)

  const environment = new RoomEnvironment(renderer)
  const pmremGenerator = new THREE.PMREMGenerator(renderer)

  scene.background = new THREE.Color(0xbbbbbb)
  scene.environment = pmremGenerator.fromScene(environment).texture

  controls = new OrbitControls(camera, renderer.domElement)
  controls.addEventListener('change', render) // use if there is no animation loop
  controls.minDistance = 3
  controls.maxDistance = 3
  controls.target.set(0, 0, -0.2)
  controls.update()

  window.addEventListener('resize', onWindowResize)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)

  render()
}

function render() {
  renderer.render(scene, camera)
}

onMounted(() => {
  init()
})

onUnmounted(() => {
  renderer.setAnimationLoop(null)
  window.removeEventListener('resize', onWindowResize)
})
</script>

<template></template>
