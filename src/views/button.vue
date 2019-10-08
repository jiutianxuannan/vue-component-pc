<template>
  <div class="example">
    <div class="row">
      <div class="title">按钮的使用，可灵活配置颜色</div>
      <y-button>主要按钮</y-button>
      <y-button bgColor="#67C23A">主要按钮</y-button>
    </div>
    <div class="row">
      <div class="title">不同颜色下的按钮禁用状态</div>
      <y-button disabled>主要按钮</y-button>
      <y-button disabled bgColor="#67C23A">主要按钮</y-button>
    </div>
    <div class="row">
      <div class="title">带图标</div>
      <y-button icon="y-icon-search">搜索</y-button>
    </div>
    <div class="row">
      <div class="title">加载中</div>
      <y-button :loading="true">加载中</y-button>
      <y-button :loading="true" bgColor="#67C23A">加载中</y-button>
    </div>
    <div class="row">
      <div class="title">文字类型按钮</div>
      <y-button type="text">文字按钮</y-button>
      <y-button type="text" disabled>文字按钮</y-button>
      <y-button type="text" bgColor="#67C23A">文字按钮</y-button>
      <y-button type="text" bgColor="#67C23A" disabled>文字按钮</y-button>
    </div>
  </div>
</template>

<script>
  export default {
  }
</script>
