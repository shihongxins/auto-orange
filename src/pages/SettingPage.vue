<script setup>
  import { ref } from "vue";

  const showInstructions = ref(false);

  const openAppActivity = (activity) => {
    console.log(activity, window._autojs_, top._autojs_);
    if (window._auto_) {
      window._auto_.evaluate(`app.startActivity("${activity}")`);
    }
  };
</script>

<template>
  <main>
    <var-paper :elevation="2" :radius="8">
      <var-cell border ripple icon="warning" title="软件说明" @click="showInstructions = true"></var-cell>
      <var-cell border ripple title="解锁状态" description="未解锁">
        <template #icon>
          <SvgIcon name="lock" size="20px"></SvgIcon>
        </template>
      </var-cell>
      <var-cell
        border
        ripple
        icon="file-document-outline"
        title="运行日志"
        @click="openAppActivity('console')"
      ></var-cell>
      <var-cell border ripple icon="cog" title="高级设置" @click="openAppActivity('setting')"></var-cell>
    </var-paper>

    <!-- 软件说明 -->
    <var-popup v-model:show="showInstructions">
      <var-result class="instructions" type="warning" title="使用说明警告">
        <template #description>
          本软件仅用于作者学习使用，不用做其他行为，资源内容均来自互联网，具体使用方式与本软件作者无关！！！
        </template>
        <template #footer>
          <var-button type="warning" @click="showInstructions = false">我已阅读并知晓</var-button>
        </template>
      </var-result>
    </var-popup>
  </main>
</template>

<style lang="scss" scoped>
  .svg-icon {
    margin-right: 8px;
  }
  .instructions {
    width: 80vw;
  }
</style>
