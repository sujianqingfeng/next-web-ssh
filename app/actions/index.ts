'use server'

import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function connect() {
  console.log('---connection---------')

  const channel = supabase.channel('test')

  channel
    .on('broadcast', { event: 'hello' }, (payload) => {
      console.log('🚀 ~ channel.on ~ payload:', payload)
    })
    .subscribe((status) => {
      console.log('🚀 ~ channel.subscribe ~ status:', status)
    })

  cookies().set('channel', 'test', { maxAge: 60 * 60 })
}
