import React from 'react'

class Looper {
  subscribers = []
  loopId = null

  loop = (time: number) => {
    if (this.loopId) {
      this.subscribers.forEach(callback => {
        callback(time)
      })
    }

    this.loopId = requestAnimationFrame(this.loop)
  }

  start() {
    if (!this.loopId) {
      this.loop(0)
    }
  }

  stop() {
    if (this.loopId) {
      cancelAnimationFrame(this.loopId)
      this.loopId = null
    }
  }

  subscribe(callback: (time: number) => void) {
    if (this.subscribers.indexOf(callback) === -1)
      this.subscribers.push(callback)
  }

  unsubscribe(callback: (time: number) => void) {
    this.subscribers = this.subscribers.filter(s => s !== callback)
  }
}

export default function useLoop(
  callback: (time: number) => void,
  invalidate?: boolean,
) {
  const looper = React.useRef(new Looper())

  React.useEffect(() => {
    looper.current.subscribe(callback)
    return () => looper.current.unsubscribe(callback)
  }, [])

  React.useEffect(() => {
    if (invalidate === undefined) return

    if (invalidate) {
      looper.current.start()
    } else {
      looper.current.stop()
    }
  }, [invalidate])

  return looper.current
}
