<template>
  <div id="app">
    <div class="menu-demo-1-vue" :style="{width: inlineCollapsed?'70px':'250px'}">
      <!-- <Menu :datas="data" :activeAll="activeAll" :className="theme" :inlineCollapsed="inlineCollapsed" ref="menu"
        :accordion="accordion" @select="triggerSelect"></Menu> -->
    </div>
    <router-view />
  </div>
</template>
<script>
  export default {
    data() {
      return {
        accordion: false,
        inlineCollapsed: false,
        activeAll: false,
        theme: 'h-menu-white',
        data: [{
          title: '按钮',
          key: 'button',
        },
        {
          title: '单选',
          key: 'radio',
        },
        {
          title: '多选',
          key: 'checkbox',
        },
        {
          title: 'input输入框',
          key: 'input',
        },
        {
          title: '开关',
          key: 'switch',
        },
        {
          title: '数字输入框',
          key: 'inputNumber',
        },
        {
          title: 'select下拉',
          key: 'select',
        },
        {
          title: 'cascader级联选择器',
          key: 'cascader',
        }]
      }
    },
    methods: {
      // select(key) {
      //   this.$refs.menu.select(key);
      //   this.$router.push({
      //     name: key
      //   })
      // },
      // triggerSelect(menu) {
      //   this.$router.push({
      //     name: menu.key
      //   })
      // }
    },
    mounted() {
      // this.select('button')
    }
  }
</script>
<style lang="less">
  #app {
    display: flex;
    margin-top: 50px;
    margin-left: 200px;
    margin-right: 200px;
  }

  .example {
    display: flex;
    flex-direction: column;
  }

  .row {
    margin-bottom: 20px;
    margin-left: 20px;
    padding-bottom: 30px;
    border-bottom: 1px solid #ccc;
  }

  .title {
    margin-bottom: 10px;
    font-size: 18px;
  }

  .menu-demo-1-vue {
    transition: 0.2s width cubic-bezier(0.01, 0.71, 0.54, 1);
    margin-right: 50px;
  }
</style>
