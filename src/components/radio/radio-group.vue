<template>
  <div class="y-radio-group" role="radiogroup" @keydown="handleKeydown">
    <slot></slot>
  </div>
</template>
<script>
  import Emitter from './emitter'

  const keyCode = Object.freeze({
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
  })
  export default {
    name: 'YRadioGroup',

    componentName: 'YRadioGroup',

    inject: {
      elFormItem: {
        default: ''
      }
    },

    mixins: [Emitter],

    props: {
      value: {},
      disabled: Boolean
    },
    created() {
      this.$on('handleChange', value => {
        this.$emit('change', value)
      })
    },
    mounted() {
      const radios = this.$el.querySelectorAll('[type=radio]')
      const firstLabel = this.$el.querySelectorAll('[role=radio]')[0]
      if (![].some.call(radios, radio => radio.checked) && firstLabel) {
        firstLabel.tabIndex = 0
      }
    },
    methods: {
      handleKeydown(e) {
        const target = e.target
        const className = target.nodeName === 'INPUT' ? '[type=radio]' : '[role=radio]'
        const radios = this.$el.querySelectorAll(className)
        const length = radios.length
        const index = [].indexOf.call(radios, target)
        const roleRadios = this.$el.querySelectorAll('[role=radio]')
        switch (e.keyCode) {
          case keyCode.LEFT:
          case keyCode.UP:
            e.stopPropagation()
            e.preventDefault()
            if (index === 0) {
              roleRadios[length - 1].click()
              roleRadios[length - 1].focus()
            } else {
              roleRadios[index - 1].click()
              roleRadios[index - 1].focus()
            }
            break;
          case keyCode.RIGHT:
          case keyCode.DOWN:
            if (index === (length - 1)) {
              e.stopPropagation()
              e.preventDefault()
              roleRadios[0].click()
              roleRadios[0].focus()
            } else {
              roleRadios[index + 1].click()
              roleRadios[index + 1].focus()
            }
            break;
          default:
            break;
        }
      }
    },
    watch: {
      value(value) {
        this.dispatch('YFormItem', 'el.form.change', [this.value])
      }
    }
  }
</script>
<style scoped>
  .y-radio-group {
    display: inline-block;
    line-height: 1;
    vertical-align: middle;
    font-size: 0;
  }
</style>
