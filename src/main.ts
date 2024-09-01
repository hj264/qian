import './assets/main.css'

import {createApp} from 'vue'
import './style.css'
import "./assets/style.css";
import App from './App.vue'
import router from './router'

//@ts-ignore
import {setupI18n} from "@/assets/i18n";

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import Vant from 'vant';
import 'vant/lib/index.css';


const app = createApp(App)

// 浏览器语言
// @ts-ignore
let browserLanguage: string = navigator.language || navigator.userLanguage;
browserLanguage = browserLanguage.replace("-", "_")
browserLanguage = browserLanguage.toLowerCase() // 转为小写

//系统预设的语种
let defaultLanguage = ["de","hk", "tw", "th", "en", "zh", "lo", "ja", "ko", "es", "km"].filter((elem) => browserLanguage.includes(elem))[0] || "en";

// 以下情况认为是英文
if (browserLanguage == 'en_hk' || browserLanguage == 'en_us' || browserLanguage == 'en_gb') {
    defaultLanguage = 'en'
}

// 以下情况认为是繁体
if (browserLanguage == 'zh_tw' || browserLanguage == 'zh_hk') {
    defaultLanguage = 'hk'
}
// 以下情况认为是西班牙语
if (browserLanguage == 'es_es' || browserLanguage == 'es_mx' || browserLanguage == 'es_ar') {
    defaultLanguage = 'es'
}

// 以下情况认为是高棉语
if (browserLanguage == 'khm' || browserLanguage == 'km') {
    defaultLanguage = 'km'
}


// 缓存语种
localStorage.setItem("language", defaultLanguage)

async function initializeApp() {
    const i18n = await setupI18n(defaultLanguage);
    app.use(i18n)
    app.use(Vant)
    app.use(ElementPlus)
    app.use(router)
    app.mount('#app')
}

initializeApp().then(r => {
});

