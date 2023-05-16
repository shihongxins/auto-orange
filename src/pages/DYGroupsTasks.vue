<script setup>
  import { reactive } from "vue";

  const config = reactive({
    groupName: "",
    groups: [],
    selectedGroups: [],
    sleepTime: 2,
    randomComments: "",
    enableCopyComment: false,
  });

  const handleNewGroup = () => {
    const { groups, groupName } = config;
    groups.push(groupName);
    config.groups = [...new Set(groups)];
    config.groupName = "";
  };
</script>

<template>
  <var-app-bar
    title="抖音-群聊活跃度"
    title-position="center"
    safe-area-top
    color="linear-gradient(90deg, orange 0%, orangered 100%)"
  >
    <template #left>
      <var-button text round @click="$router.back()">
        <var-icon name="chevron-left" :size="24" />
      </var-button>
    </template>
  </var-app-bar>
  <main>
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
          <var-input
            placeholder="请输入备选随机评论（换行分割）"
            variant="outlined"
            resize
            clearable
            v-model="config.randomComments"
          />
        </div>
        <div class="form-item">
          <var-checkbox v-model="config.enableCopyComment">启用复制评论</var-checkbox>
        </div>
        <div class="form-item">
          <var-button type="warning" block>开始</var-button>
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
    overflow: hidden auto;
  }
  .var-paper {
    padding: 10px;
  }
</style>
