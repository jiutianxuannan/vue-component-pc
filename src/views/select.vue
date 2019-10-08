<template>
  <div class="example">
    <div class="row">
      <div class="title">基本用法</div>
      <y-select v-model="value" placeholder="请选择" clearable>
        <y-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"
          :disabled="item.disabled">
          <span style="float: left">{{ item.label }}</span>
          <span style="float: right; color: #8492a6; font-size: 13px">{{ item.value }}</span>
        </y-option>
      </y-select>
    </div>
    <div class="row">
      <div class="title">基础多选</div>
      <y-select v-model="value1" multiple placeholder="请选择">
        <y-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
        </y-option>
      </y-select>
    </div>
    <div class="row">
      <div class="title">搜索</div>
      <y-select v-model="value2" filterable placeholder="请选择">
        <y-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
        </y-option>
      </y-select>
    </div>
    <div class="row">
      <div class="title">远程搜索</div>
      <y-select v-model="value5" multiple filterable remote reserve-keyword placeholder="请输入关键词"
        :remote-method="remoteMethod" :loading="loading">
        <y-option v-for="item in options5" :key="item.value" :label="item.label" :value="item.value">
        </y-option>
      </y-select>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        options: [{
          value: '选项1的value',
          label: '选项1'
        }, {
          value: '选项2的value',
          label: '选项2',
          disabled: true
        }, {
          value: '选项3的value',
          label: '选项3'
        }, {
          value: '选项4的value',
          label: '选项4'
        }, {
          value: '选项5的value',
          label: '选项5'
        }],
        value: '',
        value1: [],
        value2: '',
        options5: [],
        value5: [],
        list: [],
        loading: false,
        states: ["Alabama", "Alaska", "Arizona",
          "Arkansas", "California", "Colorado",
          "Connecticut", "Delaware", "Florida",
          "Georgia", "Hawaii", "Idaho", "Illinois",
          "Indiana", "Iowa", "Kansas", "Kentucky",
          "Louisiana", "Maine", "Maryland",
          "Massachusetts", "Michigan", "Minnesota",
          "Mississippi", "Missouri", "Montana",
          "Nebraska", "Nevada", "New Hampshire",
          "New Jersey", "New Mexico", "New York",
          "North Carolina", "North Dakota", "Ohio",
          "Oklahoma", "Oregon", "Pennsylvania",
          "Rhode Island", "South Carolina",
          "South Dakota", "Tennessee", "Texas",
          "Utah", "Vermont", "Virginia",
          "Washington", "West Virginia", "Wisconsin",
          "Wyoming"]
      }
    },
    methods: {
      change(data) {
        console.log('changeData:', data);
      },
      remoteMethod(query) {
        if (query !== '') {
          this.loading = true;
          setTimeout(() => {
            this.loading = false;
            this.options5 = this.list.filter(item => {
              return item.label.toLowerCase()
                .indexOf(query.toLowerCase()) > -1;
            });
          }, 200);
        } else {
          this.options5 = [];
        }
      }
    },
    mounted() {
      this.list = this.states.map(item => {
        return { value: item, label: item };
      });
    }
  }
</script>

<style>

</style>
