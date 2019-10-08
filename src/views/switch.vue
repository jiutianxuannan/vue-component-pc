<template>
  <div class="example">
    <div class="row">
      <div class="title">基本：</div>
      <y-switch v-model="value" active-color="#13ce66" inactive-color="#ccc">
      </y-switch>
    </div>
    <div class="row">
      <div class="title">禁用</div>
      <y-switch v-model="value1" disabled>
      </y-switch>
      <y-switch v-model="value2" disabled>
      </y-switch>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        value: true,
        value1: true,
        value2: false
      }
    },
    methods: {

    },
  }
</script>
