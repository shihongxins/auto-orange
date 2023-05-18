import { createApp } from "vue";
import { router } from "./router";
import { createPinia } from "pinia";
import App from "./App.vue";
import "normalize.css";
import "./assets/styles/main.scss";

import "virtual:svg-icons-register";
import svgIDs from "virtual:svg-icons-names";
console.log("loaded svg icons", svgIDs);
import SvgIcon from "./components/SvgIcon.vue";

const app = createApp(App);

app.use(router);
app.use(createPinia());

app.component("svg-icon", SvgIcon);

app.mount("#app");

window.$vm = app;
