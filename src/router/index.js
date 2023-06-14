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
      meta: {
        theme: {
          color: "#ffa500",
        },
      },
    },
    {
      path: "/setting",
      component: () => import("../pages/SettingPage.vue"),
      meta: {
        theme: {
          color: "#ffa500",
        },
      },
    },
    {
      path: "/dy_groups_tasks",
      component: () => import("../pages/DYGroupsTasks.vue"),
      meta: {
        theme: {
          color: "#ffa500",
        },
      },
    },
  ],
});

router.beforeEach((to) => {
  const mainStore = useMainStore();
  mainStore.validateExpires();
  if (to.meta?.theme?.color) {
    setAppStatusBarColor(to.meta?.theme?.color);
  }
});

function setAppStatusBarColor(hexColor) {
  if (window._autoxjs_ && hexColor) {
    setTimeout(() => {
      window._autoxjs_.evaluate(
        `
          ui.statusBarColor("${hexColor}");
        `
      );
    }, 0);
  }
}

setAppStatusBarColor("#ffa500");
