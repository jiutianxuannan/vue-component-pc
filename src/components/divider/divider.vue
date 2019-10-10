<template functional>
  <div v-bind="data.attrs" v-on="listeners" :class="[data.staticClass, 'y-divider', `y-divider--${props.direction}`]">
    <div v-if="slots().default && props.direction !== 'vertical'"
      :class="['y-divider__text', `is-${props.contentPosition}`]">
      <slot />
    </div>
  </div>
</template>

<script>
  export default {
    name: 'YDivider',
    props: {
      direction: {
        type: String,
        default: 'horizontal',
        validator(val) {
          return ['horizontal', 'vertical'].indexOf(val) !== -1;
        }
      },
      contentPosition: {
        type: String,
        default: 'center',
        validator(val) {
          return ['left', 'center', 'right'].indexOf(val) !== -1;
        }
      }
    }
  };

</script>
<style scoped>
  .y-divider {
    background-color: #DCDFE6;
    position: relative;
  }

  .y-divider--horizontal {
    display: block;
    height: 1px;
    width: 100%;
    margin: 24px 0;
  }

  .y-divider--vertical {
    display: inline-block;
    width: 1px;
    height: 1em;
    margin: 0 8px;
    vertical-align: middle;
    position: relative;
  }

  .y-divider__text {
    position: absolute;
    background-color: #FFFFFF;
    padding: 0 20px;
    font-weight: 500;
    color: #303133;
    font-size: 14px;
  }

  .y-divider__text.is-left {
    left: 20px;
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
  }

  .y-divider__text.is-center {
    left: 50%;
    -webkit-transform: translateX(-50%) translateY(-50%);
    transform: translateX(-50%) translateY(-50%);
  }

  .y-divider__text.is-right {
    right: 20px;
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
  }
</style>
