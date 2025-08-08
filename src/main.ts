import { createApp } from 'vue'
import App from './app/App.vue'
import pinia from './app/store'

const app = createApp(App)

app.use(pinia)
app.mount('#app')
