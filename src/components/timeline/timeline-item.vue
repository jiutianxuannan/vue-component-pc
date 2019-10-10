<template>
  <li class="y-timeline-item">
    <div class="y-timeline-item__tail"></div>

    <div v-if="!$slots.dot" class="y-timeline-item__node" :class="[
        `y-timeline-item__node--${size || ''}`,
        `y-timeline-item__node--${type || ''}`
      ]" :style="{
        backgroundColor: color
      }">
      <i v-if="icon" class="y-timeline-item__icon" :class="icon"></i>
    </div>
    <div v-if="$slots.dot" class="y-timeline-item__dot">
      <slot name="dot"></slot>
    </div>

    <div class="y-timeline-item__wrapper">
      <div v-if="!hideTimestamp && placement === 'top'" class="y-timeline-item__timestamp is-top">
        {{timestamp}}
      </div>

      <div class="y-timeline-item__content">
        <slot></slot>
      </div>

      <div v-if="!hideTimestamp && placement === 'bottom'" class="y-timeline-item__timestamp is-bottom">
        {{timestamp}}
      </div>
    </div>
  </li>
</template>

<script>
  export default {
    name: 'YTimelineItem',

    inject: ['timeline'],

    props: {
      timestamp: String,

      hideTimestamp: {
        type: Boolean,
        default: false
      },

      placement: {
        type: String,
        default: 'bottom'
      },

      type: String,

      color: String,

      size: {
        type: String,
        default: 'normal'
      },

      icon: String
    }
  };
</script>
<style scoped>
  .y-timeline-item {
    position: relative;
    padding-bottom: 20px;
  }

  .y-timeline-item__wrapper {
    position: relative;
    padding-left: 28px;
    top: -3px;
  }

  .y-timeline-item__tail {
    position: absolute;
    left: 4px;
    height: 100%;
    border-left: 2px solid #E4E7ED;
  }

  .y-timeline-item__icon {
    color: #FFFFFF;
    font-size: 13px;
  }

  .y-timeline-item__node {
    position: absolute;
    background-color: #E4E7ED;
    border-radius: 50%;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
  }

  .y-timeline-item__node--normal {
    left: -1px;
    width: 12px;
    height: 12px;
  }

  .y-timeline-item__node--large {
    left: -2px;
    width: 14px;
    height: 14px;
  }

  .y-timeline-item__node--primary {
    background-color: #409EFF;
  }

  .y-timeline-item__node--success {
    background-color: #67C23A;
  }

  .y-timeline-item__node--warning {
    background-color: #E6A23C;
  }

  .y-timeline-item__node--danger {
    background-color: #F56C6C;
  }

  .y-timeline-item__node--info {
    background-color: #909399;
  }

  .y-timeline-item__dot {
    position: absolute;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
  }

  .y-timeline-item__content {
    color: #303133;
  }

  .y-timeline-item__timestamp {
    color: #909399;
    line-height: 1;
    font-size: 13px;
  }

  .y-timeline-item__timestamp.is-top {
    margin-bottom: 8px;
    padding-top: 4px;
  }

  .y-timeline-item__timestamp.is-bottom {
    margin-top: 8px;
  }
</style>
