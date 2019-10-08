<template>
  <div class="example">
    <div class="row">
      <div class="title">基本</div>
      <y-input v-model="input" placeholder="请输入内容" clearable></y-input>
    </div>
    <div class="row">
      <div class="title">禁用状态</div>
      <y-input placeholder="请输入内容" v-model="input" :disabled="true">
      </y-input>
    </div>
    <!-- <div class="row">
      <div class="title">密码框</div>
      <y-input placeholder="请输入密码" v-model="input2" show-password></y-input>
    </div>
    <div class="row">
      <div class="title">加图标</div>
      <div style="margin-bottom: 10px;">
        <y-input placeholder="请选择日期" v-model="input3">
          <i slot="suffix" class="y-input__icon y-icon-date"></i>
        </y-input>
      </div>
      <div>
        <y-input placeholder="请输入内容" v-model="input4">
          <i slot="prefix" class="y-input__icon y-icon-search"></i>
        </y-input>
      </div>
    </div> -->
    <div class="row">
      <div class="title">可自适应高度</div>
      <y-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" placeholder="请输入内容" v-model="textarea2">
      </y-input>
    </div>
    <div class="row">
      <div class="title">输入长度限制</div>
      <div style="margin-bottom: 10px;">
        <y-input type="text" placeholder="请输入内容" v-model="text" maxlength="10" show-word-limit>
        </y-input>
      </div>
      <div>
        <y-input type="textarea" placeholder="请输入内容" v-model="textarea" maxlength="30" show-word-limit>
        </y-input>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        input: '',
        input1: '',
        input2: '',
        input3: '',
        input4: '',
        input5: '',
        input6: '',
        textarea2: '',
        text: '',
        textarea: ''
      }
    },
    methods: {

    },
  }
</script>
<style scoped>
</style>
