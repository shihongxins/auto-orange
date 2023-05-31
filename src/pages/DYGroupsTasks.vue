<script setup>
  import { ref, reactive, onMounted, onUnmounted } from "vue";
  import { useRouter } from "vue-router";
  import { assignCommonProperty } from "@shihongxins/jsutils";
  import MonitorKeyboard from "../utils/MonitorKeyboard";
  import { fixVritualKeyboardHiddenScroll } from "../utils/index";
  import { useMainStore } from "../stores/main";
  import { Dialog } from "@varlet/ui";

  const monitorKeybord = ref(null);

  const router = useRouter();

  const config = reactive({
    groupName: "",
    groups: [],
    selectedGroups: [],
    sleepTime: 2,
    randomComments: "",
    enableCopyComment: false,
    enableLimitTime: false,
    runtime: "10",
  });

  onMounted(() => {
    const m = new MonitorKeyboard();
    m.onStart();
    m.onShow(() => {});
    m.onHidden(() => {
      fixVritualKeyboardHiddenScroll();
    });
    monitorKeybord.value = m;
    let _cfg = {};
    try {
      _cfg = JSON.parse(localStorage.getItem("DYGroupsTasks") || "{}");
    } catch (error) {
      console.error(error);
    }
    if (_cfg && _cfg) {
      assignCommonProperty(config, _cfg);
    }
  });
  onUnmounted(() => {
    monitorKeybord.value.onEnd();
  });

  const handleNewGroup = () => {
    const { groups, groupName } = config;
    groups.push(groupName);
    config.groups = [...new Set(groups)];
    config.groupName = "";
  };

  const handleStartDYGroupsTasks = async () => {
    localStorage.setItem("DYGroupsTasks", JSON.stringify(config));
    const mainStore = useMainStore();
    const status = await mainStore.validateExpires("", true);
    if (status === "success") {
      window._autoxjs_.evaluate(
        `
        execRemoteFun("https://shihongxins.surge.sh/tiktok.coffee", "群聊活跃度", ${JSON.stringify(config)});
        `
      );
    } else {
      Dialog({
        title: "提示",
        message: `应用解锁状态：${mainStore.unlock.desc} ，请转到设置进行解锁`,
        onClosed() {
          router.push("/setting");
        },
      });
    }
  };
</script>

<template>
  <var-app-bar
    style="z-index: 9999"
    title="抖音-群聊活跃度"
    title-position="center"
    safe-area-top
    color="linear-gradient(90deg, orange 0%, orangered 100%)"
  >
    <template #left>
      <var-button text round @click="router.push('/')">
        <var-icon name="chevron-left" :size="24" />
      </var-button>
    </template>
  </var-app-bar>
  <main style="overflow: hidden auto">
    <var-paper :elevation="2" :radius="8">
      <var-space direction="column" size="large">
        <div class="form-item">
          <span>新增群聊</span>
          <var-input placeholder="请输入新增备选群聊名称" v-model.trim="config.groupName">
            <template #append-icon>
              <var-button size="mini" :disabled="config.groupName === ''" @click="handleNewGroup"> 保存 </var-button>
            </template>
          </var-input>
        </div>
        <div class="form-item">
          <span>选择群聊</span>
          <var-select
            placeholder="请选择要操作的群聊"
            chip
            multiple
            v-model="config.selectedGroups"
            :disabled="config.groups.length === 0"
          >
            <var-option v-for="group in config.groups" :key="group" :label="group"></var-option>
          </var-select>
        </div>
        <div class="form-item">
          <span>响应延时</span>
          <var-slider v-model="config.sleepTime" :min="3" :max="10" :step="0.5" />
        </div>
        <div class="form-item">
          <span>随机评论</span>
          <br />
          <var-input
            style="margin-top: 0.5em"
            placeholder="请输入备选随机评论（换行分割）"
            variant="outlined"
            textarea
            resize
            clearable
            v-model="config.randomComments"
          />
        </div>
        <div class="form-item">
          <var-checkbox v-model="config.enableCopyComment">启用复制评论</var-checkbox>
        </div>
        <div class="form-item">
          <div style="display: flex; align-items: center">
            <var-checkbox v-model="config.enableLimitTime">定时结束</var-checkbox>
            <var-input
              style="flex: 1 1 50%"
              v-model="config.runtime"
              placeholder="请设定运行时长（分钟）"
              :disabled="!config.enableLimitTime"
            />
            <span>分钟</span>
          </div>
        </div>
        <div class="form-item">
          <var-button type="warning" block @click="handleStartDYGroupsTasks">开始</var-button>
        </div>
      </var-space>
    </var-paper>
  </main>
</template>

<style lang="scss" scoped>
  .var-app-bar {
    position: fixed;
    top: 0;
  }
  main {
    padding-top: 64px;
  }
  .var-paper {
    padding: 10px;
  }
</style>
