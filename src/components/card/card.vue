<template>
  <div class="y-card" :class="shadow ? 'is-' + shadow + '-shadow' : 'is-always-shadow'">
    <div class="y-card__header" v-if="$slots.header || header">
      <slot name="header">{{ header }}</slot>
    </div>
    <div class="y-card__body" :style="bodyStyle">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'YCard',
    props: {
      header: {},
      bodyStyle: {},
      shadow: {
        type: String
      }
    }
  };
</script>
<style scoped>
  .y-card {
    border-radius: 4px;
    border: 1px solid #EBEEF5;
    background-color: #FFFFFF;
    overflow: hidden;
    color: #303133;
    -webkit-transition: 0.3s;
    transition: 0.3s;
  }

  .y-card.is-always-shadow {
    -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .y-card.is-hover-shadow:hover,
  .y-card.is-hover-shadow:focus {
    -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .y-card__header {
    padding: 18px 20px;
    border-bottom: 1px solid #EBEEF5;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }

  .y-card__body {
    padding: 20px;
  }
</style>
