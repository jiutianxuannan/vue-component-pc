<template>
  <div class="y-checkbox-group" role="group" aria-label="checkbox-group">
    <slot></slot>
  </div>
</template>
<script>
  import Emitter from './emitter';

  export default {
    name: 'YCheckboxGroup',

    componentName: 'YCheckboxGroup',

    mixins: [Emitter],

    inject: {
      elFormItem: {
        default: ''
      }
    },

    props: {
      value: {},
      disabled: Boolean,
      min: Number,
      max: Number
    },

    watch: {
      value(value) {
        this.dispatch('YFormItem', 'el.form.change', [value]);
      }
    }
  };
</script>
