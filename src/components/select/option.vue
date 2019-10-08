<template>
  <li @mouseenter="hoverItem" @click.stop="selectOptionClick" class="y-select-dropdown__item" v-show="visible" :class="{
        'selected': itemSelected,
        'is-disabled': disabled || groupDisabled || limitReached,
        'hover': hover
      }">
    <slot>
      <span>{{ currentLabel }}</span>
    </slot>
  </li>
</template>

<script type="text/babel">
    import Emitter from './emitter';
  
    export default {
      mixins: [Emitter],
  
      name: 'YOption',
  
      componentName: 'YOption',
  
      inject: ['select'],
  
      props: {
        value: {
          required: true
        },
        label: [String, Number],
        created: Boolean,
        disabled: {
          type: Boolean,
          default: false
        }
      },
  
      data() {
        return {
          index: -1,
          groupDisabled: false,
          visible: true,
          hitState: false,
          hover: false
        };
      },
  
      computed: {
        isObject() {
          return Object.prototype.toString.call(this.value).toLowerCase() === '[object object]';
        },
  
        currentLabel() {
          return this.label || (this.isObject ? '' : this.value);
        },
  
        currentValue() {
          return this.value || this.label || '';
        },
  
        itemSelected() {
          if (!this.select.multiple) {
            return this.isEqual(this.value, this.select.value);
          } else {
            return this.contains(this.select.value, this.value);
          }
        },
  
        limitReached() {
          if (this.select.multiple) {
            return !this.itemSelected &&
              (this.select.value || []).length >= this.select.multipleLimit &&
              this.select.multipleLimit > 0;
          } else {
            return false;
          }
        }
      },
  
      watch: {
        currentLabel() {
          if (!this.created && !this.select.remote) this.dispatch('YSelect', 'setSelected');
        },
        value(val, oldVal) {
          const { remote, valueKey } = this.select;
          if (!this.created && !remote) {
            if (valueKey && typeof val === 'object' && typeof oldVal === 'object' && val[valueKey] === oldVal[valueKey]) {
              return;
            }
            this.dispatch('YSelect', 'setSelected');
          }
        }
      },
  
      methods: {
        getValueByPath (object, prop) {
          prop = prop || '';
          const paths = prop.split('.');
          let current = object;
          let result = null;
          for (let i = 0, j = paths.length; i < j; i++) {
            const path = paths[i];
            if (!current) break;

            if (i === j - 1) {
              result = current[path];
              break;
            }
            current = current[path];
          }
          return result;
        },
        escapeRegexpString (value = '') {
          return String(value).replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
        },
        isEqual(a, b) {
          if (!this.isObject) {
            return a === b;
          } else {
            const valueKey = this.select.valueKey;
            return this.getValueByPath(a, valueKey) === this.getValueByPath(b, valueKey);
          }
        },
  
        contains(arr = [], target) {
          if (!this.isObject) {
            return arr && arr.indexOf(target) > -1;
          } else {
            const valueKey = this.select.valueKey;
            return arr && arr.some(item => {
              return this.getValueByPath(item, valueKey) === this.getValueByPath(target, valueKey);
            });
          }
        },
  
        handleGroupDisabled(val) {
          this.groupDisabled = val;
        },
  
        hoverItem() {
          if (!this.disabled && !this.groupDisabled) {
            this.select.hoverIndex = this.select.options.indexOf(this);
          }
        },
  
        selectOptionClick() {
          if (this.disabled !== true && this.groupDisabled !== true) {
            this.dispatch('YSelect', 'handleOptionClick', [this, true]);
          }
        },
  
        queryChange(query) {
          this.visible = new RegExp(this.escapeRegexpString(query), 'i').test(this.currentLabel) || this.created;
          if (!this.visible) {
            this.select.filteredOptionsCount--;
          }
        }
      },
  
      created() {
        this.select.options.push(this);
        this.select.cachedOptions.push(this);
        this.select.optionsCount++;
        this.select.filteredOptionsCount++;
  
        this.$on('queryChange', this.queryChange);
        this.$on('handleGroupDisabled', this.handleGroupDisabled);
      },
  
      beforeDestroy() {
        this.select.onOptionDestroy(this.select.options.indexOf(this));
      }
    };
</script>
<style scoped>
  .y-select-dropdown__item {
    font-size: 14px;
    padding: 0 20px;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #606266;
    height: 34px;
    line-height: 34px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    cursor: pointer;
  }

  .y-select-dropdown__item.is-disabled {
    color: #C0C4CC;
    cursor: not-allowed;
  }

  .y-select-dropdown__item.is-disabled:hover {
    background-color: #FFFFFF;
  }

  .y-select-dropdown__item.hover,
  .y-select-dropdown__item:hover {
    background-color: #F5F7FA;
  }

  .y-select-dropdown__item.selected {
    color: #409EFF;
    font-weight: bold;
  }
</style>
