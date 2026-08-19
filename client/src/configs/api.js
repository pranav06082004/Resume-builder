import axios from 'axios'

// For development (Vite proxy), use relative paths
// For production, use VITE_BASE_URL
const baseURL = import.meta.env.VITE_BASE_URL || ''

const api = axios.create({
    baseURL: baseURL
})

export default api
