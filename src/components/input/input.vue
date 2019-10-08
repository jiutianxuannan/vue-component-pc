<template>
  <div :class="[
      type === 'textarea' ? 'y-textarea' : 'y-input',
      {
        'is-disabled': inputDisabled,
        'is-exceed': inputExceed,
        'y-input-group': $slots.prepend || $slots.append,
        'y-input-group--append': $slots.append,
        'y-input-group--prepend': $slots.prepend,
        'y-input--prefix': $slots.prefix || prefixIcon,
        'y-input--suffix': $slots.suffix || suffixIcon || clearable || showPassword
      }
      ]" @mouseenter="hovering = true" @mouseleave="hovering = false">
    <template v-if="type !== 'textarea'">
      <!-- 前置元素 -->
      <div class="y-input-group__prepend" v-if="$slots.prepend">
        <slot name="prepend"></slot>
      </div>
      <input :tabindex="tabindex" v-if="type !== 'textarea'" class="y-input__inner" v-bind="$attrs"
        :type="showPassword ? (passwordVisible ? 'text': 'password') : type" :disabled="inputDisabled"
        :readonly="readonly" ref="input" @compositionstart="handleCompositionStart"
        @compositionend="handleCompositionEnd" @input="handleInput" @focus="handleFocus" @blur="handleBlur"
        @change="handleChange" :aria-label="label">
      <!-- 前置内容 -->
      <span class="y-input__prefix" v-if="$slots.prefix || prefixIcon">
        <slot name="prefix"></slot>
        <i class="y-input__icon" v-if="prefixIcon" :class="prefixIcon">
        </i>
      </span>
      <!-- 后置内容 -->
      <span class="y-input__suffix" v-if="getSuffixVisible()">
        <span class="y-input__suffix-inner">
          <template v-if="!showClear || !showPwdVisible || !isWordLimitVisible">
            <slot name="suffix"></slot>
            <i class="y-input__icon" v-if="suffixIcon" :class="suffixIcon">
            </i>
          </template>
          <i v-if="showClear" class="y-input__icon y-icon-circle-close y-input__clear" @click="clear"></i>
          <i v-if="showPwdVisible" class="y-input__icon y-icon-view y-input__clear" @click="handlePasswordVisible"></i>
          <span v-if="isWordLimitVisible" class="y-input__count">
            <span class="y-input__count-inner">
              {{ textLength }}/{{ upperLimit }}
            </span>
          </span>
        </span>
        <i class="y-input__icon" v-if="validateState" :class="['y-input__validateIcon', validateIcon]">
        </i>
      </span>
      <!-- 后置元素 -->
      <div class="y-input-group__append" v-if="$slots.append">
        <slot name="append"></slot>
      </div>
    </template>
    <textarea v-else :tabindex="tabindex" class="y-textarea__inner" @compositionstart="handleCompositionStart"
      @compositionend="handleCompositionEnd" @input="handleInput" ref="textarea" v-bind="$attrs"
      :disabled="inputDisabled" :readonly="readonly" :style="textareaStyle" @focus="handleFocus" @blur="handleBlur"
      @change="handleChange" :aria-label="label">
      </textarea>
    <span v-if="isWordLimitVisible && type === 'textarea'"
      class="y-input__count">{{ textLength }}/{{ upperLimit }}</span>
  </div>
