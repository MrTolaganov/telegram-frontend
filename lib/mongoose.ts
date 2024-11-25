import { connect, set } from 'mongoose'

let connected: boolean = false

export async function connectDatabase() {
  set('strictQuery', true)

  if (!process.env.MONGODB_URI) return console.error('MongoDB URI is not defined')

  if (connected) return

  try {
    await connect(process.env.MONGODB_URI, { autoCreate: true })
    connected = true
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.log(`Error connecting database: ${error}`)
  }
}
