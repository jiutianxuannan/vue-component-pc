<template>
  <div class="example">
    <div class="row">
      <div class="title">基本用法</div>
      <y-popover placement="right" width="400" trigger="click">
        <div>我是自定义的内容</div>
        <y-button slot="reference">click 激活</y-button>
      </y-popover>
    </div>
    <div class="row">
      <div class="title">其他操作</div>
      <y-popover placement="top" width="160" v-model="visible">
        <p>这是一段内容这是一段内容确定删除吗？</p>
        <div style="text-align: right; margin: 0">
          <y-button size="mini" type="text" @click="visible = false">取消</y-button>
          <y-button type="primary" size="mini" @click="visible = false">确定</y-button>
        </div>
        <y-button slot="reference">删除</y-button>
      </y-popover>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        visible: false,
      }
    },
    methods: {

    },
  }
</script>
<style scoped>

</style>
