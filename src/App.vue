<script setup>
  import TabBar from "./components/TabBar.vue";
  import AppNotification from "./components/AppNotification.vue";
  import { useMainStore } from "./stores/main";

  const mainStore = useMainStore();
  mainStore.validateApp();
</script>

<template>
  <var-loading description="等待应用响应" :loading="!mainStore.appReady">
    <router-view></router-view>
    <TabBar></TabBar>
  </var-loading>
  <AppNotification />
</template>
