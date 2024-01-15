'use server'

import { supabase } from '@/lib/supabase'
import { connectClient, clientShell } from '@/utils/ssh'
import type { SSHConfig } from '../_components/Header'
import { RealtimeChannel } from '@supabase/supabase-js'
let count = 0

const channelMap = new Map<string, RealtimeChannel>()

export async function connect(
  config: SSHConfig,
  channelName: string | null = null
) {
  console.log('---connection---------')
  console.log('🚀 ~ connect ~ config:', config)

  channelName = channelName || `channel-${count++}`

  console.log('🚀 ~ connect ~ channelName:', channelName)
  channelMap.get(channelName)?.unsubscribe()

  const client = await connectClient(config)
  const channel = supabase.channel(channelName)
  const steam = await clientShell(client)

  channel
    .on('broadcast', { event: 'shell_input' }, async (data) => {
      console.log('🚀 shell_input', data.payload)
      steam.write(data.payload)
    })
    .subscribe(async (status) => {
      console.log('🚀 ~ channel.subscribe ~ status:', status)
      if (status !== 'SUBSCRIBED') {
        return
      }

      channelMap.set(channelName!, channel)

      steam.on('data', (data: Buffer) => {
        const text = data.toString()
        console.log('🚀 ~ steam.on ~ data:', text)
        channel.send({
          type: 'broadcast',
          event: 'shell_output',
          payload: text
        })
      })
    })

  return {
    channelName
  }
}
