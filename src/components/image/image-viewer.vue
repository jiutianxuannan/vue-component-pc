<template>
  <transition name="viewer-fade">
    <div class="y-image-viewer__wrapper" :style="{ 'z-index': zIndex }">
      <div class="y-image-viewer__mask"></div>
      <!-- CLOSE -->
      <span class="y-image-viewer__btn y-image-viewer__close" @click="hide">
        <i class="y-icon-circle-close"></i>
      </span>
      <!-- ARROW -->
      <template v-if="!isSingle">
        <span class="y-image-viewer__btn y-image-viewer__prev" :class="{ 'is-disabled': !infinite && isFirst }"
          @click="prev">
          <i class="y-icon-arrow-left" />
        </span>
        <span class="y-image-viewer__btn y-image-viewer__next" :class="{ 'is-disabled': !infinite && isLast }"
          @click="next">
          <i class="y-icon-arrow-right" />
        </span>
      </template>
      <!-- ACTIONS -->
      <div class="y-image-viewer__btn y-image-viewer__actions">
        <div class="y-image-viewer__actions__inner">
          <i class="y-icon-zoom-out" @click="handleActions('zoomOut')"></i>
          <i class="y-icon-zoom-in" @click="handleActions('zoomIn')"></i>
          <i class="y-image-viewer__actions__divider"></i>
          <i :class="mode.icon" @click="toggleMode"></i>
          <i class="y-image-viewer__actions__divider"></i>
          <i class="y-icon-refresh-left" @click="handleActions('anticlocelise')"></i>
          <i class="y-icon-refresh-right" @click="handleActions('clocelise')"></i>
        </div>
      </div>
      <!-- CANVAS -->
      <div class="y-image-viewer__canvas">
        <img v-for="(url, i) in urlList" v-if="i === index" ref="img" class="y-image-viewer__img" :key="url"
          :src="currentImg" :style="imgStyle" @load="handleImgLoad" @error="handleImgError"
          @mousedown="handleMouseDown">
      </div>
    </div>
  </transition>
</template>

<script>
  import { on, off, rafThrottle, isFirefox } from './util';

  const Mode = {
    CONTAIN: {
      name: 'contain',
      icon: 'y-icon-full-screen'
    },
    ORIGINAL: {
      name: 'original',
      icon: 'y-icon-c-scale-to-original'
    }
  };

  const mousewheelEventName = isFirefox() ? 'DOMMouseScroll' : 'mousewheel';

  export default {
    name: 'YImageViewer',

    props: {
      urlList: {
        type: Array,
        default: () => []
      },
      zIndex: {
        type: Number,
        default: 2000
      },
      onSwitch: {
        type: Function,
        default: () => { }
      },
      onClose: {
        type: Function,
        default: () => { }
      }
    },

    data() {
      return {
        index: 0,
        isShow: false,
        infinite: true,
        loading: false,
        mode: Mode.CONTAIN,
        transform: {
          scale: 1,
          deg: 0,
          offsetX: 0,
          offsetY: 0,
          enableTransition: false
        }
      };
    },
    computed: {
      isSingle() {
        return this.urlList.length <= 1;
      },
      isFirst() {
        return this.index === 0;
      },
      isLast() {
        return this.index === this.urlList.length - 1;
      },
      currentImg() {
        return this.urlList[this.index];
      },
      imgStyle() {
        const { scale, deg, offsetX, offsetY, enableTransition } = this.transform;
        const style = {
          transform: `scale(${scale}) rotate(${deg}deg)`,
          transition: enableTransition ? 'transform .3s' : '',
          'margin-left': `${offsetX}px`,
          'margin-top': `${offsetY}px`
        };
        if (this.mode === Mode.CONTAIN) {
          style.maxWidth = style.maxHeight = '100%';
        }
        return style;
      }
    },
    watch: {
      index: {
        handler: function (val) {
          this.reset();
          this.onSwitch(val);
        }
      },
      currentImg(val) {
        this.$nextTick(_ => {
          const $img = this.$refs.img[0];
          if (!$img.complete) {
            this.loading = true;
          }
        });
      }
    },
    methods: {
      hide() {
        this.deviceSupportUninstall();
        this.onClose();
      },
      deviceSupportInstall() {
        this._keyDownHandler = rafThrottle(e => {
          const keyCode = e.keyCode;
          switch (keyCode) {
            // ESC
            case 27:
              this.hide();
              break;
            // SPACE
            case 32:
              this.toggleMode();
              break;
            // LEFT_ARROW
            case 37:
              this.prev();
              break;
            // UP_ARROW
            case 38:
              this.handleActions('zoomIn');
              break;
            // RIGHT_ARROW
            case 39:
              this.next();
              break;
            // DOWN_ARROW
            case 40:
              this.handleActions('zoomOut');
              break;
          }
        });
        this._mouseWheelHandler = rafThrottle(e => {
          const delta = e.wheelDelta ? e.wheelDelta : -e.detail;
          if (delta > 0) {
            this.handleActions('zoomIn', {
              zoomRate: 0.015,
              enableTransition: false
            });
          } else {
            this.handleActions('zoomOut', {
              zoomRate: 0.015,
              enableTransition: false
            });
          }
        });
        on(document, 'keydown', this._keyDownHandler);
        on(document, mousewheelEventName, this._mouseWheelHandler);
      },
      deviceSupportUninstall() {
        off(document, 'keydown', this._keyDownHandler);
        off(document, mousewheelEventName, this._mouseWheelHandler);
        this._keyDownHandler = null;
        this._mouseWheelHandler = null;
      },
      handleImgLoad(e) {
        this.loading = false;
      },
      handleImgError(e) {
        this.loading = false;
        e.target.alt = '加载失败';
      },
      handleMouseDown(e) {
        if (this.loading || e.button !== 0) return;

        const { offsetX, offsetY } = this.transform;
        const startX = e.pageX;
        const startY = e.pageY;
        this._dragHandler = rafThrottle(ev => {
          this.transform.offsetX = offsetX + ev.pageX - startX;
          this.transform.offsetY = offsetY + ev.pageY - startY;
        });
        on(document, 'mousemove', this._dragHandler);
        on(document, 'mouseup', ev => {
          off(document, 'mousemove', this._dragHandler);
        });

        e.preventDefault();
      },
      reset() {
        this.transform = {
          scale: 1,
          deg: 0,
          offsetX: 0,
          offsetY: 0,
          enableTransition: false
        };
      },
      toggleMode() {
        if (this.loading) return;

        const modeNames = Object.keys(Mode);
        const modeValues = Object.values(Mode);
        const index = modeValues.indexOf(this.mode);
        const nextIndex = (index + 1) % modeNames.length;
        this.mode = Mode[modeNames[nextIndex]];
        this.reset();
      },
      prev() {
        if (this.isFirst && !this.infinite) return;
        const len = this.urlList.length;
        this.index = (this.index - 1 + len) % len;
      },
      next() {
        if (this.isLast && !this.infinite) return;
        const len = this.urlList.length;
        this.index = (this.index + 1) % len;
      },
      handleActions(action, options = {}) {
        if (this.loading) return;
        const { zoomRate, rotateDeg, enableTransition } = {
          zoomRate: 0.2,
          rotateDeg: 90,
          enableTransition: true,
          ...options
        };
        const { transform } = this;
        switch (action) {
          case 'zoomOut':
            if (transform.scale > 0.2) {
              transform.scale = parseFloat((transform.scale - zoomRate).toFixed(3));
            }
            break;
          case 'zoomIn':
            transform.scale = parseFloat((transform.scale + zoomRate).toFixed(3));
            break;
          case 'clocelise':
            transform.deg += rotateDeg;
            break;
          case 'anticlocelise':
            transform.deg -= rotateDeg;
            break;
        }
        transform.enableTransition = enableTransition;
      }
    },
    mounted() {
      this.deviceSupportInstall();
    }
  };
