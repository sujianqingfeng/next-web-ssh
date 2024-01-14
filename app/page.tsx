'use client'

import { connect } from './actions'
import { supabase } from '@/lib/supabase'
import { useCookies } from '@/hooks/use-cookies'
import Header from './_components/Header'
import Terminal from './_components/Terminal'

export default function Home() {
  const { getCookie } = useCookies()

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
  }

  const onConnect = async () => {
    console.log('click')
    await connect()

    const channelName = getCookie('channel')
    console.log('🚀 ~ onConnect ~ channelName:', channelName)

    const channel = supabase.channel('test')
    channel.subscribe((status) => {
      console.log(status)
      if (status !== 'SUBSCRIBED') {
        return
      }

      channel.send({
        type: 'broadcast',
        event: 'hello',
        payload: { message: 'hello', file: new File(['fff'], 'test.txt') }
      })
    })
  }

  return (
    <main className="flex min-h-screen flex-col">
      <Header onFileChange={onFileChange} onConnect={onConnect} />
      <div className="flex-auto relative">
        <div className="absolute top-0 left-0 w-full h-full">
          <Terminal />
        </div>
      </div>
    </main>
  )
}
