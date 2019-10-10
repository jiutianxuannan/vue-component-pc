<template>
  <div class="example">
    <div class="row">
      <div class="title">基本使用</div>
      <y-carousel height="150px" style="width: 400px;">
        <y-carousel-item v-for="item in 4" :key="item">
          <h3 class="small">{{ item }}</h3>
        </y-carousel-item>
      </y-carousel>
    </div>
    <div class="row">
      <div class="title">卡片</div>
      <y-carousel :interval="4000" type="card" height="200px" style="width: 600px;">
        <y-carousel-item v-for="item in 6" :key="item">
          <h3 class="medium">{{ item }}</h3>
        </y-carousel-item>
      </y-carousel>
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
  .y-carousel__item h3 {
    color: #475669;
    font-size: 14px;
    opacity: 0.75;
    line-height: 150px;
    margin: 0;
  }

  .y-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
  }

  .y-carousel__item:nth-child(2n+1) {
    background-color: #d3dce6;
  }
</style>
