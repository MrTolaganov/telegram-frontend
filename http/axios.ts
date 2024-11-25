import axios from 'axios'

export const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL

export const $axios = axios.create({
  baseURL: BASE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})
