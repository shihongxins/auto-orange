<script setup>
  import { ref, reactive, onMounted, onUnmounted } from "vue";
  import { useRouter } from "vue-router";
  import { assignCommonProperty } from "@shihongxins/jsutils";
  import MonitorKeyboard from "../utils/MonitorKeyboard";
  import { fixVritualKeyboardHiddenScroll } from "../utils/index";
  import { useMainStore } from "../stores/main";
  import { Dialog, Snackbar } from "@varlet/ui";

  const monitorKeybord = ref(null);

  const router = useRouter();

  const config = reactive({
    groupName: "",
    groups: [],
    selectedGroups: [],
    sleepTime: 3,
    randomComments: "",
    enableCopyComment: false,
    enableSpeedUp: false,
    shortestTime: "15",
    enableLimitTime: false,
    runtime: "10",
  });

  onMounted(async () => {
    const m = new MonitorKeyboard();
    m.onStart();
    m.onShow(() => {});
    m.onHidden(() => {
      fixVritualKeyboardHiddenScroll();
    });
    monitorKeybord.value = m;
    const act = await Dialog({
      title: "提示",
      message:
        "此功能受设备影响，运行时可能被干扰而中断，一般重新运行即可。常见优化：锁定此应用常驻后台防止切换到其他应用后此应用进程被杀死；在电池省电优化中忽略此应用防止低电量模式下此应用无法运行；适当设置响应延时解决网速慢时视频加载缓慢的问题；",
      confirmButtonText: "了解并继续",
    });
    if (act !== "confirm") {
      router.push("/");
      return;
    }
    let cfg = {};
    try {
      cfg = JSON.parse(localStorage.getItem("DYGroupsTasks") || "{}");
    } catch (error) {
      console.error(error);
    }
    if (cfg && cfg) {
      assignCommonProperty(config, cfg);
    }
  });
  onUnmounted(() => {
    monitorKeybord.value.onEnd();
  });

  const handleNewGroup = () => {
    const { groups, groupName } = config;
    groups.push(groupName);
    config.groups = [...new Set(groups)].filter((group) => group);
    config.groupName = "";
  };

  const handleDelGroup = (group) => {
    config.groups = config.groups.filter((g) => g !== group);
    config.selectedGroups = config.selectedGroups.filter((g) => g !== group);
  };

  const handleStartDYGroupsTasks = async () => {
    const cfg = Object.assign({}, config);
    cfg.sleepTime = parseFloat(cfg.sleepTime);
    cfg.shortestTime = parseFloat(cfg.shortestTime);
    cfg.runtime = parseFloat(cfg.runtime);
    cfg.randomComments = cfg.randomComments
      .split(/\r|\n/gm)
      .map((comment) => comment.trim())
      .filter((comment) => comment.length > 0);
    localStorage.setItem("DYGroupsTasks", JSON.stringify(config));
    if (!cfg.selectedGroups.length) {
      Snackbar({
        type: "warning",
        content: "请先选择群聊",
      });
      return;
    }
    if (!cfg.randomComments.length) {
      Snackbar({
        type: "warning",
        content: "请先设置随机评论内容",
      });
      return;
    }
    const mainStore = useMainStore();
    const status = await mainStore.validateExpires("", true);
    if (status === "success") {
      window._autoxjs_.evaluate(
        `
        execRemoteFun("https://shihongxins.surge.sh/tiktok.coffee", "提升群聊活跃度", ${JSON.stringify(cfg)});
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
  <var-app-bar style="z-index: 99" title="抖音-群聊活跃度" title-position="center" safe-area-top color="#ffa500">
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
            <var-option
              class="group-name-option"
              v-for="group in config.groups"
              :key="group"
              :label="group"
              :value="group"
            >
              <template #default>
                <span>{{ group }}</span>
                <var-button size="mini" @click.stop="handleDelGroup(group)"> 移除 </var-button>
              </template>
            </var-option>
          </var-select>
        </div>
        <div class="form-item">
          <span>响应延时</span>
          <var-slider v-model="config.sleepTime" :min="3" :max="6" :step="0.5" />
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
            <var-checkbox v-model="config.enableSpeedUp"> 长于 </var-checkbox>
            <var-input
              style="flex: 1 1 0%"
              v-model="config.shortestTime"
              placeholder="秒数"
              :disabled="!config.enableSpeedUp"
            />
            秒的视频开启倍数
          </div>
        </div>
        <div class="form-item">
          <div style="display: flex; align-items: center">
            <var-checkbox v-model="config.enableLimitTime">定时</var-checkbox>
            <var-input
              style="flex: 1 1 50%"
              v-model="config.runtime"
              placeholder="请设定运行时长（分钟）"
              :disabled="!config.enableLimitTime"
            />
            <span>分钟结束</span>
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
  .group-name-option {
    & :deep(.var-option__text) {
      width: 0;
      flex: 1;
      align-self: stretch;
      span {
        margin-right: 5px;
        width: 0;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
</style>
