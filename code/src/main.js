import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from "./server/router.js"
import store from './server/store.js'; // Import the store

const app = createApp(App);
app.use(router);
app.use(store);

app.mount('#app')
