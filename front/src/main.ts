import {createApp} from 'vue'
import {createRouter, createWebHistory} from 'vue-router'

import routes from './routes/web'
import App from "./App.vue";
import './index.css'

interface ImportMetaEnv {
    VITE_APP_SERVER_URL: string
    // more env variables...
}
declare global {
    const serverRoute: string;
}


const router = createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: createWebHistory(),
    routes, // short for `routes: routes`
})
const app = createApp(App)

// app.config.globalProperties.$serverName  = import.meta.env.VITE_APP_SERVER_URL
app.provide('serverName', import.meta.env.VITE_APP_SERVER_URL)

app.use(router)

app.mount('#app')
