import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  PMREMGenerator,
  LoadingManager,
  LinearToneMapping
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
  var loadManager
  var loadingElem
  var progressBarElem
  var percentElem
  var isError = true

  function init(version) {
    canvas = document.getElementById('card')
    canvas.style.backgroundColor = 'transparent'

    renderer = new WebGLRenderer({ antialias: true, canvas, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerWidth * 0.67)
    renderer.setAnimationLoop(render)
    renderer.toneMapping = LinearToneMapping
    renderer.toneMappingExposure = 1

    camera = new PerspectiveCamera(setPosition().fov, 3 / 2, 0.25, 200)
    camera.position.set(...setPosition().cameraPosition)

    scene = new Scene()

    loadManager = new LoadingManager()

    loadingElem = document.querySelector('#loading')
    progressBarElem = loadingElem.querySelector('.progressbar')
    percentElem = loadingElem.querySelector('.percent')

    loadManager.onLoad = (text) => {
      console.log('load -> ', text)
      if (isError) {
        setTimeout(() => {
          loadingElem.style.display = 'none'
          scene.add(model)
        }, 500)
      } else {
        const overlayElem = loadingElem.querySelector('.overlay')
        const progressElem = loadingElem.querySelector('.progress')
        overlayElem.style.filter = 'blur(0)'
        progressElem.style.display = 'none'
      }
    }

    loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
      const progress = itemsLoaded / itemsTotal
      nextTick(() => {
        progressBarElem.style.transform = `scaleX(${progress})`
        percentElem.innerHTML = `${Math.round(progress * 100)} %`
      })
    }

    loadManager.onError = (e) => {
      isError = false
    }

    new GLTFLoader(loadManager).load(version, function (gltf) {
      gltf.scene.traverse((o) => {
        if (o.isMesh) {
          o.material.roughness = 0.35
          o.material.metalness = 1
        }
      })
      model = gltf?.scene
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
      cameraPosition = [-0.2, -0.6, 2]
      targetPostion = [0, 0, 0]
      progressBarPosition = (window.innerWidth * 0.67) / 2 - 50 + 'px'
    } else {
      fov = 60
      cameraPosition = [0.68, -0.9, 2.9]
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
  }

  function render() {
    if (!isTouch && loadingElem.style.display == 'none' && model) {
      model.rotation.y += 0.009
    }

    renderer.render(scene, camera)
  }

  onMounted(() => {
    const versions = {
      v2: 'models/v2/02.gltf',
      v3: 'models/v3/444.gltf',
      v4: 'models/v4/888.gltf',
      error: 'models/v4/889.gltf'
    }
    const urlParams = new URLSearchParams(window.location.search)
    const version = urlParams.get('version') || 'v4'
    init(versions[version])

    canvas.addEventListener('touchstart', (e) => {
      isTouch = true
    })
    canvas.addEventListener('touchmove', (e) => {
      isTouch = true
    })
    canvas.addEventListener('touchend', () => {
      isTouch = false
    })
  })
  onUnmounted(() => {
    renderer.setAnimationLoop(null)
    window.removeEventListener('resize', onWindowResize)
  })
}
