<script setup>
  import { computed, ref, watchEffect } from "vue";
  import { useRoute, useRouter } from "vue-router";

  const route = useRoute();
  const router = useRouter();

  const tab = ref(0);
  const show = computed(() => {
    return ["/", "/home", "/setting"].includes(route.path);
  });
  watchEffect(() => {
    tab.value = route.fullPath === "/setting" ? 1 : 0;
  });

  const changTab = () => {
    router.push(tab.value ? "/setting" : "/");
  };
</script>

<template>
  <var-bottom-navigation
    border
    safe-area
    fixed
    active-color="orange"
    v-model:active="tab"
    v-show="show"
    @change="changTab"
  >
    <var-bottom-navigation-item label="主页" :icon="`home${tab === 0 ? '' : '-outline'}`" />
    <var-bottom-navigation-item label="设置" :icon="`cog${tab === 1 ? '' : '-outline'}`" />
  </var-bottom-navigation>
</template>
