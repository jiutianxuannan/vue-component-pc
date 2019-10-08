<template>
  <div class="y-switch" :class="{ 'is-disabled': switchDisabled, 'is-checked': checked }" role="switch"
    :aria-checked="checked" :aria-disabled="switchDisabled" @click.prevent="switchValue">
    <input class="y-switch__input" type="checkbox" @change="handleChange" ref="input" :id="id" :name="name"
      :true-value="activeValue" :false-value="inactiveValue" :disabled="switchDisabled" @keydown.enter="switchValue">
    <span :class="['y-switch__label', 'y-switch__laby--left', !checked ? 'is-active' : '']"
      v-if="inactiveIconClass || inactiveText">
      <i :class="[inactiveIconClass]" v-if="inactiveIconClass"></i>
      <span v-if="!inactiveIconClass && inactiveText" :aria-hidden="checked">{{ inactiveText }}</span>
    </span>
    <span class="y-switch__core" ref="core" :style="{ 'width': coreWidth + 'px' }">
    </span>
    <span :class="['y-switch__label', 'y-switch__laby--right', checked ? 'is-active' : '']"
      v-if="activeIconClass || activeText">
      <i :class="[activeIconClass]" v-if="activeIconClass"></i>
      <span v-if="!activeIconClass && activeText" :aria-hidden="!checked">{{ activeText }}</span>
    </span>
  </div>
</template>
<script>
  import Emitter from './emitter';
  import Focus from './focus';

  export default {
    name: 'YSwitch',
    mixins: [Focus('input'), Emitter],
    inject: {
      elForm: {
        default: ''
      }
    },
    props: {
      value: {
        type: [Boolean, String, Number],
        default: false
      },
      disabled: {
        type: Boolean,
        default: false
      },
      width: {
        type: Number,
        default: 40
      },
      activeIconClass: {
        type: String,
        default: ''
      },
      inactiveIconClass: {
        type: String,
        default: ''
      },
      activeText: String,
      inactiveText: String,
      activeColor: {
        type: String,
        default: ''
      },
      inactiveColor: {
        type: String,
        default: ''
      },
      activeValue: {
        type: [Boolean, String, Number],
        default: true
      },
      inactiveValue: {
        type: [Boolean, String, Number],
        default: false
      },
      name: {
        type: String,
        default: ''
      },
      validateEvent: {
        type: Boolean,
        default: true
      },
      id: String
    },
    data() {
      return {
        coreWidth: this.width
      };
    },
    created() {
      if (!~[this.activeValue, this.inactiveValue].indexOf(this.value)) {
        this.$emit('input', this.inactiveValue);
      }
    },
    computed: {
      checked() {
        return this.value === this.activeValue;
      },
      switchDisabled() {
        return this.disabled || (this.elForm || {}).disabled;
      }
    },
    watch: {
      checked() {
        this.$refs.input.checked = this.checked;
        if (this.activeColor || this.inactiveColor) {
          this.setBackgroundColor();
        }
        if (this.validateEvent) {
          this.dispatch('YFormItem', 'el.form.change', [this.value]);
        }
      }
    },
    methods: {
      handleChange(event) {
        const val = this.checked ? this.inactiveValue : this.activeValue;
        this.$emit('input', val);
        this.$emit('change', val);
        this.$nextTick(() => {
          this.$refs.input.checked = this.checked;
        });
      },
      setBackgroundColor() {
        let newColor = this.checked ? this.activeColor : this.inactiveColor;
        this.$refs.core.style.borderColor = newColor;
        this.$refs.core.style.backgroundColor = newColor;
      },
      switchValue() {
        !this.switchDisabled && this.handleChange();
      }
    },
    mounted() {
      this.coreWidth = this.width || 40;
      if (this.activeColor || this.inactiveColor) {
        this.setBackgroundColor();
      }
      this.$refs.input.checked = this.checked;
    }
  };
</script>
<style scoped>
  .y-switch {
    display: -webkit-inline-box;
    display: -ms-inline-flexbox;
    display: inline-flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    position: relative;
    font-size: 14px;
    line-height: 20px;
    height: 20px;
    vertical-align: middle;
  }

  .y-switch.is-disabled .y-switch__core,
  .y-switch.is-disabled .y-switch__label {
    cursor: not-allowed;
  }

  .y-switch__label {
    -webkit-transition: .2s;
    transition: .2s;
    height: 20px;
    display: inline-block;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    vertical-align: middle;
    color: #303133;
  }

  .y-switch__label.is-active {
    color: #409EFF;
  }

  .y-switch__laby--left {
    margin-right: 10px;
  }

  .y-switch__laby--right {
    margin-left: 10px;
  }

  .y-switch__label * {
    line-height: 1;
    font-size: 14px;
    display: inline-block;
  }

  .y-switch__input {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    margin: 0;
  }

  .y-switch__core {
    margin: 0;
    display: inline-block;
    position: relative;
    width: 40px;
    height: 20px;
    border: 1px solid #DCDFE6;
    outline: none;
    border-radius: 10px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    background: #DCDFE6;
    cursor: pointer;
    -webkit-transition: border-color .3s, background-color .3s;
    transition: border-color .3s, background-color .3s;
    vertical-align: middle;
  }

  .y-switch__core:after {
    content: "";
    position: absolute;
    top: 1px;
    left: 1px;
    border-radius: 100%;
    -webkit-transition: all .3s;
    transition: all .3s;
    width: 16px;
    height: 16px;
    background-color: #FFFFFF;
  }

  .y-switch.is-checked .y-switch__core {
    border-color: #409EFF;
    background-color: #409EFF;
  }

  .y-switch.is-checked .y-switch__core::after {
    left: 100%;
    margin-left: -17px;
  }

  .y-switch.is-disabled {
    opacity: 0.6;
  }

  .y-switch--wide .y-switch__label.y-switch__laby--left span {
    left: 10px;
  }

  .y-switch--wide .y-switch__label.y-switch__laby--right span {
    right: 10px;
  }

  .y-switch .laby-fade-enter,
  .y-switch .laby-fade-leave-active {
    opacity: 0;
  }
</style>
