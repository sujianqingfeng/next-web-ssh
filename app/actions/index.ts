'use server'

import { supabase } from '@/lib/supabase'
import { connectClient, clientShell } from '@/utils/ssh'
import type { SSHConfig } from '../(ssh)/_components/Header'
import { RealtimeChannel } from '@supabase/supabase-js'
import type { ClientChannel } from 'ssh2'

let count = 0

const channelMap = new Map<
  string,
  {
    channel: RealtimeChannel
    steam: ClientChannel
  }
>()

export async function connect(
  config: SSHConfig,
  channelName: string | null = null
) {
  channelName = channelName || `channel-${count++}`

  console.log('🚀 ~ connect ~ channelName:', channelName)
  const prev = channelMap.get(channelName)
  if (prev) {
    prev.channel.unsubscribe()
    prev.steam.close()
  }

  const client = await connectClient(config)
  const channel = supabase.channel(channelName)

  channel.subscribe(async (status) => {
    console.log('🚀 ~ channel.subscribe ~ status:', status)
    if (status !== 'SUBSCRIBED') {
      return
    }

    const steam = await clientShell(client)

    channelMap.set(channelName!, {
      channel,
      steam
    })

    steam.on('data', (data: Buffer) => {
      const text = data.toString()
      console.log('🚀 ~ steam.on ~ data:', text)
      channel.send({
        type: 'broadcast',
        event: 'shell_output',
        payload: text
      })
    })

    channel.on('broadcast', { event: 'shell_input' }, async (data) => {
      console.log('🚀 shell_input', data.payload)
      steam.write(data.payload)
    })
  })

  return {
    channelName
  }
}

export async function upload(params: any) {
  console.log('🚀 ~ any:', params)
}
