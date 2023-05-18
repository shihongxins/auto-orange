<script setup>
  import { useMainStore } from "../stores";
  const mainStore = useMainStore();

  const openAppActivity = (activity) => {
    if (activity && window._autoxjs_) {
      window._autoxjs_.evaluate(`app.startActivity("${activity}")`);
    } else {
      console.log(activity, window._autoxjs_);
    }
  };
</script>

<template>
  <main>
    <var-paper :elevation="2" :radius="8">
      <var-cell border ripple icon="warning" title="软件说明" @click="mainStore.showInstructions = true"></var-cell>
      <var-cell border ripple title="解锁状态" description="未解锁">
        <template #icon>
          <SvgIcon name="lock" size="5.333333vw"></SvgIcon>
        </template>
      </var-cell>
      <var-cell
        border
        ripple
        icon="file-document-outline"
        title="运行日志"
        @click="openAppActivity('console')"
      ></var-cell>
      <var-cell border ripple icon="cog" title="高级设置" @click="openAppActivity('settings')"></var-cell>
    </var-paper>
  </main>
</template>

<style lang="scss" scoped>
  .svg-icon {
    margin-right: 8px;
  }
</style>
