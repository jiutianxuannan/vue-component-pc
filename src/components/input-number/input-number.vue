<template>
  <div @dragstart.prevent :class="[
        'y-input-number',
        { 'is-disabled': inputNumberDisabled },
        { 'is-without-controls': !controls },
        { 'is-controls-right': controlsAtRight }
      ]">
    <span class="y-input-number__decrease" role="button" v-if="controls" v-repeat-click="decrease"
      :class="{'is-disabled': minDisabled}" @keydown.enter="decrease">
      <i :class="`y-icon-${controlsAtRight ? 'arrow-down' : 'minus'}`"></i>
    </span>
    <span class="y-input-number__increase" role="button" v-if="controls" v-repeat-click="increase"
      :class="{'is-disabled': maxDisabled}" @keydown.enter="increase">
      <i :class="`y-icon-${controlsAtRight ? 'arrow-up' : 'plus'}`"></i>
    </span>
    <y-input ref="input" :value="displayValue" :placeholder="placeholder" :disabled="inputNumberDisabled" :max="max"
      :min="min" :name="name" :label="label" @keydown.up.native.prevent="increase"
      @keydown.down.native.prevent="decrease" @blur="handleBlur" @focus="handleFocus" @input="handleInput"
      @change="handleInputChange">
    </y-input>
  </div>
</template>
<script>
  import YInput from '@/components/input/input';
  import Focus from './focus';
  import RepeatClick from './repeat-click';

  export default {
    name: 'ElInputNumber',
    mixins: [Focus('input')],
    inject: {
      elForm: {
        default: ''
      },
      elFormItem: {
        default: ''
      }
    },
    directives: {
      repeatClick: RepeatClick
    },
    components: {
      YInput
    },
    props: {
      step: {
        type: Number,
        default: 1
      },
      stepStrictly: {
        type: Boolean,
        default: false
      },
      max: {
        type: Number,
        default: Infinity
      },
      min: {
        type: Number,
        default: -Infinity
      },
      value: {},
      disabled: Boolean,
      size: String,
      controls: {
        type: Boolean,
        default: true
      },
      controlsPosition: {
        type: String,
        default: ''
      },
      name: String,
      label: String,
      placeholder: String,
      precision: {
        type: Number,
        validator(val) {
          return val >= 0 && val === parseInt(val, 10);
        }
      }
    },
    data() {
      return {
        currentValue: 0,
        userInput: null
      };
    },
    // watch去掉好像也可以
    watch: {
      value: {
        immediate: true,
        handler(value) {
          let newVal = value === undefined ? value : Number(value);
          if (newVal !== undefined) {
            if (isNaN(newVal)) {
              return;
            }

            if (this.stepStrictly) {
              const stepPrecision = this.getPrecision(this.step);
              const precisionFactor = Math.pow(10, stepPrecision);
              newVal = Math.round(newVal / this.step) * precisionFactor * this.step / precisionFactor;
            }

            if (this.precision !== undefined) {
              newVal = this.toPrecision(newVal, this.precision);
            }
          }
          if (newVal >= this.max) newVal = this.max;
          if (newVal <= this.min) newVal = this.min;
          this.currentValue = newVal;
          this.userInput = null;
          this.$emit('input', newVal);
        }
      }
    },
    computed: {
      minDisabled() {
        return this._decrease(this.value, this.step) < this.min;
      },
      maxDisabled() {
        return this._increase(this.value, this.step) > this.max;
      },
      numPrecision() {
        const { value, step, getPrecision, precision } = this;
        const stepPrecision = getPrecision(step);
        if (precision !== undefined) {
          if (stepPrecision > precision) {
            console.warn('[Element Warn][InputNumber]precision should not be less than the decimal places of step');
          }
          return precision;
        } else {
          return Math.max(getPrecision(value), stepPrecision);
        }
      },
      controlsAtRight() {
        return this.controls && this.controlsPosition === 'right';
      },
      inputNumberDisabled() {
        return this.disabled || (this.elForm || {}).disabled;
      },
      displayValue() {
        if (this.userInput !== null) {
          return this.userInput;
        }

        let currentValue = this.currentValue;

        if (typeof currentValue === 'number') {
          if (this.stepStrictly) {
            const stepPrecision = this.getPrecision(this.step);
            const precisionFactor = Math.pow(10, stepPrecision);
            currentValue = Math.round(currentValue / this.step) * precisionFactor * this.step / precisionFactor;
          }

          if (this.precision !== undefined) {
            currentValue = currentValue.toFixed(this.precision);
          }
        }
        return currentValue;
      }
    },
    methods: {
      toPrecision(num, precision) {
        if (precision === undefined) precision = this.numPrecision;
        return parseFloat(Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision));
      },
      getPrecision(value) {
        if (value === undefined) return 0;
        const valueString = value.toString();
        const dotPosition = valueString.indexOf('.');
        let precision = 0;
        if (dotPosition !== -1) {
          precision = valueString.length - dotPosition - 1;
        }
        return precision;
      },
      _increase(val, step) {
        if (typeof val !== 'number' && val !== undefined) return this.currentValue;

        const precisionFactor = Math.pow(10, this.numPrecision);
        // Solve the accuracy problem of JS decimal calculation by converting the value to integer.
        return this.toPrecision((precisionFactor * val + precisionFactor * step) / precisionFactor);
      },
      _decrease(val, step) {
        if (typeof val !== 'number' && val !== undefined) return this.currentValue;
        const precisionFactor = Math.pow(10, this.numPrecision);

        return this.toPrecision((precisionFactor * val - precisionFactor * step) / precisionFactor);
      },
      increase() {
        if (this.inputNumberDisabled || this.maxDisabled) return;
        const value = this.value || 0;
        const newVal = this._increase(value, this.step);
        this.setCurrentValue(newVal);
      },
      decrease() {
        if (this.inputNumberDisabled || this.minDisabled) return;
        const value = this.value || 0;
        const newVal = this._decrease(value, this.step);
        this.setCurrentValue(newVal);
      },
      handleBlur(event) {
        this.$emit('blur', event);
      },
      handleFocus(event) {
        this.$emit('focus', event);
      },
      setCurrentValue(newVal) {
        const oldVal = this.currentValue;
        if (typeof newVal === 'number' && this.precision !== undefined) {
          newVal = this.toPrecision(newVal, this.precision);
        }
        if (newVal >= this.max) newVal = this.max;
        if (newVal <= this.min) newVal = this.min;
        if (oldVal === newVal) return;
        this.userInput = null;
        this.$emit('input', newVal);
        this.$emit('change', newVal, oldVal);
        this.currentValue = newVal;
      },
      handleInput(value) {
        this.userInput = value;
      },
      handleInputChange(value) {
        const newVal = value === '' ? undefined : Number(value);
        if (!isNaN(newVal)) {
          this.setCurrentValue(newVal);
        }
        this.userInput = null;
      },
      select() {
        this.$refs.input.select();
      }
    },
    mounted() {
      let innerInput = this.$refs.input.$refs.input;
      innerInput.setAttribute('role', 'spinbutton');
      innerInput.setAttribute('aria-valuemax', this.max);
      innerInput.setAttribute('aria-valuemin', this.min);
      innerInput.setAttribute('aria-valuenow', this.currentValue);
      innerInput.setAttribute('aria-disabled', this.inputNumberDisabled);
    },
    updated() {
      if (!this.$refs || !this.$refs.input) return;
      const innerInput = this.$refs.input.$refs.input;
      innerInput.setAttribute('aria-valuenow', this.currentValue);
    }
  };