</template>
<script>
  import emitter from './emitter';
  import calcTextareaHeight from './calcTextareaHeight';
  import merge from './merge';

  export default {
    name: 'YInput',

    componentName: 'YInput',

    mixins: [emitter],

    inheritAttrs: false,

    inject: {
      elForm: {
        default: ''
      },
      elFormItem: {
        default: ''
      }
    },

    data() {
      return {
        textareaCalcStyle: {},
        hovering: false,
        focused: false,
        isComposing: false,
        passwordVisible: false
      };
    },

    props: {
      value: [String, Number],
      size: String,
      resize: String,
      form: String,
      disabled: Boolean,
      readonly: Boolean,
      type: {
        type: String,
        default: 'text'
      },
      autosize: {
        type: [Boolean, Object],
        default: false
      },
      validateEvent: {
        type: Boolean,
        default: true
      },
      suffixIcon: String,
      prefixIcon: String,
      label: String,
      clearable: {
        type: Boolean,
        default: false
      },
      showPassword: {
        type: Boolean,
        default: false
      },
      showWordLimit: {
        type: Boolean,
        default: false
      },
      tabindex: String
    },

    computed: {
      validateState() {
        return this.elFormItem ? this.elFormItem.validateState : '';
      },
      needStatusIcon() {
        return this.elForm ? this.elForm.statusIcon : false;
      },
      validateIcon() {
        return {
          validating: 'y-icon-loading',
          success: 'y-icon-circle-check',
          error: 'y-icon-circle-close'
        }[this.validateState];
      },
      textareaStyle() {
        return merge({}, this.textareaCalcStyle, { resize: this.resize });
      },
      inputSize() {
        return this.size || (this.$ELEMENT || {}).size;
      },
      inputDisabled() {
        return this.disabled || (this.elForm || {}).disabled;
      },
      nativeInputValue() {
        return this.value === null || this.value === undefined ? '' : String(this.value);
      },
      showClear() {
        return this.clearable &&
          !this.inputDisabled &&
          !this.readonly &&
          this.nativeInputValue &&
          (this.focused || this.hovering);
      },
      showPwdVisible() {
        return this.showPassword &&
          !this.inputDisabled &&
          !this.readonly &&
          (!!this.nativeInputValue || this.focused);
      },
      isWordLimitVisible() {
        return this.showWordLimit &&
          this.$attrs.maxlength &&
          (this.type === 'text' || this.type === 'textarea') &&
          !this.inputDisabled &&
          !this.readonly &&
          !this.showPassword;
      },
      upperLimit() {
        return this.$attrs.maxlength;
      },
      textLength() {
        if (typeof this.value === 'number') {
          return String(this.value).length;
        }

        return (this.value || '').length;
      },
      inputExceed() {
        return this.isWordLimitVisible &&
          (this.textLength > this.upperLimit);
      }
    },

    watch: {
      value(val) {
        this.$nextTick(this.resizeTextarea);
        if (this.validateEvent) {
          this.dispatch('YFormItem', 'el.form.change', [val]);
        }
      },
      nativeInputValue() {
        this.setNativeInputValue();
      },
      type() {
        this.$nextTick(() => {
          this.setNativeInputValue();
          this.resizeTextarea();
          this.updateIconOffset();
        });
      }
    },

    methods: {
      focus() {
        this.getInput().focus();
      },
      blur() {
        this.getInput().blur();
      },
      handleBlur(event) {
        this.focused = false;
        this.$emit('blur', event);
        if (this.validateEvent) {
          this.dispatch('YFormItem', 'el.form.blur', [this.value]);
        }
      },
      select() {
        this.getInput().select();
      },
      resizeTextarea() {
        if (this.$isServer) return;
        const { autosize, type } = this;
        if (type !== 'textarea') return;
        if (!autosize) {
          this.textareaCalcStyle = {
            minHeight: calcTextareaHeight(this.$refs.textarea).minHeight
          };
          return;
        }
        const minRows = autosize.minRows;
        const maxRows = autosize.maxRows;

        this.textareaCalcStyle = calcTextareaHeight(this.$refs.textarea, minRows, maxRows);
      },
      setNativeInputValue() {
        const input = this.getInput();
        if (!input) return;
        if (input.value === this.nativeInputValue) return;
        input.value = this.nativeInputValue;
      },
      handleFocus(event) {
        this.focused = true;
        this.$emit('focus', event);
      },
      handleCompositionStart() {
        this.isComposing = true;
      },
      handleCompositionEnd(event) {
        this.isComposing = false;
        this.handleInput(event);
      },
      handleInput(event) {
        if (this.isComposing) return;
        if (event.target.value === this.nativeInputValue) return;

        this.$emit('input', event.target.value);
        this.$nextTick(this.setNativeInputValue);
      },
      handleChange(event) {
        this.$emit('change', event.target.value);
      },
      calcIconOffset(place) {
        let elList = [].slice.call(this.$el.querySelectorAll(`.y-input__${place}`) || []);
        if (!elList.length) return;
        let el = null;
        for (let i = 0; i < elList.length; i++) {
          if (elList[i].parentNode === this.$el) {
            el = elList[i];
            break;
          }
        }
        if (!el) return;
        const pendantMap = {
          suffix: 'append',
          prefix: 'prepend'
        };

        const pendant = pendantMap[place];
        if (this.$slots[pendant]) {
          el.style.transform = `translateX(${place === 'suffix' ? '-' : ''}${this.$el.querySelector(`.y-input-group__${pendant}`).offsetWidth}px)`;
        } else {
          el.removeAttribute('style');
        }
      },
      updateIconOffset() {
        this.calcIconOffset('prefix');
        this.calcIconOffset('suffix');
      },
      clear() {
        this.$emit('input', '');
        this.$emit('change', '');
        this.$emit('clear');
      },
      handlePasswordVisible() {
        this.passwordVisible = !this.passwordVisible;
        this.focus();
      },
      getInput() {
        return this.$refs.input || this.$refs.textarea;
      },
      getSuffixVisible() {
        return this.$slots.suffix ||
          this.suffixIcon ||
          this.showClear ||
          this.showPassword ||
          this.isWordLimitVisible ||
          (this.validateState && this.needStatusIcon);
      }
    },

    created() {
      this.$on('inputSelect', this.select);
    },

    mounted() {
      this.setNativeInputValue();
      this.resizeTextarea();
      this.updateIconOffset();
    },

    updated() {
      this.$nextTick(this.updateIconOffset);
    }
  };
