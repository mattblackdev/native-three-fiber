import React from 'react'
import Scene from './components/Scene'
import useRender from './hooks/useRender'

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
      <Donut position={[-40, 0, 10]} />
      <Donut position={[40, 0, 10]} />
      <Lights />
    </Scene>
  )
}
