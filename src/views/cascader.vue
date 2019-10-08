<template>
  <div class="example">
    <div class="row">
      <div class="title">基本用法</div>
      <y-cascader :options="options" clearable>
        <template slot-scope="{ node, data }">
          <span>{{ data.label }}</span>
          <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
        </template>
      </y-cascader>
    </div>
    <div class="row">
      <div class="title">多选</div>
      <y-cascader :options="options" :props="props" clearable></y-cascader>
    </div>
    <div class="row">
      <div class="title">选择任意一级</div>
      <y-cascader :options="options" :props="{ checkStrictly: true }" clearable></y-cascader>
    </div>
    <div class="row">
      <div class="title">动态加载</div>
      <y-cascader :props="props1"></y-cascader>
    </div>
  </div>
</template>

<script>
  let id = 0;
  export default {
    data() {
      return {
        props: { multiple: true },
        props1: {
          lazy: true,
          lazyLoad(node, resolve) {
            const { level } = node;
            setTimeout(() => {
              const nodes = Array.from({ length: level + 1 })
                .map(item => ({
                  value: ++id,
                  label: `选项${id}`,
                  leaf: level >= 2
                }));
              // 通过调用resolve将子节点数据返回，通知组件数据加载完成
              resolve(nodes);
            }, 1000);
          }
        },
        options: [{
          value: '1',
          label: '选项1',
          children: [{
            value: '2',
            label: '选项1-1',
            children: [{
              value: '3',
              label: '选项1-1-1'
            }, {
              value: '4',
              label: '选项1-1-2'
            }]
          }, {
            value: '5',
            label: '选项1-2',
            children: [{
              value: '6',
              label: '选项1-2-1'
            }, {
              value: '7',
              label: '选项1-2-2'
            }]
          }]
        }, {
          value: '8',
          label: '选项2',
          children: [{
            value: '9',
            label: '选项2-1',
            children: [{
              value: '10',
              label: '选项2-1-1'
            }, {
              value: '11',
              label: '选项2-1-2'
            }]
          }]
        }, {
          value: '9',
          label: '选项3',
          disabled: true
        }]
      }
    },
    methods: {

    },
    mounted() {

    }
  }
</script>

<style>

</style>
