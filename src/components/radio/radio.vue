<template>
  <label class="y-radio" :class="[
        {'is-disabled': isDisabled},
        {'is-focus': focus},
        {'is-checked': model === label}
      ]" role="radio" :aria-checked="model === label" :aria-disabled="isDisabled" :tabindex="tabIndex"
    @keydown.space.stop.prevent="model = isDisabled ? model : label">
    <span class="y-radio__input" :class="{
          'is-disabled': isDisabled,
          'is-checked': model === label
        }">
      <span class="y-radio__inner"></span>
      <input ref="radio" class="y-radio__original" :value="label" type="radio" aria-hidden="true" v-model="model"
        @focus="focus = true" @blur="focus = false" @change="handleChange" :name="name" :disabled="isDisabled"
        tabindex="-1">
    </span>
    <span class="y-radio__label" @keydown.stop>
      <slot></slot>
      <template v-if="!$slots.default">{{label}}</template>
    </span>
  </label>
</template>
<script>
  import Emitter from './emitter';

  export default {
    name: 'YRadio',

    mixins: [Emitter],

    inject: {
      elForm: {
        default: ''
      },
      elFormItem: {
        default: ''
      }
    },
    componentName: 'YRadio',

    props: {
      value: {},
      label: {},
      disabled: Boolean,
      name: String,
    },
    data() {
      return {
        focus: false
      }
    },
    computed: {
      isGroup() {
        let parent = this.$parent
        while (parent) {
          if (parent.$options.componentName !== 'YRadioGroup') {
            parent = parent.$parent
          } else {
            this._radioGroup = parent
            return true
          }
        }
        return false
      },
      model: {
        get() {
          return this.isGroup ? this._radioGroup.value : this.value
        },
        set(val) {
          if (this.isGroup) {
            this.dispatch('YRadioGroup', 'input', [val])
          } else {
            this.$emit('input', val)
          }
          this.$refs.radio && (this.$refs.radio.checked = this.model === this.label)
        }
      },
      isDisabled() {
        return this.isGroup
          ? this._radioGroup.disabled || this.disabled || (this.elForm || {}).disabled
          : this.disabled || (this.elForm || {}).disabled
      },
      tabIndex() {
        return (this.isDisabled || (this.isGroup && this.model !== this.label)) ? -1 : 0
      }
    },
    methods: {
      handleChange() {
        this.$nextTick(() => {
          this.$emit('change', this.model)
          this.isGroup && this.dispatch('YRadioGroup', 'handleChange', this.model)
        })
      }
    }
  }
</script>
<style scoped>
  .y-radio {
    color: #606266;
    font-weight: 500;
    line-height: 1;
    position: relative;
    cursor: pointer;
    display: inline-block;
    white-space: nowrap;
    outline: none;
    font-size: 14px;
    margin-right: 30px;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
  }

  .y-radio:last-child {
    margin-right: 0;
  }

  .y-radio__input {
    white-space: nowrap;
    cursor: pointer;
    outline: none;
    display: inline-block;
    line-height: 1;
    position: relative;
    vertical-align: middle;
  }

  .y-radio__input.is-disabled .y-radio__inner {
    background-color: #F5F7FA;
    border-color: #E4E7ED;
    cursor: not-allowed;
  }

  .y-radio__input.is-disabled .y-radio__inner::after {
    cursor: not-allowed;
    background-color: #F5F7FA;
  }

  .y-radio__input.is-disabled .y-radio__inner+.y-radio__label {
    cursor: not-allowed;
  }

  .y-radio__input.is-disabled.is-checked .y-radio__inner {
    background-color: #F5F7FA;
    border-color: #E4E7ED;
  }

  .y-radio__input.is-disabled.is-checked .y-radio__inner::after {
    background-color: #C0C4CC;
  }

  .y-radio__input.is-disabled+span.y-radio__label {
    color: #C0C4CC;
    cursor: not-allowed;
  }

  .y-radio__input.is-checked .y-radio__inner {
    border-color: #409EFF;
  }

  .y-radio__input.is-checked .y-radio__inner::after {
    -webkit-transform: translate(-50%, -50%) scale(1);
    transform: translate(-50%, -50%) scale(1);
  }

  .y-radio__inner {
    border: 1px solid #DCDFE6;
    border-radius: 100%;
    width: 14px;
    height: 14px;
    background-color: #FFFFFF;
    position: relative;
    cursor: pointer;
    display: inline-block;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }

  .y-radio__inner:hover {
    border-color: #409EFF;
  }

  .y-radio__inner::after {
    width: 6px;
    height: 6px;
    border-radius: 100%;
    background-color: #409EFF;
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    -webkit-transform: translate(-50%, -50%) scale(0);
    transform: translate(-50%, -50%) scale(0);
    -webkit-transition: -webkit-transform .15s ease-in;
    transition: -webkit-transform .15s ease-in;
    transition: transform .15s ease-in;
  }

  .y-radio__original {
    opacity: 0;
    outline: none;
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: 0;
  }

  .y-radio:focus:not(.is-focus):not(:active):not(.is-disabled) .y-radio__inner {
    -webkit-box-shadow: 0 0 2px 2px #409EFF;
    box-shadow: 0 0 2px 2px #409EFF;
  }

  .y-radio__label {
    font-size: 14px;
    padding-left: 10px;
  }
</style>
