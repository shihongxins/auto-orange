<script setup>
  import { useMainStore } from "../stores/main";
  const mainStore = useMainStore();

  const relink = () => {
    location.reload();
  };

  const uninstall = () => {
    if (window._autoxjs_) {
      window._autoxjs_.evaluate(`uninstallApp()`);
    }
  };

  const update = () => {
    if (window._autoxjs_) {
      console.log(mainStore.appInfo);
      window._autoxjs_.evaluate(
        `
          app.startActivity({
            action: "android.intent.action.VIEW",
            data: "${mainStore.appInfo.downloadUrl}"
          });
        `
      );
    }
  };
</script>

<template>
  <!-- 通讯未连接 -->
  <var-popup v-if="'unlink' === mainStore.appNoticeType" :close-on-click-overlay="false" :show="true">
    <var-result class="instructions" type="error" title="错误" description="通讯未连接">
      <template #footer>
        <var-button type="danger" @click="relink">重新链接</var-button>
      </template>
    </var-result>
  </var-popup>
  <!-- 不可用 -->
  <var-popup
    v-if="['unusable', 'error'].includes(mainStore.appNoticeType)"
    :close-on-click-overlay="false"
    :show="true"
  >
    <var-result class="instructions" type="error" title="错误" description="未知错误，已停止服务，应用不可继续使用">
      <template #footer>
        <var-button type="danger" @click="uninstall">卸载此应用</var-button>
      </template>
    </var-result>
  </var-popup>
  <!-- 升级 -->
  <var-popup v-if="'update' === mainStore.appNoticeType" :close-on-click-overlay="false" :show="true">
    <var-result class="instructions" type="question" title="升级" description="检测到更新版本，请立即下载更新">
      <template #footer>
        <var-button type="info" @click="update">下载更新</var-button>
      </template>
    </var-result>
  </var-popup>
  <!-- 软件说明 -->
  <var-popup v-if="'intro' === mainStore.appNoticeType" :close-on-click-overlay="false" :show="true">
    <var-result class="instructions" type="warning" title="使用说明警告">
      <template #description>
        <div>
          本软件仅用于作者学习测试开发使用，不用做其他行为，资源内容均来自互联网，其他人员使用方式（或修改本软件）与本软件原作者无关，继续使用表示同意自行承担责任！！！
          <var-button block text type="primary" @click="uninstall">不同意请立即卸载此软件</var-button>
        </div>
      </template>
      <template #footer>
        <var-button type="warning" @click="mainStore.appNoticeType = 'hidden'">我已阅读并知晓</var-button>
      </template>
    </var-result>
  </var-popup>
</template>

<style lang="scss" scoped>
  .instructions {
    width: 80vw;
  }
</style>
