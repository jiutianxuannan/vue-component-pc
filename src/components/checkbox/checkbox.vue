<template>
  <label class="y-checkbox" :class="[
        { 'is-disabled': isDisabled },
        { 'is-checked': isChecked }
      ]" role="checkbox" :aria-checked="indeterminate ? 'mixed': isChecked" :aria-disabled="isDisabled" :id="id">
    <span class="y-checkbox__input" :class="{
          'is-disabled': isDisabled,
          'is-checked': isChecked,
          'is-indeterminate': indeterminate,
          'is-focus': focus
        }" aria-checked="mixed">
      <span class="y-checkbox__inner"></span>
      <input v-if="trueLabel || falseLabel" class="y-checkbox__original" type="checkbox" aria-hidden="true" :name="name"
        :disabled="isDisabled" :true-value="trueLabel" :false-value="falseLabel" v-model="model" @change="handleChange"
        @focus="focus = true" @blur="focus = false">
      <input v-else class="y-checkbox__original" type="checkbox" aria-hidden="true" :disabled="isDisabled"
        :value="label" :name="name" v-model="model" @change="handleChange" @focus="focus = true" @blur="focus = false">
    </span>
    <span class="y-checkbox__label" v-if="$slots.default || label">
      <slot></slot>
      <template v-if="!$slots.default">{{label}}</template>
    </span>
  </label>
</template>
<script>
  import Emitter from './emitter';

  export default {
    name: 'YCheckbox',

    mixins: [Emitter],

    inject: {
      elForm: {
        default: ''
      },
      elFormItem: {
        default: ''
      }
    },

    componentName: 'YCheckbox',

    data() {
      return {
        selfModel: false,
        focus: false,
        isLimitExceeded: false
      };
    },

    computed: {
      model: {
        get() {
          return this.isGroup
            ? this.store : this.value !== undefined
              ? this.value : this.selfModel;
        },

        set(val) {
          if (this.isGroup) {
            this.isLimitExceeded = false;
            (this._checkboxGroup.min !== undefined &&
              val.length < this._checkboxGroup.min &&
              (this.isLimitExceeded = true));

            (this._checkboxGroup.max !== undefined &&
              val.length > this._checkboxGroup.max &&
              (this.isLimitExceeded = true));

            this.isLimitExceeded === false &&
              this.dispatch('YCheckboxGroup', 'input', [val]);
          } else {
            this.$emit('input', val);
            this.selfModel = val;
          }
        }
      },

      isChecked() {
        if ({}.toString.call(this.model) === '[object Boolean]') {
          return this.model;
        } else if (Array.isArray(this.model)) {
          return this.model.indexOf(this.label) > -1;
        } else if (this.model !== null && this.model !== undefined) {
          return this.model === this.trueLabel;
        }
      },

      isGroup() {
        let parent = this.$parent;
        while (parent) {
          if (parent.$options.componentName !== 'YCheckboxGroup') {
            parent = parent.$parent;
          } else {
            this._checkboxGroup = parent;
            return true;
          }
        }
        return false;
      },

      store() {
        return this._checkboxGroup ? this._checkboxGroup.value : this.value;
      },

      /* used to make the isDisabled judgment under max/min props */
      isLimitDisabled() {
        const { max, min } = this._checkboxGroup;
        return !!(max || min) &&
          (this.model.length >= max && !this.isChecked) ||
          (this.model.length <= min && this.isChecked);
      },

      isDisabled() {
        return this.isGroup
          ? this._checkboxGroup.disabled || this.disabled || (this.elForm || {}).disabled || this.isLimitDisabled
          : this.disabled || (this.elForm || {}).disabled;
      }
    },

    props: {
      value: {},
      label: {},
      indeterminate: Boolean,
      disabled: Boolean,
      checked: Boolean,
      name: String,
      trueLabel: [String, Number],
      falseLabel: [String, Number],
      id: String, /* 当indeterminate为真时，为controls提供相关连的checkbox的id，表明元素间的控制关系*/
      controls: String, /* 当indeterminate为真时，为controls提供相关连的checkbox的id，表明元素间的控制关系*/
    },

    methods: {
      addToStore() {
        if (
          Array.isArray(this.model) &&
          this.model.indexOf(this.label) === -1
        ) {
          this.model.push(this.label);
        } else {
          this.model = this.trueLabel || true;
        }
      },
      handleChange(ev) {
        if (this.isLimitExceeded) return;
        let value;
        if (ev.target.checked) {
          value = this.trueLabel === undefined ? true : this.trueLabel;
        } else {
          value = this.falseLabel === undefined ? false : this.falseLabel;
        }
        this.$emit('change', value, ev);
        this.$nextTick(() => {
          if (this.isGroup) {
            this.dispatch('YCheckboxGroup', 'change', [this._checkboxGroup.value]);
          }
        });
      }
    },

    created() {
      this.checked && this.addToStore();
    },
    mounted() { // 为indeterminate元素 添加aria-controls 属性
      if (this.indeterminate) {
        this.$el.setAttribute('aria-controls', this.controls);
      }
    },

    watch: {
      value(value) {
        this.dispatch('YFormItem', 'el.form.change', value);
      }
    }
  };
