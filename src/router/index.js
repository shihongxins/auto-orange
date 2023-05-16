import { createRouter, createWebHistory } from "vue-router";
import HomePage from "@/pages/HomePage.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      alias: "/home",
      component: HomePage,
    },
    {
      path: "/setting",
      component: () => import("../pages/SettingPage.vue"),
    },
    {
      path: "/dy_groups_tasks",
      component: () => import("../pages/DYGroupsTasks.vue"),
    },
  ],
});
