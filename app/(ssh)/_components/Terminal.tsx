'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { type Terminal } from 'xterm'
import 'xterm/css/xterm.css'

interface TerminalProps {
  onKey: (key: string, domEvent: KeyboardEvent) => void
  onPaste: (text: string) => void
}

export interface TerminalRef {
  write: (text: string) => void
  clear: () => void
}

export default forwardRef<TerminalRef, TerminalProps>(function _Terminal(
  props,
  ref
) {
  const { onKey, onPaste } = props

  const terminalRef = useRef<null | Terminal>(null)
  const xtermRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const start = async () => {
      xtermRef.current!.innerHTML = ''

      const Terminal = (await import('xterm')).Terminal
      const FitAddon = (await import('xterm-addon-fit')).FitAddon

      const terminal = new Terminal()
      const fitAddon = new FitAddon()
      terminal.loadAddon(fitAddon)

      terminalRef.current = terminal
      terminal.open(xtermRef.current!)
      fitAddon.fit()

      terminal.onKey((event) => {
        // console.log('🚀 ~ file: index.tsx:73 ~ disposable ~ event:', event)
        const { domEvent, key } = event
        onKey(key, domEvent)
      })

      terminal.attachCustomKeyEventHandler((event) => {
        if (event.type === 'keydown' && event.key === 'v' && event.ctrlKey) {
          navigator.clipboard.readText().then((text) => {
            onPaste(text)
          })
          return false
        }
        return true
      })
    }

    start()
  }, [onKey, onPaste])

  useImperativeHandle(
    ref,
    () => ({
      write(text: string) {
        terminalRef.current?.write(text)
      },
      clear() {
        terminalRef.current?.clear()
      }
    }),
    []
  )

  return <div className="h-full" id="terminal" ref={xtermRef}></div>
})
