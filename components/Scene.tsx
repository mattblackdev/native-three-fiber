import { Renderer } from 'expo-three'
import React from 'react'
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl'
import { PixelRatio } from 'react-native'
import * as THREE from 'three'
import { render } from 'react-three-fiber'

import useLoop from '../hooks/useLoop'

interface ISceneContext {
  gl?: ExpoWebGLRenderingContext
  renderer?: Renderer
  scene?: THREE.Scene
  camera?: THREE.PerspectiveCamera
  subscribers?: Array<(...args: any[]) => void>
}

export const SceneContext = React.createContext<
  React.MutableRefObject<ISceneContext>
>({ current: {} })

export default function Scene({ children }) {
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
      onLayout={e => {
        if (!ready) return
        const { width, height } = e.nativeEvent.layout
        const { gl, camera, renderer } = state.current
        const scale = PixelRatio.get()

        gl.viewport(0, 0, width * scale, height * scale)
        renderer.setSize(width, height)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
      }}
    />
  )
}
