<template>
  <transition name="dialog-fade" @after-enter="afterEnter" @after-leave="afterLeave">
    <div v-show="visible" class="y-dialog__wrapper" @click.self="handleWrapperClick">
      <div role="dialog" :key="key" aria-modal="true" :aria-label="title || 'dialog'"
        :class="['y-dialog', { 'is-fullscreen': fullscreen, 'y-dialog--center': center }, customClass]" ref="dialog"
        :style="style">
        <div class="y-dialog__header">
          <slot name="title">
            <span class="y-dialog__title">{{ title }}</span>
          </slot>
          <button type="button" class="y-dialog__headerbtn" aria-label="Close" v-if="showClose" @click="handleClose">
            <i class="y-dialog__close y-icon y-icon-close"></i>
          </button>
        </div>
        <div class="y-dialog__body" v-if="rendered">
          <slot></slot>
        </div>
        <div class="y-dialog__footer" v-if="$slots.footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
  import Popup from './popup';
  import emitter from './emitter';

  export default {
    name: 'YDialog',

    mixins: [Popup, emitter],

    props: {
      title: {
        type: String,
        default: ''
      },

      modal: {
        type: Boolean,
        default: true
      },

      modalAppendToBody: {
        type: Boolean,
        default: true
      },

      appendToBody: {
        type: Boolean,
        default: false
      },

      lockScroll: {
        type: Boolean,
        default: true
      },

      closeOnClickModal: {
        type: Boolean,
        default: true
      },

      closeOnPressEscape: {
        type: Boolean,
        default: true
      },

      showClose: {
        type: Boolean,
        default: true
      },

      width: String,

      fullscreen: Boolean,

      customClass: {
        type: String,
        default: ''
      },

      top: {
        type: String,
        default: '15vh'
      },
      beforeClose: Function,
      center: {
        type: Boolean,
        default: false
      },

      destroyOnClose: Boolean
    },

    data() {
      return {
        closed: false,
        key: 0
      };
    },

    watch: {
      visible(val) {
        if (val) {
          this.closed = false;
          this.$emit('open');
          this.$el.addEventListener('scroll', this.updatePopper);
          this.$nextTick(() => {
            this.$refs.dialog.scrollTop = 0;
          });
          if (this.appendToBody) {
            document.body.appendChild(this.$el);
          }
        } else {
          this.$el.removeEventListener('scroll', this.updatePopper);
          if (!this.closed) this.$emit('close');
          if (this.destroyOnClose) {
            this.$nextTick(() => {
              this.key++;
            });
          }
        }
      }
    },

    computed: {
      style() {
        let style = {};
        if (!this.fullscreen) {
          style.marginTop = this.top;
          if (this.width) {
            style.width = this.width;
          }
        }
        return style;
      }
    },

    methods: {
      handleWrapperClick() {
        if (!this.closeOnClickModal) return;
        this.handleClose();
      },
      handleClose() {
        if (typeof this.beforeClose === 'function') {
          this.beforeClose(this.hide);
        } else {
          this.hide();
        }
      },
      hide(cancel) {
        if (cancel !== false) {
          this.$emit('update:visible', false);
          this.$emit('close');
          this.closed = true;
        }
      },
      updatePopper() {
        this.broadcast('YSelectDropdown', 'updatePopper');
        this.broadcast('YDropdownMenu', 'updatePopper');
      },
      afterEnter() {
        this.$emit('opened');
      },
      afterLeave() {
        this.$emit('closed');
      }
    },

    mounted() {
      if (this.visible) {
        this.rendered = true;
        this.open();
        if (this.appendToBody) {
          document.body.appendChild(this.$el);
        }
      }
    },

    destroyed() {
      // if appendToBody is true, remove DOM node after destroy
      if (this.appendToBody && this.$el && this.$el.parentNode) {
        this.$el.parentNode.removeChild(this.$el);
      }
    }
  };
</script>
<style scoped>
  .y-dialog {
    position: relative;
    margin: 0 auto 50px;
    background: #FFFFFF;
    border-radius: 2px;
    -webkit-box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    width: 50%;
  }

  .y-dialog.is-fullscreen {
    width: 100%;
    margin-top: 0;
    margin-bottom: 0;
    height: 100%;
    overflow: auto;
  }

  .y-dialog__wrapper {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: auto;
    margin: 0;
  }

  .y-dialog__header {
    padding: 20px;
    padding-bottom: 10px;
  }

  .y-dialog__headerbtn {
    position: absolute;
    top: 20px;
    right: 20px;
    padding: 0;
    background: transparent;
    border: none;
    outline: none;
    cursor: pointer;
    font-size: 16px;
  }

  .y-dialog__headerbtn .y-dialog__close {
    color: #909399;
  }

  .y-dialog__headerbtn:focus .y-dialog__close,
  .y-dialog__headerbtn:hover .y-dialog__close {
    color: #409EFF;
  }

  .y-dialog__title {
    line-height: 24px;
    font-size: 18px;
    color: #303133;
  }

  .y-dialog__body {
    padding: 30px 20px;
    color: #606266;
    font-size: 14px;
    word-break: break-all;
  }

  .y-dialog__footer {
    padding: 20px;
    padding-top: 10px;
    text-align: right;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }

  .y-dialog--center {
    text-align: center;
  }

  .y-dialog--center .y-dialog__body {
    text-align: initial;
    padding: 25px 25px 30px;
  }

  .y-dialog--center .y-dialog__footer {
    text-align: inherit;
  }

  .dialog-fade-enter-active {
    -webkit-animation: dialog-fade-in .3s;
    animation: dialog-fade-in .3s;
  }

  .dialog-fade-leave-active {
    -webkit-animation: dialog-fade-out .3s;
    animation: dialog-fade-out .3s;
  }

  @-webkit-keyframes dialog-fade-in {
    0% {
      -webkit-transform: translate3d(0, -20px, 0);
      transform: translate3d(0, -20px, 0);
      opacity: 0;
    }

    100% {
      -webkit-transform: translate3d(0, 0, 0);
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }
  }

  @keyframes dialog-fade-in {
    0% {
      -webkit-transform: translate3d(0, -20px, 0);
      transform: translate3d(0, -20px, 0);
      opacity: 0;
    }

    100% {
      -webkit-transform: translate3d(0, 0, 0);
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }
  }

  @-webkit-keyframes dialog-fade-out {
    0% {
      -webkit-transform: translate3d(0, 0, 0);
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }

    100% {
      -webkit-transform: translate3d(0, -20px, 0);
      transform: translate3d(0, -20px, 0);
      opacity: 0;
    }
  }

  @keyframes dialog-fade-out {
    0% {
      -webkit-transform: translate3d(0, 0, 0);
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }

    100% {
      -webkit-transform: translate3d(0, -20px, 0);
      transform: translate3d(0, -20px, 0);
      opacity: 0;
    }
  }
</style>
