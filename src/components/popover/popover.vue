<template>
  <span>
    <transition :name="transition" @after-enter="handleAfterEnter" @after-leave="handleAfterLeave">
      <div class="y-popover y-popper" :class="[popperClass, content && 'y-popover--plain']" ref="popper"
        v-show="!disabled && showPopper" :style="{ width: width + 'px' }" role="tooltip" :id="tooltipId"
        :aria-hidden="(disabled || !showPopper) ? 'true' : 'false'">
        <div class="y-popover__title" v-if="title" v-text="title"></div>
        <slot>{{ content }}</slot>
      </div>
    </transition>
    <slot name="reference"></slot>
  </span>
</template>
<script>
  import Popper from './popper/vue-popper';
  import { on, off, addClass, removeClass, generateId } from './util';

  export default {
    name: 'YPopover',

    mixins: [Popper],

    props: {
      trigger: {
        type: String,
        default: 'click',
        validator: value => ['click', 'focus', 'hover', 'manual'].indexOf(value) > -1
      },
      openDelay: {
        type: Number,
        default: 0
      },
      closeDelay: {
        type: Number,
        default: 200
      },
      title: String,
      disabled: Boolean,
      content: String,
      reference: {},
      popperClass: String,
      width: {},
      visibleArrow: {
        default: true
      },
      arrowOffset: {
        type: Number,
        default: 0
      },
      transition: {
        type: String,
        default: 'fade-in-linear'
      },
      tabindex: {
        type: Number,
        default: 0
      }
    },

    computed: {
      tooltipId() {
        return `y-popover-${generateId()}`;
      }
    },
    watch: {
      showPopper(val) {
        if (this.disabled) {
          return;
        }
        val ? this.$emit('show') : this.$emit('hide');
      }
    },

    mounted() {
      let reference = this.referenceElm = this.reference || this.$refs.reference;
      const popper = this.popper || this.$refs.popper;

      if (!reference && this.$slots.reference && this.$slots.reference[0]) {
        reference = this.referenceElm = this.$slots.reference[0].elm;
      }
      // 可访问性
      if (reference) {
        addClass(reference, 'y-popover__reference');
        reference.setAttribute('aria-describedby', this.tooltipId);
        reference.setAttribute('tabindex', this.tabindex); // tab序列
        popper.setAttribute('tabindex', 0);

        if (this.trigger !== 'click') {
          on(reference, 'focusin', () => {
            this.handleFocus();
            const instance = reference.__vue__;
            if (instance && typeof instance.focus === 'function') {
              instance.focus();
            }
          });
          on(popper, 'focusin', this.handleFocus);
          on(reference, 'focusout', this.handleBlur);
          on(popper, 'focusout', this.handleBlur);
        }
        on(reference, 'keydown', this.handleKeydown);
        on(reference, 'click', this.handleClick);
      }
      if (this.trigger === 'click') {
        on(reference, 'click', this.doToggle);
        on(document, 'click', this.handleDocumentClick);
      } else if (this.trigger === 'hover') {
        on(reference, 'mouseenter', this.handleMouseEnter);
        on(popper, 'mouseenter', this.handleMouseEnter);
        on(reference, 'mouseleave', this.handleMouseLeave);
        on(popper, 'mouseleave', this.handleMouseLeave);
      } else if (this.trigger === 'focus') {
        if (this.tabindex < 0) {
          console.warn('[Element Warn][Popover]a negative taindex means that the element cannot be focused by tab key');
        }
        if (reference.querySelector('input, textarea')) {
          on(reference, 'focusin', this.doShow);
          on(reference, 'focusout', this.doClose);
        } else {
          on(reference, 'mousedown', this.doShow);
          on(reference, 'mouseup', this.doClose);
        }
      }
    },

    beforeDestroy() {
      this.cleanup();
    },

    deactivated() {
      this.cleanup();
    },

    methods: {
      doToggle() {
        this.showPopper = !this.showPopper;
      },
      doShow() {
        this.showPopper = true;
      },
      doClose() {
        this.showPopper = false;
      },
      handleFocus() {
        addClass(this.referenceElm, 'focusing');
        if (this.trigger === 'click' || this.trigger === 'focus') this.showPopper = true;
      },
      handleClick() {
        removeClass(this.referenceElm, 'focusing');
      },
      handleBlur() {
        removeClass(this.referenceElm, 'focusing');
        if (this.trigger === 'click' || this.trigger === 'focus') this.showPopper = false;
      },
      handleMouseEnter() {
        clearTimeout(this._timer);
        if (this.openDelay) {
          this._timer = setTimeout(() => {
            this.showPopper = true;
          }, this.openDelay);
        } else {
          this.showPopper = true;
        }
      },
      handleKeydown(ev) {
        if (ev.keyCode === 27 && this.trigger !== 'manual') { // esc
          this.doClose();
        }
      },
      handleMouseLeave() {
        clearTimeout(this._timer);
        if (this.closeDelay) {
          this._timer = setTimeout(() => {
            this.showPopper = false;
          }, this.closeDelay);
        } else {
          this.showPopper = false;
        }
      },
      handleDocumentClick(e) {
        let reference = this.reference || this.$refs.reference;
        const popper = this.popper || this.$refs.popper;

        if (!reference && this.$slots.reference && this.$slots.reference[0]) {
          reference = this.referenceElm = this.$slots.reference[0].elm;
        }
        if (!this.$el ||
          !reference ||
          this.$el.contains(e.target) ||
          reference.contains(e.target) ||
          !popper ||
          popper.contains(e.target)) return;
        this.showPopper = false;
      },
      handleAfterEnter() {
        this.$emit('after-enter');
      },
      handleAfterLeave() {
        this.$emit('after-leave');
        this.doDestroy();
      },
      cleanup() {
        if (this.openDelay || this.closeDelay) {
          clearTimeout(this._timer);
        }
      }
    },

    destroyed() {
      const reference = this.reference;

      off(reference, 'click', this.doToggle);
      off(reference, 'mouseup', this.doClose);
      off(reference, 'mousedown', this.doShow);
      off(reference, 'focusin', this.doShow);
      off(reference, 'focusout', this.doClose);
      off(reference, 'mousedown', this.doShow);
      off(reference, 'mouseup', this.doClose);
      off(reference, 'mouseleave', this.handleMouseLeave);
      off(reference, 'mouseenter', this.handleMouseEnter);
      off(document, 'click', this.handleDocumentClick);
    }
  };