</script>
<style scoped>
  .y-image__preview {
    cursor: pointer;
  }

  .y-image-viewer__wrapper {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  .y-image-viewer__btn {
    position: absolute;
    z-index: 1;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    border-radius: 50%;
    opacity: .8;
    cursor: pointer;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .y-image-viewer__close {
    top: 40px;
    right: 40px;
    width: 40px;
    height: 40px;
    font-size: 40px;
  }

  .y-image-viewer__canvas {
    width: 100%;
    height: 100%;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
  }

  .y-image-viewer__actions {
    left: 50%;
    bottom: 30px;
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);
    width: 282px;
    height: 44px;
    padding: 0 23px;
    background-color: #606266;
    border-color: #fff;
    border-radius: 22px;
  }

  .y-image-viewer__actions__inner {
    width: 100%;
    height: 100%;
    text-align: justify;
    cursor: default;
    font-size: 23px;
    color: #fff;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -ms-flex-pack: distribute;
    justify-content: space-around;
  }

  .y-image-viewer__prev {
    top: 50%;
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
    width: 44px;
    height: 44px;
    font-size: 24px;
    color: #fff;
    background-color: #606266;
    border-color: #fff;
    left: 40px;
  }

  .y-image-viewer__next {
    top: 50%;
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
    width: 44px;
    height: 44px;
    font-size: 24px;
    color: #fff;
    background-color: #606266;
    border-color: #fff;
    right: 40px;
    text-indent: 2px;
  }

  .y-image-viewer__mask {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: .5;
    background: #000;
  }

  .viewer-fade-enter-active {
    -webkit-animation: viewer-fade-in .3s;
    animation: viewer-fade-in .3s;
  }

  .viewer-fade-leave-active {
    -webkit-animation: viewer-fade-out .3s;
    animation: viewer-fade-out .3s;
  }

  @-webkit-keyframes viewer-fade-in {
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

  @keyframes viewer-fade-in {
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

  @-webkit-keyframes viewer-fade-out {
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

  @keyframes viewer-fade-out {
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
