<template>
  <button class="y-button" @click="handleClick" :disabled="buttonDisabled || loading" :autofocus="autofocus"
    :type="nativeType" :class="[
      type ? 'y-button--' + type : '',
      {
        'is-disabled': buttonDisabled,
        'is-loading': loading,
      }
    ]" :style="style">
    <i class="y-icon-loading" v-if="loading"></i>
    <i :class="icon" v-if="icon && !loading"></i>
    <span v-if="$slots.default">
      <slot></slot>
    </span>
  </button>
</template>
<script>
  export default {
    name: 'YButton',

    inject: {
      elForm: {
        default: ''
      },
      elFormItem: {
        default: ''
      }
    },

    props: {
      bgColor: {
        default: '#409EFF'
      },
      textColor: {
        default: '#fff'
      },
      icon: {
        type: String,
        default: ''
      },
      nativeType: {
        type: String,
        default: 'button'
      },
      loading: Boolean,
      disabled: Boolean,
      type: String,
      autofocus: Boolean
    },

    computed: {
      buttonDisabled() {
        return this.disabled || (this.elForm || {}).disabled;
      },
      style() {
        if (this.type && this.type === 'text') return this.textStyle
        return this.normalStyle
      },
      normalStyle() {
        let style = {}
        style.background = this.bgColor
        style.color = this.textColor
        style.borderColor = this.bgColor
        return style
      },
      textStyle() {
        let style = {}
        style.color = this.bgColor
        return style
      }
    },

    methods: {
      handleClick(evt) {
        this.$emit('click', evt);
      }
    }
  };
</script>
<style scoped>
  .y-button {
    display: inline-block;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    background: #FFFFFF;
    border: 1px solid #DCDFE6;
    color: #606266;
    -webkit-appearance: none;
    text-align: center;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    outline: none;
    margin: 0;
    -webkit-transition: .1s;
    transition: .1s;
    font-weight: 500;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    padding: 10px 15px;
    font-size: 14px;
    border-radius: 4px;
  }

  .y-button+.y-button {
    margin-left: 10px;
  }

  .y-button:hover,
  .y-button:focus {
    filter: opacity(80%);
  }

  .y-button:active {
    filter: opacity(80%);
    outline: none;
  }

  .y-button::-moz-focus-inner {
    border: 0;
  }

  .y-button [class*="y-icon-"]+span {
    margin-left: 5px;
  }

  .y-button.is-disabled,
  .y-button.is-disabled:hover,
  .y-button.is-disabled:focus {
    filter: opacity(60%);
    cursor: not-allowed;
    background-image: none;
  }

  .y-button.is-disabled.y-button--text {
    background-color: transparent;
  }

  .y-button.is-loading {
    position: relative;
    pointer-events: none;
  }

  .y-button.is-loading:before {
    pointer-events: none;
    content: '';
    position: absolute;
    left: -1px;
    top: -1px;
    right: -1px;
    bottom: -1px;
    border-radius: inherit;
    background-color: rgba(255, 255, 255, 0.35);
  }

  .y-button--text {
    border-color: transparent;
    background: transparent;
    padding-left: 0;
    padding-right: 0;
  }

  .y-button--text:hover,
  .y-button--text:focus {
    border-color: transparent;
    background-color: transparent;
  }

  .y-button--text:active {
    border-color: transparent;
    background-color: transparent;
  }

  .y-button--text.is-disabled,
  .y-button--text.is-disabled:hover,
  .y-button--text.is-disabled:focus {
    border-color: transparent;
    filter: opacity(60%);
  }
</style>
