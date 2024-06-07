import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  ACESFilmicToneMapping,
  PMREMGenerator,
  LoadingManager
} from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment'
import { nextTick, onMounted, onUnmounted } from 'vue'

export function useThreeRenderer() {
  var camera
  var scene
  var renderer
  var controls
  var canvas
  var model
  var isTouch
  var actionID
  var loadManager
  var loadingElem
  var progressBarElem

  function init() {
    canvas = document.getElementById('card')
    canvas.style.backgroundColor = 'transparent'

    renderer = new WebGLRenderer({ antialias: true, canvas, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerWidth * 0.67)
    renderer.toneMapping = ACESFilmicToneMapping
    renderer.toneMappingExposure = 1

    camera = new PerspectiveCamera(setPosition().fov, 3 / 2, 0.25, 200)
    camera.position.set(...setPosition().cameraPosition)

    scene = new Scene()

    loadManager = new LoadingManager()

    loadingElem = document.querySelector('#loading')
    progressBarElem = loadingElem.querySelector('.progressbar')

    loadManager.onLoad = () => {
      setTimeout(() => {
        loadingElem.style.display = 'none'
        scene.add(model)
      }, 500)
    }

    loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
      const progress = itemsLoaded / itemsTotal
      nextTick(() => {
        progressBarElem.style.transform = `scaleX(${progress})`
      })
    }

    new GLTFLoader(loadManager).load('models/v2/02.gltf', function (gltf) {
      model = gltf.scene
    })

    const environment = new RoomEnvironment(renderer)
    const pmremGenerator = new PMREMGenerator(renderer)

    scene.environment = pmremGenerator.fromScene(environment).texture

    controls = new OrbitControls(camera, canvas)
    controls.addEventListener('change', render) // use if there is no animation loop
    controls.minDistance = 3
    controls.maxDistance = 3
    controls.target.set(...setPosition().targetPostion)
    controls.touches.TWO = null
    controls.update()

    window.addEventListener('resize', onWindowResize)
    requestAnimationFrame(render)
  }

  function setPosition() {
    var fov, cameraPosition, targetPostion, progressBarPosition

    if (window.innerWidth < 1600) {
      fov = 38
      cameraPosition = [-0.1, -0.6, 2]
      targetPostion = [0, 0, 0]
      progressBarPosition = (window.innerWidth * 0.67) / 2 - 50 + 'px'
    } else {
      fov = 60
      cameraPosition = [-0.1, 0, 2]
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

  function onWindowResize() {
    camera.fov = setPosition().fov
    camera.position.set(...setPosition().cameraPosition)
    camera.updateProjectionMatrix()

    controls.target.set(...setPosition().targetPostion)
    controls.update()

    renderer.setSize(window.innerWidth, window.innerWidth * 0.67)

    render()
  }

  function render() {
    if (!isTouch && loadingElem.style.display == 'none') {
      // if (model && model.rotation) {
      model.rotation.y += 0.007
      // }
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
}
