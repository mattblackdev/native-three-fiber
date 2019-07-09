import React from 'react'
import { SceneContext } from '../components/Scene'

export default function useRender(cb: () => void, deps: [] = []) {
  const state = React.useContext(SceneContext)
  React.useEffect(() => {
    const { subscribers } = state.current
    subscribers.push(cb)
    return () => (state.current.subscribers = subscribers.filter(i => i !== cb))
  }, deps)
}
