import axios from "axios";

const portaApi = '5279'

// Declarar o ip da maquina
const ip = '172.16.39.112'

// Definir a base da url de acessos da api:
const apiUrlLocal = `http://${ip}:${portaApi}/api`

// Configurar o axios
const api = axios.create({
    baseURL : apiUrlLocal
})

export default api