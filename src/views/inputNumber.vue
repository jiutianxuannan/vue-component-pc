<template>
  <div class="example">
    <!-- <div class="row">
      <div class="title">基本：</div>
      <y-input-number v-model="num" @change="handleChange" :min="1" :max="10" label="描述文字"></y-input-number>
    </div>
    <div class="row">
      <div class="title">禁用：</div>
      <y-input-number v-model="num" :disabled="true"></y-input-number>
    </div>
    <div class="row">
      <div class="title">步数：</div>
      <y-input-number v-model="num1" :step="2"></y-input-number>
    </div>
    <div class="row">
      <div class="title">严格步数：</div>
      <y-input-number v-model="num2" :step="2" step-strictly></y-input-number>
    </div>
    <div class="row">
      <div class="title">精度：</div>
      <y-input-number v-model="num" :precision="2" :step="0.15" :max="10"></y-input-number>
    </div> -->
    <div class="row">
      <div class="title">按钮位置：</div>
      <y-input-number v-model="num" controls-position="right" @change="handleChange" :min="1" :max="10"
        style="width: 130px;">
      </y-input-number>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        num: 1,
        num1: 2,
        num2: 2
      }
    },
    methods: {
      handleChange(value) {
        console.log('value', value)
      }
    },
  }
</script>
