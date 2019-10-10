<template>
  <div class="example">
    <div class="row">
      <div class="title">基本</div>
      <div class="basic-example">
        <div class="block" v-for="fit in fits" :key="fit">
          <span class="demonstration">{{ fit }}</span>
          <y-image style="width: 100px; height: 100px" :src="url" :fit="fit"></y-image>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="title">加载失败</div>
      <y-image style="width: 300px; height: 200px">
        <div slot="error" class="image-slot">
          <i class="y-icon-picture-outline" style="font-size: 30px;"></i>
        </div>
      </y-image>
    </div>
    <div class="row">
      <div class="title">懒加载</div>
      <div class="demo-image__lazy">
        <y-image v-for="url in urls" :key="url" :src="url" lazy fit="cover" style="width: 600px;height: 250px;">
        </y-image>
      </div>
    </div>
    <div class="row">
      <div class="title">大图预览</div>
      <y-image style="width: 100px; height: 100px" :src="url" :preview-src-list="srcList">
      </y-image>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        fits: ['fill', 'contain', 'cover', 'none', 'scale-down'],
        url: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
        urls: [
          'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg',
          'https://fuss10.elemecdn.com/1/34/19aa98b1fcb2781c4fba33d850549jpeg.jpeg',
          'https://fuss10.elemecdn.com/0/6f/e35ff375812e6b0020b6b4e8f9583jpeg.jpeg',
          'https://fuss10.elemecdn.com/9/bb/e27858e973f5d7d3904835f46abbdjpeg.jpeg'
        ],
        srcList: [
          'https://fuss10.elemecdn.com/8/27/f01c15bb73e1ef3793e64e6b7bbccjpeg.jpeg',
          'https://fuss10.elemecdn.com/1/8e/aeffeb4de74e2fde4bd74fc7b4486jpeg.jpeg'
        ]
      }
    },
    methods: {

    },
  }
</script>
<style scoped>
  .basic-example {
    display: flex;
  }

  .block {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 10px;
  }

  .block .emonstration {
    margin-bottom: 10px;
  }
  .demo-image__lazy {
    height: 400px;
    overflow-y: auto;
  }

  .demo-image__lazy .y-image {
    display: block;
    margin-bottom: 10px;
  }

  .demo-image__lazy .y-image:last-child {
    margin-bottom: 0;
  }
</style>
<style>
  .image-slot {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: #f5f7fa;
    color: #909399;
    font-size: 14px;
  }
</style>
