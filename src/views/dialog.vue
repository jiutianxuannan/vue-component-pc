<template>
  <div class="example">
    <div class="row">
      <div class="title">基本使用</div>
      <y-button type="text" @click="dialogVisible = true">点击打开弹窗</y-button>
      <y-dialog title="提示" :visible.sync="dialogVisible" width="30%" :before-close="handleClose">
        <span>这是一段信息</span>
        <span slot="footer" class="dialog-footer">
          <y-button @click="dialogVisible = false">取 消</y-button>
          <y-button type="primary" @click="dialogVisible = false">确 定</y-button>
        </span>
      </y-dialog>
    </div>
    <div class="row">
      <div class="title">自定义内容</div>
      <y-button type="text" @click="dialogVisible1 = true">打开自定义内容</y-button>
      <y-dialog title="提示" :visible.sync="dialogVisible1" width="30%">
        <div>我是自定义内容</div>
      </y-dialog>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        dialogVisible: false,
        dialogVisible1: false
      }
    },
    methods: {
      handleClose(done) {
        console.log('你确定要关闭吗')
        done();
        // this.$confirm('确认关闭？')
        //   .then(_ => {
        //     done();
        //   })
        //   .catch(_ => { });
      }
    },
  }
</script>
<style scoped>

</style>
