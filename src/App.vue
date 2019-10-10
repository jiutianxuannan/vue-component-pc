<template>
  <div id="app">
    <div class="menu-demo-1-vue">
      <y-tabs tab-position="left" v-model="activeName">
        <y-tab-pane :label="item.title" :name="item.name" v-for="(item,index) in data" :key="index"></y-tab-pane>
      </y-tabs>
    </div>
    <router-view />
  </div>
</template>
<script>
  import components from './component.json'
  export default {
    data() {
      return {
        activeName: 'button',
        data: components
      }
    },
    watch: {
      activeName(val) {
        this.$router.push({
          name: val
        })
      }
    },
    mounted() {
      this.$router.push({
        name: 'button'
      })
    }
  }
</script>
<style>
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
