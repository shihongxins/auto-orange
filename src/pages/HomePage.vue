<script setup>
  import MenuCard from "../components/MenuCard.vue";
</script>

<template>
  <main class="home">
    <var-paper class="introduction" :elevation="4" :radius="8" v-ripple="{ color: 'orange' }">
      <div class="background-icon">
        <SvgIcon name="orange" size="100px" color="orange" />
      </div>
      <h1><span style="color: orangered">柳</span><span style="color: orange">橙</span></h1>
      <h2>自动化工具</h2>
      <p class="slogan">提高效率，节省时间，然后浪费它</p>
    </var-paper>
    <ul class="menu-list">
      <li class="menu-item">
        <MenuCard
          icon="tiktok"
          title="抖音-群聊活跃度"
          desc="自动给群内成员视频点赞评论"
          route="/dy_groups_tasks"
        ></MenuCard>
      </li>
      <!-- <li class="menu-item">
        <MenuCard icon="tiktok" title="抖音-自动看视频"></MenuCard>
      </li> -->
    </ul>
  </main>
</template>

<style lang="scss" scoped>
  .home {
    padding-bottom: 51px;
  }
  .introduction {
    margin: 20px 0;
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    padding: 10px;
    color: #999;
    position: relative;
    .background-icon {
      position: absolute;
      right: -10%;
      bottom: 40%;
      color: orange;
    }
    h2 {
      margin-left: 2em;
    }
    .slogan {
      width: 100%;
      text-align: end;
    }
  }
  .menu {
    &-item {
      margin-top: 10px;
    }
  }
</style>
