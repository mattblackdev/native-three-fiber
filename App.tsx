import { Renderer } from 'expo-three'
import React from 'react'
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl'
import { PixelRatio } from 'react-native'
import * as THREE from 'three'
import { render } from './react-three-fiber/reconciler'

const SceneContext = React.createContext({})

function Scene({ children }) {
  const state = React.useRef<{
    gl?: ExpoWebGLRenderingContext
    renderer?: Renderer
    scene?: THREE.Scene
    camera?: THREE.PerspectiveCamera
    subscribers?: Array<(...args: any[]) => void>
  }>({})
  const [ready, setReady] = React.useState(false)

  const useRender = React.useCallback(cb => {
    React.useEffect(() => {
      const { subscribers } = state.current
      subscribers.push(cb)
      return () =>
        (state.current.subscribers = subscribers.filter(i => i !== cb))
    }, [])
  }, [])

  const onGLContextCreate = React.useCallback(gl => {
    const scale = PixelRatio.get()
    const width = gl.drawingBufferWidth / scale
    const height = gl.drawingBufferHeight / scale

    state.current.renderer = new Renderer({
      gl,
      pixelRatio: scale,
      width,
      height,
    })

    state.current.camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000,
    )
    state.current.camera.position.z = 35
    state.current.scene = new THREE.Scene()
    state.current.subscribers = []
    state.current.gl = gl

    // const geo = new THREE.TorusKnotGeometry(10, 3, 100, 16)
    // const mat = new THREE.MeshBasicMaterial()
    // mat.color = new THREE.Color('hotpink')
    // const mesh = new THREE.Mesh(geo, mat)
    // scene.current.add(mesh)

    state.current.renderer.render(state.current.scene, state.current.camera)
    render(
      <SceneContext.Provider value={{ useRender }}>
        {children}
      </SceneContext.Provider>,
      state.current.scene,
      state,
    )
    setReady(true)
  }, [])

  const loop = React.useCallback(() => {
    if (!ready) return
    const { gl, renderer, subscribers, scene, camera } = state.current
    subscribers.forEach(cb => cb())
    renderer.render(scene, camera)
    gl.endFrameEXP()
    requestAnimationFrame(loop)
  }, [ready])

  React.useEffect(() => {
    if (ready) {
      requestAnimationFrame(loop)
    }
  }, [ready])

  return <GLView onContextCreate={onGLContextCreate} style={{ flex: 1 }} />
}

function TorusKnot() {
  let ref = React.useRef()
  const { useRender } = React.useContext(SceneContext)
  let t = 0
  useRender(() => {
    ref.current.rotation.set(t, t, t)
    t += 0.01
  })
  return (
    <mesh ref={ref}>
      <torusKnotGeometry attach="geometry" args={[10, 3, 100, 16]} />
      <meshBasicMaterial attach="material" color="hotpink" />
    </mesh>
  )
}

export default function App() {
  return (
    <Scene>
      <TorusKnot />
    </Scene>
  )
}
