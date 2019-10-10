<template>
  <div class="example">
    <div class="row">
      <div class="title">基本使用</div>
      <y-collapse v-model="activeNames" style="width: 500px;">
        <y-collapse-item name="1">
          <template slot="title">
            标题1<i class="header-icon y-icon-info"></i>
          </template>
          <div>111</div>
          <div>222</div>
        </y-collapse-item>
        <y-collapse-item title="标题2" name="2">
          <div>333</div>
          <div>444</div>
        </y-collapse-item>
      </y-collapse>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        activeNames: ['1']
      }
    },
    methods: {
      handleChange(val) {
        console.log(val);
      }
    },
  }
</script>
<style scoped>

</style>
