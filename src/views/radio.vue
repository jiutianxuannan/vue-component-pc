<template>
  <div class="example">
    <div class="row">
      <div class="title">基本：</div>
      <y-radio v-model="radio" label="1">选项1</y-radio>
      <y-radio v-model="radio" label="2">选项2</y-radio>
    </div>
    <div class="row">
      <div class="title">禁用状态</div>
      <y-radio disabled v-model="radio1" label="禁用">选项1</y-radio>
      <y-radio disabled v-model="radio1" label="选中且禁用">选项2</y-radio>
    </div>
    <div class="row">
      <div class="title">单选框组</div>
      <y-radio-group v-model="radio2">
        <y-radio :label="3">选项1</y-radio>
        <y-radio :label="6">选项2</y-radio>
        <y-radio :label="9">选项3</y-radio>
      </y-radio-group>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        radio: '1',
        radio1: '选中且禁用',
        radio2: 3
      }
    }
  }
</script>
