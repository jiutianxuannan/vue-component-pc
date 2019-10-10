<template>
  <div class="y-collapse-item" :class="{'is-active': isActive, 'is-disabled': disabled }">
    <div role="tab" :aria-expanded="isActive" :aria-controls="`y-collapse-content-${id}`"
      :aria-describedby="`y-collapse-content-${id}`">
      <div class="y-collapse-item__header" @click="handleHeaderClick" role="button" :id="`y-collapse-head-${id}`"
        :tabindex="disabled ? undefined : 0" @keyup.space.enter.stop="handleEnterClick" :class="{
          'focusing': focusing,
          'is-active': isActive
        }" @focus="handleFocus" @blur="focusing = false">
        <slot name="title">{{title}}</slot>
        <i class="y-collapse-item__arrow y-icon-arrow-right" :class="{'is-active': isActive}">
        </i>
      </div>
    </div>
    <y-collapse-transition>
      <div class="y-collapse-item__wrap" v-show="isActive" role="tabpanel" :aria-hidden="!isActive"
        :aria-labelledby="`y-collapse-head-${id}`" :id="`y-collapse-content-${id}`">
        <div class="y-collapse-item__content">
          <slot></slot>
        </div>
      </div>
    </y-collapse-transition>
  </div>
</template>
<script>
  import YCollapseTransition from './collapse-transition';
  import Emitter from './emitter';
  import { generateId } from './util';

  export default {
    name: 'YCollapseItem',

    componentName: 'YCollapseItem',

    mixins: [Emitter],

    components: { YCollapseTransition },

    data() {
      return {
        contentWrapStyle: {
          height: 'auto',
          display: 'block'
        },
        contentHeight: 0,
        focusing: false,
        isClick: false,
        id: generateId()
      };
    },

    inject: ['collapse'],

    props: {
      title: String,
      name: {
        type: [String, Number],
        default() {
          return this._uid;
        }
      },
      disabled: Boolean
    },

    computed: {
      isActive() {
        return this.collapse.activeNames.indexOf(this.name) > -1;
      }
    },

    methods: {
      handleFocus() {
        setTimeout(() => {
          if (!this.isClick) {
            this.focusing = true;
          } else {
            this.isClick = false;
          }
        }, 50);
      },
      handleHeaderClick() {
        if (this.disabled) return;
        this.dispatch('YCollapse', 'item-click', this);
        this.focusing = false;
        this.isClick = true;
      },
      handleEnterClick() {
        this.dispatch('YCollapse', 'item-click', this);
      }
    }
  };
</script>
<style scoped>
  .y-collapse-item.is-disabled .y-collapse-item__header {
    color: #bbb;
    cursor: not-allowed;
  }

  .y-collapse-item__header {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    height: 48px;
    line-height: 48px;
    background-color: #FFFFFF;
    color: #303133;
    cursor: pointer;
    border-bottom: 1px solid #EBEEF5;
    font-size: 13px;
    font-weight: 500;
    -webkit-transition: border-bottom-color .3s;
    transition: border-bottom-color .3s;
    outline: none;
  }

  .y-collapse-item__arrow {
    margin: 0 8px 0 auto;
    -webkit-transition: -webkit-transform .3s;
    transition: -webkit-transform .3s;
    transition: transform .3s;
    transition: transform .3s, -webkit-transform .3s;
    font-weight: 300;
  }

  .y-collapse-item__arrow.is-active {
    -webkit-transform: rotate(90deg);
    transform: rotate(90deg);
  }

  .y-collapse-item__header.focusing:focus:not(:hover) {
    color: #409EFF;
  }

  .y-collapse-item__header.is-active {
    border-bottom-color: transparent;
  }

  .y-collapse-item__wrap {
    will-change: height;
    background-color: #FFFFFF;
    overflow: hidden;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    border-bottom: 1px solid #EBEEF5;
  }

  .y-collapse-item__content {
    padding-bottom: 25px;
    font-size: 13px;
    color: #303133;
    line-height: 1.769230769230769;
  }

  .y-collapse-item:last-child {
    margin-bottom: -1px;
  }

  .collapse-transition {
    -webkit-transition: 0.3s height ease-in-out, 0.3s padding-top ease-in-out, 0.3s padding-bottom ease-in-out;
    transition: 0.3s height ease-in-out, 0.3s padding-top ease-in-out, 0.3s padding-bottom ease-in-out;
  }

  .horizontal-collapse-transition {
    -webkit-transition: 0.3s width ease-in-out, 0.3s padding-left ease-in-out, 0.3s padding-right ease-in-out;
    transition: 0.3s width ease-in-out, 0.3s padding-left ease-in-out, 0.3s padding-right ease-in-out;
  }
</style>
