<script setup>
  import { ActionSheet, Snackbar } from "@varlet/ui";
  import { useMainStore } from "../stores/main";
  import { ref } from "vue";
  const mainStore = useMainStore();

  const chooseUnlockItem = async () => {
    if (mainStore.unlock.status) {
      return;
    }
    const item = await ActionSheet({
      title: "请选择解锁时长",
      actions: [
        {
          name: "已有解锁码",
          value: 0,
          icon: "check",
        },
        {
          name: "一支布丁（天）",
          value: "2",
          icon: "https://api.iconify.design/streamline:food-ice-cream-1-cook-frozen-bite-popsicle-cream-ice-cooking-nutrition-freezer-cold-food.svg",
        },
        {
          name: "一杯奶茶（周）",
          value: "10",
          icon: "https://api.iconify.design/streamline:food-drinks-cocktail-shaker-alcohol-drink-mix-shake-cocktail.svg",
        },
        {
          name: "一顿快餐（月）",
          value: "40",
          icon: "https://api.iconify.design/ion:fast-food-outline.svg",
        },
      ],
    });
    if (item === "close") {
      Snackbar({
        type: "info",
        content: "已取消解锁",
      });
    } else {
      if (item.value === 0) {
        checkDialogShow.value = true;
      } else {
        if (!mainStore.appInfo.alipayUserId) {
          Snackbar({
            type: "error",
            content: "解锁渠道已失效，应用或不可用",
          });
          return;
        }
        window._autoxjs_.evaluate(`unlockApp("${mainStore.appInfo.alipayUserId}", ${item.value})`, () => {
          mainStore.globalLoading = true;
        });
      }
    }
  };

  const checkDialogShow = ref(false);
  const checkUnlockCode = ref("");
  const checkUnlockCodeFun = (action, done) => {
    if (action === "confirm") {
      if (!checkUnlockCode.value.trim()) {
        Snackbar({
          type: "warning",
          content: "解锁码不能为空",
        });
        return;
      }
      mainStore.validateExpires(checkUnlockCode.value, true);
    }
    done();
  };

  const openAppActivity = (activity) => {
    if (activity && window._autoxjs_) {
      window._autoxjs_.evaluate(`app.startActivity("${activity}")`);
    }
  };

  const exitApp = () => {
    if (window._autoxjs_) {
      window._autoxjs_.evaluate(`exitApp()`);
    }
  };
</script>

<template>
  <main>
    <var-paper :elevation="2" :radius="8">
      <var-cell border ripple icon="warning" title="软件说明" @click="mainStore.appNoticeType = 'intro'"></var-cell>
      <var-cell border ripple title="解锁状态" :description="mainStore.unlock.desc" @click="chooseUnlockItem">
        <template #icon>
          <SvgIcon :name="mainStore.unlock.status ? 'unlock' : 'lock'" size="5.333333vw"></SvgIcon>
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
      <var-cell border ripple title="退出" @click="exitApp">
        <template #icon>
          <SvgIcon name="exit" size="5.333333vw"></SvgIcon>
        </template>
      </var-cell>
    </var-paper>
    <var-dialog
      title="已有解锁码"
      v-model:show="checkDialogShow"
      confirm-button-text="解锁"
      @before-close="checkUnlockCodeFun"
    >
      <var-input placeholder="请输入解锁码" clearable v-model="checkUnlockCode" />
    </var-dialog>
  </main>
</template>

<style lang="scss" scoped>
  .svg-icon {
    margin-right: 8px;
  }
</style>
