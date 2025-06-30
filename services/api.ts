import axios from 'axios'
import useAuthStore from '../stores/auth-store'

const axiosAPI = axios.create({
  baseURL: "https://backend.galerynavila.store",
})

axiosAPI.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default axiosAPI;