</script>
<style scoped>
  .y-input-number {
    position: relative;
    display: inline-block;
    width: 180px;
    line-height: 33px;
  }

  .y-input-number .y-input {
    display: block;
  }

  .y-input-number .y-input__inner {
    -webkit-appearance: none;
    padding-left: 50px;
    padding-right: 50px;
    text-align: center;
  }

  .y-input-number__increase,
  .y-input-number__decrease {
    position: absolute;
    z-index: 1;
    top: 1px;
    width: 40px;
    height: auto;
    text-align: center;
    /* background: #F5F7FA; */
    color: #606266;
    cursor: pointer;
    font-size: 13px;
  }

  .y-input-number__increase:hover,
  .y-input-number__decrease:hover {
    color: #409EFF;
  }

  .y-input-number__increase:hover:not(.is-disabled)~.y-input .y-input__inner:not(.is-disabled),
  .y-input-number__decrease:hover:not(.is-disabled)~.y-input .y-input__inner:not(.is-disabled) {
    border-color: #409EFF;
  }

  .y-input-number__increase.is-disabled,
  .y-input-number__decrease.is-disabled {
    color: #C0C4CC;
    cursor: not-allowed;
  }

  .y-input-number__increase {
    right: 1px;
    border-radius: 0 4px 4px 0;
    border-left: 1px solid #DCDFE6;
  }

  .y-input-number__decrease {
    left: 1px;
    border-radius: 4px 0 0 4px;
    border-right: 1px solid #DCDFE6;
  }

  .y-input-number.is-disabled .y-input-number__increase,
  .y-input-number.is-disabled .y-input-number__decrease {
    border-color: #E4E7ED;
    color: #E4E7ED;
  }

  .y-input-number.is-disabled .y-input-number__increase:hover,
  .y-input-number.is-disabled .y-input-number__decrease:hover {
    color: #E4E7ED;
    cursor: not-allowed;
  }

  .y-input-number.is-without-controls .y-input__inner {
    padding-left: 15px;
    padding-right: 15px;
  }

  .y-input-number.is-controls-right .y-input__inner {
    padding-left: 15px;
    padding-right: 50px;
  }

  .y-input-number.is-controls-right .y-input-number__increase,
  .y-input-number.is-controls-right .y-input-number__decrease {
    height: auto;
    line-height: 16px;
  }

  .y-input-number.is-controls-right .y-input-number__increase [class*=y-icon],
  .y-input-number.is-controls-right .y-input-number__decrease [class*=y-icon] {
    -webkit-transform: scale(0.8);
    transform: scale(0.8);
  }

  .y-input-number.is-controls-right .y-input-number__increase {
    border-radius: 0 4px 0 0;
    border-bottom: 1px solid #DCDFE6;
  }

  .y-input-number.is-controls-right .y-input-number__decrease {
    right: 1px;
    bottom: 1px;
    top: auto;
    left: auto;
    border-right: none;
    border-left: 1px solid #DCDFE6;
    border-radius: 0 0 4px 0;
  }
</style>