</script>
<style scoped>
  .y-textarea {
    position: relative;
    display: inline-block;
    width: 100%;
    vertical-align: bottom;
    font-size: 14px;
  }

  .y-textarea__inner {
    display: block;
    resize: vertical;
    padding: 5px 15px;
    line-height: 1.5;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    width: 100%;
    font-size: inherit;
    color: #606266;
    background-color: #FFFFFF;
    background-image: none;
    border: 1px solid #DCDFE6;
    border-radius: 4px;
    -webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  }

  .y-textarea__inner::-webkit-input-placeholder {
    color: #C0C4CC;
  }

  .y-textarea__inner::-moz-placeholder {
    color: #C0C4CC;
  }

  .y-textarea__inner:-ms-input-placeholder {
    color: #C0C4CC;
  }

  .y-textarea__inner::-ms-input-placeholder {
    color: #C0C4CC;
  }

  .y-textarea__inner::placeholder {
    color: #C0C4CC;
  }

  .y-textarea__inner:hover {
    border-color: #C0C4CC;
  }

  .y-textarea__inner:focus {
    outline: none;
    border-color: #409EFF;
  }

  .y-textarea .y-input__count {
    color: #909399;
    background: #FFFFFF;
    position: absolute;
    font-size: 12px;
    bottom: 5px;
    right: 10px;
  }

  .y-textarea.is-disabled .y-textarea__inner {
    background-color: #F5F7FA;
    border-color: #E4E7ED;
    color: #C0C4CC;
    cursor: not-allowed;
  }

  .y-textarea.is-disabled .y-textarea__inner::-webkit-input-placeholder {
    color: #C0C4CC;
  }

  .y-textarea.is-disabled .y-textarea__inner::-moz-placeholder {
    color: #C0C4CC;
  }

  .y-textarea.is-disabled .y-textarea__inner:-ms-input-placeholder {
    color: #C0C4CC;
  }

  .y-textarea.is-disabled .y-textarea__inner::-ms-input-placeholder {
    color: #C0C4CC;
  }

  .y-textarea.is-disabled .y-textarea__inner::placeholder {
    color: #C0C4CC;
  }

  .y-textarea.is-exceed .y-textarea__inner {
    border-color: #F56C6C;
  }

  .y-textarea.is-exceed .y-input__count {
    color: #F56C6C;
  }

  .y-input {
    position: relative;
    font-size: 14px;
    display: inline-block;
    width: 100%;
  }

  .y-input::-webkit-scrollbar {
    z-index: 11;
    width: 6px;
  }

  .y-input::-webkit-scrollbar:horizontal {
    height: 6px;
  }

  .y-input::-webkit-scrollbar-thumb {
    border-radius: 5px;
    width: 6px;
    background: #b4bccc;
  }

  .y-input::-webkit-scrollbar-corner {
    background: #fff;
  }

  .y-input::-webkit-scrollbar-track {
    background: #fff;
  }

  .y-input::-webkit-scrollbar-track-piece {
    background: #fff;
    width: 6px;
  }

  .y-input .y-input__clear {
    color: #C0C4CC;
    font-size: 14px;
    cursor: pointer;
    -webkit-transition: color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    transition: color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  }

  .y-input .y-input__clear:hover {
    color: #909399;
  }

  .y-input .y-input__count {
    height: 100%;
    display: -webkit-inline-box;
    display: -ms-inline-flexbox;
    display: inline-flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    color: #909399;
    font-size: 12px;
  }

  .y-input .y-input__count .y-input__count-inner {
    background: #FFFFFF;
    line-height: initial;
    display: inline-block;
    padding: 0 5px;
  }

  .y-input__inner {
    -webkit-appearance: none;
    background-color: #FFFFFF;
    background-image: none;
    border-radius: 4px;
    border: 1px solid #DCDFE6;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    color: #606266;
    display: inline-block;
    font-size: inherit;
    height: 35px;
    line-height: 35px;
    outline: none;
    padding: 0 15px;
    -webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    width: 100%;
  }

  .y-input__inner::-webkit-input-placeholder {
    color: #C0C4CC;
  }

  .y-input__inner::-moz-placeholder {
    color: #C0C4CC;
  }

  .y-input__inner:-ms-input-placeholder {
    color: #C0C4CC;
  }

  .y-input__inner::-ms-input-placeholder {
    color: #C0C4CC;
  }

  .y-input__inner::placeholder {
    color: #C0C4CC;
  }

  .y-input__inner:hover {
    border-color: #C0C4CC;
  }

  .y-input__inner:focus {
    outline: none;
    border-color: #409EFF;
  }

  .y-input__suffix {
    position: absolute;
    height: 100%;
    right: 5px;
    top: 0;
    text-align: center;
    color: #C0C4CC;
    -webkit-transition: all .3s;
    transition: all .3s;
    pointer-events: none;
  }

  .y-input__suffix-inner {
    pointer-events: all;
  }

  .y-input__prefix {
    position: absolute;
    height: 100%;
    left: 5px;
    top: 0;
    text-align: center;
    color: #C0C4CC;
    -webkit-transition: all .3s;
    transition: all .3s;
  }

  .y-input__icon {
    height: 100%;
    width: 25px;
    text-align: center;
    -webkit-transition: all .3s;
    transition: all .3s;
    line-height: 35px;
  }

  .y-input__icon:after {
    content: '';
    height: 100%;
    width: 0;
    display: inline-block;
    vertical-align: middle;
  }

  .y-input__validateIcon {
    pointer-events: none;
  }

  .y-input.is-active .y-input__inner {
    outline: none;
    border-color: #409EFF;
  }

  .y-input.is-disabled .y-input__inner {
    background-color: #F5F7FA;
    border-color: #E4E7ED;
    color: #C0C4CC;
    cursor: not-allowed;
  }

  .y-input.is-disabled .y-input__inner::-webkit-input-placeholder {
    color: #C0C4CC;
  }

  .y-input.is-disabled .y-input__inner::-moz-placeholder {
    color: #C0C4CC;
  }

  .y-input.is-disabled .y-input__inner:-ms-input-placeholder {
    color: #C0C4CC;
  }

  .y-input.is-disabled .y-input__inner::-ms-input-placeholder {
    color: #C0C4CC;
  }

  .y-input.is-disabled .y-input__inner::placeholder {
    color: #C0C4CC;
  }

  .y-input.is-disabled .y-input__icon {
    cursor: not-allowed;
  }

  .y-input.is-exceed .y-input__inner {
    border-color: #F56C6C;
  }

  .y-input.is-exceed .y-input__suffix .y-input__count {
    color: #F56C6C;
  }

  .y-input--suffix .y-input__inner {
    padding-right: 30px;
  }

  .y-input--prefix .y-input__inner {
    padding-left: 30px;
  }

  .y-input-group {
    line-height: normal;
    display: inline-table;
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }

  .y-input-group>.y-input__inner {
    vertical-align: middle;
    display: table-cell;
  }

  .y-input-group__append,
  .y-input-group__prepend {
    background-color: #F5F7FA;
    color: #909399;
    vertical-align: middle;
    display: table-cell;
    position: relative;
    border: 1px solid #DCDFE6;
    border-radius: 4px;
    padding: 0 20px;
    width: 1px;
    white-space: nowrap;
  }

  .y-input-group__append:focus,
  .y-input-group__prepend:focus {
    outline: none;
  }

  .y-input-group__append .y-select,
  .y-input-group__append .y-button,
  .y-input-group__prepend .y-select,
  .y-input-group__prepend .y-button {
    display: inline-block;
    margin: -10px -20px;
  }

  .y-input-group__append button.y-button,
  .y-input-group__append div.y-select .y-input__inner,
  .y-input-group__append div.y-select:hover .y-input__inner,
  .y-input-group__prepend button.y-button,
  .y-input-group__prepend div.y-select .y-input__inner,
  .y-input-group__prepend div.y-select:hover .y-input__inner {
    border-color: transparent;
    background-color: transparent;
    color: inherit;
    border-top: 0;
    border-bottom: 0;
  }

  .y-input-group__append .y-button,
  .y-input-group__append .y-input,
  .y-input-group__prepend .y-button,
  .y-input-group__prepend .y-input {
    font-size: inherit;
  }

  .y-input-group__prepend {
    border-right: 0;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .y-input-group__append {
    border-left: 0;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  .y-input-group--prepend .y-input__inner {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  .y-input-group--prepend .y-select .y-input.is-focus .y-input__inner {
    border-color: transparent;
  }

  .y-input-group--append .y-input__inner {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .y-input-group--append .y-select .y-input.is-focus .y-input__inner {
    border-color: transparent;
  }

  /** disalbe default clear on IE */
  .y-input__inner::-ms-clear {
    display: none;
    width: 0;
    height: 0;
  }
</style>
