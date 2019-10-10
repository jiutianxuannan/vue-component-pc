<template>
  <div class="example">
    <div class="row">
      <div class="box" style="padding-top: 50px;">
        <div class="top">
          <y-tooltip class="item" effect="dark" content="Top Center 提示文字" placement="top">
            <y-button>上边</y-button>
          </y-tooltip>
        </div>
        <div class="left">
          <y-tooltip class="item" effect="dark" content="Left Center 提示文字" placement="left">
            <y-button>左边</y-button>
          </y-tooltip>
        </div>
        <div class="right">
          <y-tooltip class="item" effect="dark" content="Right Center 提示文字" placement="right">
            <y-button>右边</y-button>
          </y-tooltip>
        </div>
        <div class="bottom">
          <y-tooltip class="item" effect="dark" content="Bottom Center 提示文字" placement="bottom">
            <y-button>下边</y-button>
          </y-tooltip>
        </div>
      </div>
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
  .box {
    width: 400px;
  }

  .box .top {
    text-align: center;
  }

  .box .left {
    float: left;
    width: 60px;
  }

  .box .right {
    float: right;
    width: 60px;
  }

  .box .bottom {
    clear: both;
    text-align: center;
  }

  .box .item {
    margin: 4px;
  }

  .box .left .y-tooltip__popper,
  .box .right .y-tooltip__popper {
    padding: 8px 10px;
  }
</style>
