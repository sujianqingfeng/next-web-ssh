import { Client, type ClientChannel, type ConnectConfig } from 'ssh2'

export function connectClient(config: ConnectConfig) {
  return new Promise<Client>((resolve, reject) => {
    const client = new Client()
    client.on('error', (err) => {
      reject(err)
    })
    client.on('ready', () => {
      resolve(client)
    })
    client.connect(config)
  })
}

export function clientShell(client: Client) {
  return new Promise<ClientChannel>((resolve, reject) => {
    client.shell((err, stream) => {
      if (err) {
        reject(err)
      }
      resolve(stream)
    })
  })
}
