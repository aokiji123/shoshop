import axios from 'axios'

const headers: Record<string, string> = {
  Accept: 'application/json',
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_DOTNET_API_URL,
  headers,
})

export default axiosInstance
