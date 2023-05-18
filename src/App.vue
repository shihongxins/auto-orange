<script setup>
  import TabBar from "./components/TabBar.vue";
  import { useMainStore } from "./stores";
  const mainStore = useMainStore();
  const uninstall = () => {
    if (window._autoxjs_) {
      window._autoxjs_.evaluate(`uninstallApp()`);
    }
  };
</script>

<template>
  <!-- 软件说明 -->
  <var-popup v-model:show="mainStore.showInstructions">
    <var-result class="instructions" type="warning" title="使用说明警告">
      <template #description>
        <div>
          本软件仅用于作者学习测试开发使用，不用做其他行为，资源内容均来自互联网，其他人员使用方式（或修改本软件）与本软件原作者无关，继续使用表示同意自行承担责任！！！
          <var-button block text type="primary" @click="uninstall">不同意请立即卸载此软件</var-button>
        </div>
      </template>
      <template #footer>
        <var-button type="warning" @click="mainStore.showInstructions = false">我已阅读并知晓</var-button>
      </template>
    </var-result>
  </var-popup>
  <router-view></router-view>
  <TabBar></TabBar>
</template>

<style lang="scss" scoped>
  .instructions {
    width: 80vw;
  }
</style>
