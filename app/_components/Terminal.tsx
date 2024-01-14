import { useEffect, useRef } from 'react'
import { Terminal as XTerminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'

export default function Terminal() {
  const xtermRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    xtermRef.current!.innerHTML = ''
    const terminal = new XTerminal()
    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)

    terminal.open(xtermRef.current!)
    fitAddon.fit()

    terminal.onKey((event) => {
      console.log('🚀 ~ file: index.tsx:73 ~ disposable ~ event:', event)
      const { domEvent, key } = event

      switch (domEvent.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          break

        default:
          // socket.emit('command', key)
          break
      }
    })

    terminal.attachCustomKeyEventHandler((event) => {
      if (event.type === 'keydown' && event.key === 'v' && event.ctrlKey) {
        navigator.clipboard.readText().then((text) => {
          // socket.emit('command', text)
        })
        return false
      }
      return true
    })
  }, [])

  return <div className="h-full" id="terminal" ref={xtermRef}></div>
}
