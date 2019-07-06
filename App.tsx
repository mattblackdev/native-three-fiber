import { Renderer } from 'expo-three'
import React from 'react'
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl'
import { PixelRatio } from 'react-native'
import * as THREE from 'three'
import { render } from 'react-three-fiber'

import useLoop from './hooks/useLoop'

interface ISceneContext {
  gl?: ExpoWebGLRenderingContext
  renderer?: Renderer
  scene?: THREE.Scene
  camera?: THREE.PerspectiveCamera
  subscribers?: Array<(...args: any[]) => void>
}

const SceneContext = React.createContext<React.MutableRefObject<ISceneContext>>(
  { current: {} },
)

function useRender(cb: () => void, deps: [] = []) {
  const state = React.useContext(SceneContext)
  React.useEffect(() => {
    const { subscribers } = state.current
    subscribers.push(cb)
    console.warn(`Subscribers: ${subscribers.length}`)
    return () => (state.current.subscribers = subscribers.filter(i => i !== cb))
  }, deps)
}

function Scene({ children }) {
  const state = React.useRef<ISceneContext>({})
  const [ready, setReady] = React.useState(false)

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
    state.current.camera.position.z = 50
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
      <SceneContext.Provider value={state}>{children}</SceneContext.Provider>,
      state.current.scene,
      state,
    )
    setReady(true)
  }, [])

  useLoop(() => {
    const { gl, renderer, subscribers, scene, camera } = state.current
    subscribers.forEach(cb => cb())
    renderer.render(scene, camera)
    gl.endFrameEXP()
  }, ready)

  return (
    <GLView
      onContextCreate={onGLContextCreate}
      style={{ flex: 1 }}
      onTouchEnd={() => {
        setReady(ready => !ready)
      }}
    />
  )
}

function Donut({ position = undefined }) {
  const rotation = React.useRef(0)
  const mesh = React.useRef<THREE.Mesh>()

  useRender(() => {
    const t = rotation.current
    mesh.current.rotation.set(t, t, t)
    rotation.current = t + 0.01
  }, [])

  return (
    <mesh ref={mesh} position={position}>
      <torusGeometry attach="geometry" args={[10, 3, 16, 100]} />
      <meshStandardMaterial
        attach="material"
        color="hotpink"
        metalness={0}
        roughness={1}
      />
    </mesh>
  )
}

function Lights() {
  return (
    <React.Fragment>
      <pointLight position={[-100, 100, -100]} intensity={0.6} />
      <pointLight position={[100, 100, -100]} intensity={0.6} />
      <pointLight position={[-100, -100, -100]} intensity={0.6} />
      <pointLight position={[100, -100, -100]} intensity={0.6} />
      <pointLight position={[-100, 100, 100]} intensity={0.6} />
      <pointLight position={[100, 100, 100]} intensity={0.6} />
      <pointLight position={[-100, -100, 100]} intensity={0.6} />
      <pointLight position={[100, -100, 100]} intensity={0.6} />
    </React.Fragment>
  )
}

export default function App() {
  return (
    <Scene>
      <Donut />
      <Donut position={[-20, 50, -60]} />
      <Donut position={[20, 50, -60]} />
      <Donut position={[-20, -50, -60]} />
      <Donut position={[20, -50, -60]} />
      <Lights />
    </Scene>
  )
}
