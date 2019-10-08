<template>
  <div class="y-select-dropdown y-popper" :class="[{ 'is-multiple': $parent.multiple }, popperClass]"
    :style="{ minWidth: minWidth }">
    <slot></slot>
  </div>
</template>

<script type="text/babel">
    import Popper from './popper/vue-popper';
  
    export default {
      name: 'YSelectDropdown',
  
      componentName: 'YSelectDropdown',
  
      mixins: [Popper],
  
      props: {
        placement: {
          default: 'bottom-start'
        },
  
        boundariesPadding: {
          default: 0
        },
  
        popperOptions: {
          default() {
            return {
              gpuAcceleration: false
            };
          }
        },
  
        visibleArrow: {
          default: true
        },
  
        appendToBody: {
          type: Boolean,
          default: true
        }
      },
  
      data() {
        return {
          minWidth: ''
        };
      },
  
      computed: {
        popperClass() {
          return this.$parent.popperClass;
        }
      },
  
      watch: {
        '$parent.inputWidth'() {
          this.minWidth = this.$parent.$el.getBoundingClientRect().width + 'px';
        }
      },
  
      mounted() {
        this.referenceElm = this.$parent.$refs.reference.$el;
        this.$parent.popperElm = this.popperElm = this.$el;
        this.$on('updatePopper', () => {
          if (this.$parent.visible) this.updatePopper();
        });
        this.$on('destroyPopper', this.destroyPopper);
      }
    };
</script>
<style>
  .y-select-dropdown {
    position: absolute;
    z-index: 1001;
    border: solid 1px #E4E7ED;
    border-radius: 4px;
    background-color: #FFFFFF;
    -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    margin: 5px 0;
  }

  .y-select-dropdown.is-multiple .y-select-dropdown__item.selected {
    color: #409EFF;
    background-color: #FFFFFF;
  }

  .y-select-dropdown.is-multiple .y-select-dropdown__item.selected.hover {
    background-color: #F5F7FA;
  }

  /* 打钩没有出来，后面再看 */
  .y-select-dropdown.is-multiple .y-select-dropdown__item.selected::after {
    position: absolute;
    content: '';
    right: 20px;
    width: 3px;
    height: 7px;
    border: 1px solid #409EFF;
    border-top: 0;
    border-left: 0;
    top: 50%;
    transform: translateY(-50%) rotate(45deg);
  }

  .y-select-dropdown .y-scrollbar.is-empty .y-select-dropdown__list {
    padding: 0;
  }
</style>