</script>
<style scoped>
  .y-checkbox {
    color: #606266;
    font-weight: 500;
    font-size: 14px;
    position: relative;
    cursor: pointer;
    display: inline-block;
    white-space: nowrap;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    margin-right: 30px;
  }

  .y-checkbox__input {
    white-space: nowrap;
    cursor: pointer;
    outline: none;
    display: inline-block;
    line-height: 1;
    position: relative;
    vertical-align: middle;
  }

  .y-checkbox__input.is-disabled .y-checkbox__inner {
    background-color: #edf2fc;
    border-color: #DCDFE6;
    cursor: not-allowed;
  }

  .y-checkbox__input.is-disabled .y-checkbox__inner::after {
    cursor: not-allowed;
    border-color: #C0C4CC;
  }

  .y-checkbox__input.is-disabled .y-checkbox__inner+.y-checkbox__label {
    cursor: not-allowed;
  }

  .y-checkbox__input.is-disabled.is-checked .y-checkbox__inner {
    background-color: #F2F6FC;
    border-color: #DCDFE6;
  }

  .y-checkbox__input.is-disabled.is-checked .y-checkbox__inner::after {
    border-color: #C0C4CC;
  }

  .y-checkbox__input.is-disabled.is-indeterminate .y-checkbox__inner {
    background-color: #F2F6FC;
    border-color: #DCDFE6;
  }

  .y-checkbox__input.is-disabled.is-indeterminate .y-checkbox__inner::before {
    background-color: #C0C4CC;
    border-color: #C0C4CC;
  }

  .y-checkbox__input.is-disabled+span.y-checkbox__label {
    color: #C0C4CC;
    cursor: not-allowed;
  }

  .y-checkbox__input.is-checked .y-checkbox__inner {
    background-color: #409EFF;
    border-color: #409EFF;
  }

  .y-checkbox__input.is-checked .y-checkbox__inner::after {
    -webkit-transform: rotate(45deg) scaleY(1);
    transform: rotate(45deg) scaleY(1);
  }

  .y-checkbox__input.is-indeterminate .y-checkbox__inner {
    background-color: #409EFF;
    border-color: #409EFF;
  }

  .y-checkbox__input.is-indeterminate .y-checkbox__inner::before {
    content: '';
    position: absolute;
    display: block;
    background-color: #FFFFFF;
    height: 4px;
    -webkit-transform: scale(0.5);
    transform: scale(0.5);
    left: 0;
    right: 0;
    top: 4px;
  }

  .y-checkbox__input.is-indeterminate .y-checkbox__inner::after {
    display: none;
  }

  .y-checkbox__inner {
    display: inline-block;
    position: relative;
    border: 1px solid #DCDFE6;
    border-radius: 2px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    width: 14px;
    height: 14px;
    background-color: #FFFFFF;
    z-index: 1;
    -webkit-transition: border-color 0.25s cubic-bezier(0.71, -0.46, 0.29, 1.46), background-color 0.25s cubic-bezier(0.71, -0.46, 0.29, 1.46);
    transition: border-color 0.25s cubic-bezier(0.71, -0.46, 0.29, 1.46), background-color 0.25s cubic-bezier(0.71, -0.46, 0.29, 1.46);
  }

  .y-checkbox__inner:hover {
    border-color: #409EFF;
  }

  .y-checkbox__inner::after {
    -webkit-box-sizing: content-box;
    box-sizing: content-box;
    content: "";
    border: 2px solid #fff;
    border-left: 0;
    border-top: 0;
    height: 7px;
    left: 3px;
    position: absolute;
    top: 1px;
    -webkit-transform: rotate(45deg) scaleY(0);
    transform: rotate(45deg) scaleY(0);
    width: 3px;
    -webkit-transition: -webkit-transform .15s ease-in .05s;
    transition: -webkit-transform .15s ease-in .05s;
    transition: transform .15s ease-in .05s;
    -webkit-transform-origin: center;
    transform-origin: center;
  }

  .y-checkbox__original {
    opacity: 0;
    outline: none;
    position: absolute;
    margin: 0;
    width: 0;
    height: 0;
    z-index: -1;
  }

  .y-checkbox__label {
    display: inline-block;
    padding-left: 10px;
    line-height: 19px;
    font-size: 14px;
  }

  .y-checkbox:last-child {
    margin-right: 0;
  }

  .y-checkbox-group {
    font-size: 0;
  }
</style>
