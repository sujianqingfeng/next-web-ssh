'use client'

import { connect, upload } from './actions'
import { supabase } from '@/lib/supabase'
import Header, { SSHConfig } from './_components/Header'
import Terminal, { TerminalRef } from './_components/Terminal'
import { useRef, useState } from 'react'
import { type RealtimeChannel } from '@supabase/supabase-js'

export default function Home() {
  const channelRef = useRef<null | RealtimeChannel>(null)
  const terminalRef = useRef<TerminalRef | null>(null)
  const [sshConnected, setSSHConnected] = useState(false)
  const channelNameRef = useRef<string | null>(null)

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
  }

  const onConnect = async (config: SSHConfig) => {
    const { channelName } = await connect(config, channelNameRef.current)
    channelNameRef.current = channelName
    console.log('🚀 ~ onConnect ~ channelName:', channelName)

    channelRef.current?.unsubscribe()

    const channel = supabase.channel(channelName)
    channel.subscribe((status) => {
      console.log(status)
      if (status !== 'SUBSCRIBED') {
        return
      }
      terminalRef.current?.clear()
      channelRef.current = channel
      setSSHConnected(true)

      channel.on('broadcast', { event: 'shell_output' }, (data) => {
        console.log('🚀 ~ .on ~ payload:', data.payload)
        terminalRef.current?.write(data.payload)
      })
    })
  }

  const sendShellInput = (text: string) => {
    if (!channelRef.current) {
      return
    }

    channelRef.current.send({
      type: 'broadcast',
      event: 'shell_input',
      payload: text
    })
  }

  const onKey = (key: string, domEvent: KeyboardEvent) => {
    switch (domEvent.key) {
      default:
        sendShellInput(key)
        break
    }
  }

  const onPaste = (text: string) => {
    sendShellInput(text)
  }

  return (
    <main className="flex min-h-screen flex-col">
      <Header
        onFileChange={onFileChange}
        onConnect={onConnect}
        sshConnected={sshConnected}
      />
      <div className="flex-auto relative">
        <div className="absolute top-0 left-0 w-full h-full">
          <Terminal ref={terminalRef} onKey={onKey} onPaste={onPaste} />
        </div>
      </div>
    </main>
  )
}
