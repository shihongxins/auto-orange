import { createRouter, createWebHashHistory } from "vue-router";
import { useMainStore } from "../stores/main";
import HomePage from "@/pages/HomePage.vue";

export const router = createRouter({
  history: createWebHashHistory(),
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

router.beforeEach(() => {
  const mainStore = useMainStore();
  mainStore.validateExpires();
});
