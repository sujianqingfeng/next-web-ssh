import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { useKeyDown } from '@/hooks/use-key-down'
import { upload } from '../actions'

function parseSSHSchema(schema: string) {
  const splits = schema.split('@')
  if (splits.length !== 2) {
    return {
      username: '',
      password: '',
      hostname: '',
      port: 22
    }
  }

  const [username, password] = splits[0].split(':')
  const [hostname, port] = splits[1].split(':')
  return {
    username,
    password,
    hostname,
    port
  }
}

const sshSchema = z.object({
  username: z.string().trim().min(1, { message: 'username is required' }),
  password: z.string().trim().min(1, { message: 'password is required' }),
  hostname: z.string().trim().min(1, { message: 'hostname is required' }),
  port: z.coerce.number().min(1).max(65535)
})

export type SSHConfig = z.infer<typeof sshSchema>
interface HeaderProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onConnect: (config: SSHConfig) => void
  sshConnected?: boolean
}
export default function Header(props: HeaderProps) {
  const { onFileChange, onConnect, sshConnected = false } = props

  // const [searchParams] = useSearchParams()
  const [schema, setSchema] = useState('dev:dev@127.0.0.1:2222')
  const { toast } = useToast()

  const _onConnect = () => {
    const config = parseSSHSchema(schema)
    const parse = sshSchema.safeParse(config)
    if (!parse.success) {
      const error = parse.error.errors[0]
      toast({
        variant: 'destructive',
        title: error.message
      })
      return
    }

    onConnect(parse.data)
  }

  const { onKeyDown } = useKeyDown('Enter', _onConnect)

  const formRef = useRef<HTMLFormElement>(null)
  const _onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    console.log('🚀 ~ Header ~ file:', file)
    if (!file) {
      return
    }
    formRef.current?.submit()
  }

  const inputRef = useRef<HTMLInputElement>(null)
  const onUpload = () => {
    inputRef.current?.click()
  }

  useEffect(() => {
    if (schema) {
      // _onConnect()
    }
  }, [])

  return (
    <header className="p-2 flex justify-between items-center border-b">
      <div className="text-[30px] font-bold">Web SSH</div>

      <div className="flex justify-center items-center gap-1.5">
        <div className="flex justify-center items-center gap-1.5">
          <Input
            className="w-[300px]"
            placeholder="username:password@hostname:port"
            onChange={(event) => setSchema(event.target.value)}
            defaultValue={schema}
            onKeyDown={onKeyDown}
          />
          <Button disabled={!schema} onClick={_onConnect}>
            Connect
          </Button>
        </div>

        <form action={upload}>
          <Input
            ref={inputRef}
            className="hidden"
            type="file"
            name="file"
            onChange={_onFileChange}
          />
          <Button disabled={!sshConnected} onClick={onUpload}>
            Upload File
          </Button>
        </form>
      </div>
    </header>
  )
}
