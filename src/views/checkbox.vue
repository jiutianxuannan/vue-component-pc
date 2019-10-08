<template>
  <div class="example">
    <div class="row">
      <div class="title">基本</div>
      <y-checkbox v-model="checked">选项</y-checkbox>
    </div>
    <div class="row">
      <div class="title">禁用</div>
      <y-checkbox v-model="checked1" disabled>选项1</y-checkbox>
      <y-checkbox v-model="checked2" disabled>选项2</y-checkbox>
    </div>
    <div class="row">
      <div class="title">多选框组</div>
      <y-checkbox-group v-model="checkList">
        <y-checkbox label="选框 A"></y-checkbox>
        <y-checkbox label="选框 B"></y-checkbox>
        <y-checkbox label="选框 C"></y-checkbox>
        <y-checkbox label="禁用" disabled></y-checkbox>
        <y-checkbox label="选中且禁用" disabled></y-checkbox>
      </y-checkbox-group>
    </div>
    <div class="row">
      <y-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</y-checkbox>
      <div style="margin: 15px 0;"></div>
      <y-checkbox-group v-model="checkedCities" @change="handleCheckedCitiesChange">
        <y-checkbox v-for="city in cities" :label="city" :key="city">{{city}}</y-checkbox>
      </y-checkbox-group>
    </div>
  </div>
</template>

<script>
  const cityOptions = ['选项一', '选项二', '选项三', '选项四'];
  export default {
    data() {
      return {
        checked: true,
        checked1: false,
        checked2: true,
        checkList: ['选中且禁用', '复选框 A'],
        checkAll: false,
        checkedCities: ['选项一', '选项二'],
        cities: cityOptions,
        isIndeterminate: true
      }
    },
    methods: {
      handleCheckAllChange(val) {
        this.checkedCities = val ? cityOptions : [];
        this.isIndeterminate = false;
      },
      handleCheckedCitiesChange(value) {
        let checkedCount = value.length;
        this.checkAll = checkedCount === this.cities.length;
        this.isIndeterminate = checkedCount > 0 && checkedCount < this.cities.length;
      }
    },
  }
</script>
