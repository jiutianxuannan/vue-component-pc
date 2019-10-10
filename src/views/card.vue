<template>
  <div class="example">
    <div class="row">
      <y-card class="box-card">
        <div v-for="o in 4" :key="o" class="text item">
          {{'内容 ' + o }}
        </div>
      </y-card>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {

      }
    },
    methods: {

    },
  }
</script>
<style scoped>
  .text {
    font-size: 14px;
  }

  .item {
    padding: 18px 0;
  }

  .box-card {
    width: 480px;
  }
</style>