</script>
<style scoped>
  .y-popper .popper__arrow,
  .y-popper .popper__arrow::after {
    position: absolute;
    display: block;
    width: 0;
    height: 0;
    border-color: transparent;
    border-style: solid;
  }

  .y-popper .popper__arrow {
    border-width: 6px;
    -webkit-filter: drop-shadow(0 2px 12px rgba(0, 0, 0, 0.03));
    filter: drop-shadow(0 2px 12px rgba(0, 0, 0, 0.03));
  }

  .y-popper .popper__arrow::after {
    content: " ";
    border-width: 6px;
  }

  .y-popper[x-placement^="top"] {
    margin-bottom: 12px;
  }

  .y-popper[x-placement^="top"] .popper__arrow {
    bottom: -6px;
    left: 50%;
    margin-right: 3px;
    border-top-color: #EBEEF5;
    border-bottom-width: 0;
  }

  .y-popper[x-placement^="top"] .popper__arrow::after {
    bottom: 1px;
    margin-left: -6px;
    border-top-color: #FFFFFF;
    border-bottom-width: 0;
  }

  .y-popper[x-placement^="bottom"] {
    margin-top: 12px;
  }

  .y-popper[x-placement^="bottom"] .popper__arrow {
    top: -6px;
    left: 50%;
    margin-right: 3px;
    border-top-width: 0;
    border-bottom-color: #EBEEF5;
  }

  .y-popper[x-placement^="bottom"] .popper__arrow::after {
    top: 1px;
    margin-left: -6px;
    border-top-width: 0;
    border-bottom-color: #FFFFFF;
  }

  .y-popper[x-placement^="right"] {
    margin-left: 12px;
  }

  .y-popper[x-placement^="right"] .popper__arrow {
    top: 50%;
    left: -6px;
    margin-bottom: 3px;
    border-right-color: #EBEEF5;
    border-left-width: 0;
  }

  .y-popper[x-placement^="right"] .popper__arrow::after {
    bottom: -6px;
    left: 1px;
    border-right-color: #FFFFFF;
    border-left-width: 0;
  }

  .y-popper[x-placement^="left"] {
    margin-right: 12px;
  }

  .y-popper[x-placement^="left"] .popper__arrow {
    top: 50%;
    right: -6px;
    margin-bottom: 3px;
    border-right-width: 0;
    border-left-color: #EBEEF5;
  }

  .y-popper[x-placement^="left"] .popper__arrow::after {
    right: 1px;
    bottom: -6px;
    margin-left: -6px;
    border-right-width: 0;
    border-left-color: #FFFFFF;
  }

  .y-popover {
    position: absolute;
    background: #FFFFFF;
    min-width: 150px;
    border-radius: 4px;
    border: 1px solid #EBEEF5;
    padding: 12px;
    z-index: 2000;
    color: #606266;
    line-height: 1.4;
    text-align: justify;
    font-size: 14px;
    -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    word-break: break-all;
  }

  .y-popover--plain {
    padding: 18px 20px;
  }

  .y-popover__title {
    color: #303133;
    font-size: 16px;
    line-height: 1;
    margin-bottom: 12px;
  }

  .y-popover__reference:focus:not(.focusing),
  .y-popover__reference:focus:hover {
    outline-width: 0;
  }

  .y-popover:focus:active,
  .y-popover:focus {
    outline-width: 0;
  }
</style>
