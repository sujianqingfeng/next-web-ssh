'use server'

import { supabase } from '@/lib/supabase'

export async function connect() {
  console.log('---connection---------')

  const channel = supabase.channel('test')

  channel.subscribe((status) => {
    console.log('🚀 ~ channel.subscribe ~ status:', status)
  })
}
