import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
})

export default api