<template>
  <div class="example">
    <div class="row">
      <div class="title">自定义样式</div>
      <y-timeline>
        <y-timeline-item v-for="(activity, index) in activities" :key="index" :icon="activity.icon"
          :type="activity.type" :color="activity.color" :size="activity.size" :timestamp="activity.timestamp">
          {{activity.content}}
        </y-timeline-item>
      </y-timeline>
    </div>
    <div class="row">
      <div class="title">自定义时间戳</div>
      <y-timeline>
        <y-timeline-item timestamp="2018/4/12" placement="top">
          <y-card>
            <h4>更新 Github 模板</h4>
            <p>王小虎 提交于 2018/4/12 20:46</p>
          </y-card>
        </y-timeline-item>
        <y-timeline-item timestamp="2018/4/3" placement="top">
          <y-card>
            <h4>更新 Github 模板</h4>
            <p>王小虎 提交于 2018/4/3 20:46</p>
          </y-card>
        </y-timeline-item>
      </y-timeline>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        activities: [{
          content: '支持使用图标',
          timestamp: '2018-04-12 20:46',
          size: 'large',
          type: 'primary',
          icon: 'y-icon-more'
        }, {
          content: '支持自定义颜色',
          timestamp: '2018-04-03 20:46',
          color: '#0bbd87'
        }, {
          content: '支持自定义尺寸',
          timestamp: '2018-04-03 20:46',
          size: 'large'
        }, {
          content: '默认样式的节点',
          timestamp: '2018-04-03 20:46'
        }]
      }
    },
    methods: {

    },
  }
</script>
<style scoped>

</style>
