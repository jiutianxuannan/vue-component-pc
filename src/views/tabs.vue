<template>
  <div class="example">
    <div class="row">
      <div class="title">定义位置：</div>
      <div style="margin: 30px 0">
        <y-radio-group v-model="tabPosition">
          <y-radio label="top">上面</y-radio>
          <y-radio label="bottom">下面</y-radio>
          <y-radio label="left">左边</y-radio>
          <y-radio label="right">右边</y-radio>
        </y-radio-group>
      </div>
      <y-tabs :tab-position="tabPosition" style="height: 200px;" @tab-click="handleClick">
        <y-tab-pane>
          <span slot="label"><i class="y-icon-date"></i> 选项一</span>
          选项一的内容
        </y-tab-pane>
        <y-tab-pane label="选项二">选项二的内容</y-tab-pane>
        <y-tab-pane label="选项三">选项三的内容</y-tab-pane>
        <y-tab-pane label="选项四">选项四的内容</y-tab-pane>
      </y-tabs>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        activeName: 'second',
        tabPosition: 'left'
      }
    },
    methods: {
      handleClick(tab, event) {
      }
    },
  }
</script>
