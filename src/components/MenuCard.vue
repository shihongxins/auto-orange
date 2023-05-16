<script>
  export default {
    props: {
      icon: {
        type: String,
        default: () => "orange",
      },
      title: {
        type: String,
        required: true,
      },
      desc: {
        type: String,
        default: () => "",
      },
      route: {
        type: [String, Object],
        default: () => "",
      },
    },
    methods: {
      handleRoute() {
        if (this.route) {
          this.$router.push(this.route);
        }
      },
    },
  };
</script>

<template>
  <var-paper class="menu-card" :elevation="2" :radius="16" v-ripple="{ color: 'orange' }" @click="handleRoute">
    <div class="menu-icon">
      <slot name="icon">
        <SvgIcon :name="icon" size="40px"></SvgIcon>
      </slot>
    </div>
    <div class="menu-info">
      <h4 class="menu-title">{{ title }}</h4>
      <p class="menu-desc" v-if="desc">{{ desc }}</p>
    </div>
  </var-paper>
</template>

<style lang="scss">
  .menu {
    &-card {
      box-sizing: border-box;
      padding: 20px;
      width: 100%;
      overflow: hidden;
      display: flex;
    }
    &-icon {
      margin: 10px;
      width: 40px;
      height: 40px;
      overflow: hidden;
    }
    &-info {
      width: 0;
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-flow: column;
      justify-content: space-around;
      text-align: right;
    }
    &-title,
    &-desc {
      margin: 0;
      padding: 0;
    }
  }
</style>
