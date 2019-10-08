<template>
  <div class="y-select" :class="[selectSize ? 'y-select--' + selectSize : '']" @click.stop="toggleMenu"
    v-clickoutside="handleClose">
    <div class="y-select__tags" v-if="multiple" ref="tags"
      :style="{ 'max-width': inputWidth - 32 + 'px', width: '100%' }">
      <span v-if="collapseTags && selected.length">
        <y-tag :closable="!selectDisabled" :size="collapseTagSize" :hit="selected[0].hitState" type="info"
          @close="deleteTag($event, selected[0])" disable-transitions>
          <span class="y-select__tags-text">{{ selected[0].currentLabel }}</span>
        </y-tag>
        <y-tag v-if="selected.length > 1" :closable="false" :size="collapseTagSize" type="info" disable-transitions>
          <span class="y-select__tags-text">+ {{ selected.length - 1 }}</span>
        </y-tag>
      </span>
      <transition-group @after-leave="resetInputHeight" v-if="!collapseTags">
        <y-tag v-for="item in selected" :key="getValueKey(item)" :closable="!selectDisabled" :size="collapseTagSize"
          :hit="item.hitState" type="info" @close="deleteTag($event, item)" disable-transitions>
          <span class="y-select__tags-text">{{ item.currentLabel }}</span>
        </y-tag>
      </transition-group>

      <input type="text" class="y-select__input" :disabled="selectDisabled" :autocomplete="autoComplete || autocomplete"
        @focus="handleFocus" @blur="softFocus = false" @click.stop @keyup="managePlaceholder" @keydown="resetInputState"
        @keydown.down.prevent="navigateOptions('next')" @keydown.up.prevent="navigateOptions('prev')"
        @keydown.enter.prevent="selectOption" @keydown.esc.stop.prevent="visible = false"
        @keydown.delete="deletePrevTag" @compositionstart="handleComposition" @compositionupdate="handleComposition"
        @compositionend="handleComposition" v-model="query" @input="debouncedQueryChange" v-if="filterable"
        :style="{ 'flex-grow': '1', width: inputLength / (inputWidth - 32) + '%', 'max-width': inputWidth - 42 + 'px','outline': 'none'}"
        ref="input">
    </div>
    <y-input ref="reference" v-model="selectedLabel" type="text" :placeholder="currentPlaceholder" :name="name" :id="id"
      :autocomplete="autoComplete || autocomplete" :size="selectSize" :disabled="selectDisabled" :readonly="readonly"
      :validate-event="false" :class="{ 'is-focus': visible }" @focus="handleFocus" @blur="handleBlur"
      @keyup.native="debouncedOnInputChange" @keydown.native.down.stop.prevent="navigateOptions('next')"
      @keydown.native.up.stop.prevent="navigateOptions('prev')" @keydown.native.enter.prevent="selectOption"
      @keydown.native.esc.stop.prevent="visible = false" @keydown.native.tab="visible = false"
      @paste.native="debouncedOnInputChange" @mouseenter.native="inputHovering = true"
      @mouseleave.native="inputHovering = false">
      <template slot="prefix" v-if="$slots.prefix">
        <slot name="prefix"></slot>
      </template>
      <template slot="suffix">
        <i v-show="!showClose" :class="['y-select__caret', 'y-input__icon', 'y-icon-' + iconClass]"></i>
        <i v-if="showClose" class="y-select__caret y-input__icon y-icon-circle-close" @click="handleClearClick"></i>
      </template>
    </y-input>
    <transition name="y-zoom-in-top" @before-enter="handleMenuEnter" @after-leave="doDestroy">
      <y-select-menu ref="popper" :append-to-body="popperAppendToBody" v-show="visible && emptyText !== false">
        <y-scrollbar tag="ul" wrap-class="y-select-dropdown__wrap" :view-style="scrollBarWrapStyle" ref="scrollbar"
          :class="{ 'is-empty': !allowCreate && query && filteredOptionsCount === 0}"
          v-show="options.length > 0 && !loading">
          <y-option :value="query" created v-if="showNewOption">
          </y-option>
          <slot></slot>
        </y-scrollbar>
        <template v-if="emptyText && (!allowCreate || loading || (allowCreate && options.length === 0 ))">
          <slot name="empty" v-if="$slots.empty"></slot>
          <p class="y-select-dropdown__empty" v-else>
            {{ emptyText }}
          </p>
        </template>
      </y-select-menu>
    </transition>
  </div>
</template>

<script type="text/babel">
    import Emitter from './emitter';
    import Focus from './focus';
    import YInput from '@/components/input/input';
    import YSelectMenu from './select-dropdown.vue';
    import YOption from './option.vue';
    import YTag from './tag';
    import YScrollbar from './scrollbar/src/main';
    import { debounce } from 'throttle-debounce';
    import Clickoutside from './clickoutside';
    import { addResizeListener, removeResizeListener } from './scrollbar/src/resize-event';
    import scrollIntoView from './scroll-into-view';
    import { getValueByPath, valueEquals, isIE, isEdge } from './util';
    import NavigationMixin from './navigation-mixin';
    const isKorean = function(text) {
      const reg = /([(\uAC00-\uD7AF)|(\u3130-\u318F)])+/gi;
      return reg.test(text);
    }
    export default {
      mixins: [Emitter, Focus('reference'), NavigationMixin],
  
      name: 'YSelect',
  
      componentName: 'YSelect',
  
      inject: {
        elForm: {
          default: ''
        },
  
        elFormItem: {
          default: ''
        }
      },
  
      provide() {
        return {
          'select': this
        };
      },
  
      computed: {
        _elFormItemSize() {
          return (this.elFormItem || {}).elFormItemSize;
        },
  
        readonly() {
          return !this.filterable || this.multiple || (!isIE() && !isEdge() && !this.visible);
        },
  
        showClose() {
          let hasValue = this.multiple
            ? Array.isArray(this.value) && this.value.length > 0
            : this.value !== undefined && this.value !== null && this.value !== '';
          let criteria = this.clearable &&
            !this.selectDisabled &&
            this.inputHovering &&
            hasValue;
          return criteria;
        },
  
        iconClass() {
          return this.remote && this.filterable ? '' : (this.visible ? 'arrow-up is-reverse' : 'arrow-up');
        },
  
        debounce() {
          return this.remote ? 300 : 0;
        },
  
        emptyText() {
          if (this.loading) {
            return this.loadingText;
          } else {
            if (this.remote && this.query === '' && this.options.length === 0) return false;
            if (this.filterable && this.query && this.options.length > 0 && this.filteredOptionsCount === 0) {
              return this.noMatchText;
            }
            if (this.options.length === 0) {
              return this.noDataText;
            }
          }
          return null;
        },
  
        showNewOption() {
          let hasExistingOption = this.options.filter(option => !option.created)
            .some(option => option.currentLabel === this.query);
          return this.filterable && this.allowCreate && this.query !== '' && !hasExistingOption;
        },
  
        selectSize() {
          return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
        },
  
        selectDisabled() {
          return this.disabled || (this.elForm || {}).disabled;
        },
  
        collapseTagSize() {
          return ['small', 'mini'].indexOf(this.selectSize) > -1
            ? 'mini'
            : 'small';
        },
        scrollBarWrapStyle() {
          let style = {
            'max-height': '274px',
            'list-style': 'none',
            'padding': '6px 0',
            'margin': 0,
            'box-sizing': 'border-box',
          }
          return style
        }
      },
  
      components: {
        YInput,
        YSelectMenu,
        YOption,
        YTag,
        YScrollbar
      },
  
      directives: { Clickoutside },
  
      props: {
        name: String,
        id: String,
        value: {
          required: true
        },
        autocomplete: {
          type: String,
          default: 'off'
        },
        /** @Deprecated in next major version */
        autoComplete: {
          type: String,
          validator(val) {
            process.env.NODE_ENV !== 'production' &&
              console.warn('[Element Warn][Select]\'auto-complete\' property will be deprecated in next major version. please use \'autocomplete\' instead.');
            return true;
          }
        },
        automaticDropdown: Boolean,
        size: String,
        disabled: Boolean,
        clearable: Boolean,
        filterable: Boolean,
        allowCreate: Boolean,
        loading: Boolean,
        popperClass: String,
        remote: Boolean,
        loadingText: String,
        noMatchText: String,
        noDataText: String,
        remoteMethod: Function,
        filterMethod: Function,
        multiple: Boolean,
        multipleLimit: {
          type: Number,
          default: 0
        },
        placeholder: {
          type: String,
          default: '请选择'
        },
        defaultFirstOption: Boolean,
        reserveKeyword: Boolean,
        valueKey: {
          type: String,
          default: 'value'
        },
        collapseTags: Boolean,
        popperAppendToBody: {
          type: Boolean,
          default: true
        }
      },
  
      data() {
        return {
          options: [],
          cachedOptions: [],
          createdLabel: null,
          createdSelected: false,
          selected: this.multiple ? [] : {},
          inputLength: 20,
          inputWidth: 0,
          initialInputHeight: 0,
          cachedPlaceHolder: '',
          optionsCount: 0,
          filteredOptionsCount: 0,
          visible: false,
          softFocus: false,
          selectedLabel: '',
          hoverIndex: -1,
          query: '',
          previousQuery: null,
          inputHovering: false,
          currentPlaceholder: '',
          menuVisibleOnFocus: false,
          isOnComposition: false,
          isSilentBlur: false
        };
      },
  
      watch: {
        selectDisabled() {
          this.$nextTick(() => {
            this.resetInputHeight();
          });
        },
  
        placeholder(val) {
          this.cachedPlaceHolder = this.currentPlaceholder = val;
        },
  
        value(val, oldVal) {
          if (this.multiple) {
            this.resetInputHeight();
            if ((val && val.length > 0) || (this.$refs.input && this.query !== '')) {
              this.currentPlaceholder = '';
            } else {
              this.currentPlaceholder = this.cachedPlaceHolder;
            }
            if (this.filterable && !this.reserveKeyword) {
              this.query = '';
              this.handleQueryChange(this.query);
            }
          }
          this.setSelected();
          if (this.filterable && !this.multiple) {
            this.inputLength = 20;
          }
          if (!valueEquals(val, oldVal)) {
            this.dispatch('YFormItem', 'el.form.change', val);
          }
        },
  
        visible(val) {
          if (!val) {
            this.broadcast('YSelectDropdown', 'destroyPopper');
            if (this.$refs.input) {
              this.$refs.input.blur();
            }
            this.query = '';
            this.previousQuery = null;
            this.selectedLabel = '';
            this.inputLength = 20;
            this.menuVisibleOnFocus = false;
            this.resetHoverIndex();
            this.$nextTick(() => {
              if (this.$refs.input &&
                this.$refs.input.value === '' &&
                this.selected.length === 0) {
                this.currentPlaceholder = this.cachedPlaceHolder;
              }
            });
            if (!this.multiple) {
              if (this.selected) {
                if (this.filterable && this.allowCreate &&
                  this.createdSelected && this.createdLabel) {
                  this.selectedLabel = this.createdLabel;
                } else {
                  this.selectedLabel = this.selected.currentLabel;
                }
                if (this.filterable) this.query = this.selectedLabel;
              }
  
              if (this.filterable) {
                this.currentPlaceholder = this.cachedPlaceHolder;
              }
            }
          } else {
            this.broadcast('YSelectDropdown', 'updatePopper');
            if (this.filterable) {
              this.query = this.remote ? '' : this.selectedLabel;
              this.handleQueryChange(this.query);
              if (this.multiple) {
                this.$refs.input.focus();
              } else {
                if (!this.remote) {
                  this.broadcast('YOption', 'queryChange', '');
                  this.broadcast('YOptionGroup', 'queryChange');
                }
  
                if (this.selectedLabel) {
                  this.currentPlaceholder = this.selectedLabel;
                  this.selectedLabel = '';
                }
              }
            }
          }
          this.$emit('visible-change', val);
        },
  
        options() {
          if (this.$isServer) return;
          this.$nextTick(() => {
            this.broadcast('YSelectDropdown', 'updatePopper');
          });
          if (this.multiple) {
            this.resetInputHeight();
          }
          let inputs = this.$el.querySelectorAll('input');
          if ([].indexOf.call(inputs, document.activeElement) === -1) {
            this.setSelected();
          }
          if (this.defaultFirstOption && (this.filterable || this.remote) && this.filteredOptionsCount) {
            this.checkDefaultFirstOption();
          }
        }
      },
  
      methods: {
        handleComposition(event) {
          const text = event.target.value;
          if (event.type === 'compositionend') {
            this.isOnComposition = false;
            this.$nextTick(_ => this.handleQueryChange(text));
          } else {
            const lastCharacter = text[text.length - 1] || '';
            this.isOnComposition = !isKorean(lastCharacter);
          }
        },
        handleQueryChange(val) {
          if (this.previousQuery === val || this.isOnComposition) return;
          if (
            this.previousQuery === null &&
            (typeof this.filterMethod === 'function' || typeof this.remoteMethod === 'function')
          ) {
            this.previousQuery = val;
            return;
          }
          this.previousQuery = val;
          this.$nextTick(() => {
            if (this.visible) this.broadcast('YSelectDropdown', 'updatePopper');
          });
          this.hoverIndex = -1;
          if (this.multiple && this.filterable) {
            this.$nextTick(() => {
              const length = this.$refs.input.value.length * 15 + 20;
              this.inputLength = this.collapseTags ? Math.min(50, length) : length;
              this.managePlaceholder();
              this.resetInputHeight();
            });
          }
          if (this.remote && typeof this.remoteMethod === 'function') {
            this.hoverIndex = -1;
            this.remoteMethod(val);
          } else if (typeof this.filterMethod === 'function') {
            this.filterMethod(val);
            this.broadcast('YOptionGroup', 'queryChange');
          } else {
            this.filteredOptionsCount = this.optionsCount;
            this.broadcast('YOption', 'queryChange', val);
            this.broadcast('YOptionGroup', 'queryChange');
          }
          if (this.defaultFirstOption && (this.filterable || this.remote) && this.filteredOptionsCount) {
            this.checkDefaultFirstOption();
          }
        },
  
        scrollToOption(option) {
          const target = Array.isArray(option) && option[0] ? option[0].$el : option.$el;
          if (this.$refs.popper && target) {
            const menu = this.$refs.popper.$el.querySelector('.y-select-dropdown__wrap');
            scrollIntoView(menu, target);
          }
          this.$refs.scrollbar && this.$refs.scrollbar.handleScroll();
        },
  
        handleMenuEnter() {
          this.$nextTick(() => this.scrollToOption(this.selected));
        },
  
        emitChange(val) {
          if (!valueEquals(this.value, val)) {
            this.$emit('change', val);
          }
        },
  
        getOption(value) {
          let option;
          const isObject = Object.prototype.toString.call(value).toLowerCase() === '[object object]';
          const isNull = Object.prototype.toString.call(value).toLowerCase() === '[object null]';
          const isUndefined = Object.prototype.toString.call(value).toLowerCase() === '[object undefined]';
  
          for (let i = this.cachedOptions.length - 1; i >= 0; i--) {
            const cachedOption = this.cachedOptions[i];
            const isEqual = isObject
              ? getValueByPath(cachedOption.value, this.valueKey) === getValueByPath(value, this.valueKey)
              : cachedOption.value === value;
            if (isEqual) {
              option = cachedOption;
              break;
            }
          }
          if (option) return option;
          const label = (!isObject && !isNull && !isUndefined)
            ? value : '';
          let newOption = {
            value: value,
            currentLabel: label
          };
          if (this.multiple) {
            newOption.hitState = false;
          }
          return newOption;
        },
  
        setSelected() {
          if (!this.multiple) {
            let option = this.getOption(this.value);
            if (option.created) {
              this.createdLabel = option.currentLabel;
              this.createdSelected = true;
            } else {
              this.createdSelected = false;
            }
            this.selectedLabel = option.currentLabel;
            this.selected = option;
            if (this.filterable) this.query = this.selectedLabel;
            return;
          }
          let result = [];
          if (Array.isArray(this.value)) {
            this.value.forEach(value => {
              result.push(this.getOption(value));
            });
          }
          this.selected = result;
          this.$nextTick(() => {
            this.resetInputHeight();
          });
        },
  
        handleFocus(event) {
          if (!this.softFocus) {
            if (this.automaticDropdown || this.filterable) {
              this.visible = true;
              this.menuVisibleOnFocus = true;
            }
            this.$emit('focus', event);
          } else {
            this.softFocus = false;
          }
        },
  
        blur() {
          this.visible = false;
          this.$refs.reference.blur();
        },
  
        handleBlur(event) {
          setTimeout(() => {
            if (this.isSilentBlur) {
              this.isSilentBlur = false;
            } else {
              this.$emit('blur', event);
            }
          }, 50);
          this.softFocus = false;
        },
        
        handleClearClick(event) {
          this.deleteSelected(event);
        },
  
        doDestroy() {
          this.$refs.popper && this.$refs.popper.doDestroy();
        },
        // 不显示面板
        handleClose() {
          this.visible = false;
        },
        // tag的隐藏与显示交换
        toggleLastOptionHitState(hit) {
          if (!Array.isArray(this.selected)) return;
          const option = this.selected[this.selected.length - 1];
          if (!option) return;
  
          if (hit === true || hit === false) {
            option.hitState = hit;
            return hit;
          }
  
          option.hitState = !option.hitState;
          return option.hitState;
        },
        // 执行删除标签，先清空搜索的值，然后第一次执行表示选中，第二个执行才真的删除
        deletePrevTag(e) {
          if (e.target.value.length <= 0 && !this.toggleLastOptionHitState()) {
            const value = this.value.slice();
            value.pop();
            this.$emit('input', value);
            this.emitChange(value);
          }
        },
  
        managePlaceholder() {
          if (this.currentPlaceholder !== '') {
            this.currentPlaceholder = this.$refs.input.value ? '' : this.cachedPlaceHolder;
          }
        },
  
        resetInputState(e) {
          if (e.keyCode !== 8) this.toggleLastOptionHitState(false);
          this.inputLength = this.$refs.input.value.length * 15 + 20;
          this.resetInputHeight();
        },
  
        resetInputHeight() {
          if (this.collapseTags && !this.filterable) return;
          this.$nextTick(() => {
            if (!this.$refs.reference) return;
            let inputChildNodes = this.$refs.reference.$el.childNodes;
            let input = [].filter.call(inputChildNodes, item => item.tagName === 'INPUT')[0];
            const tags = this.$refs.tags;
            const sizeInMap = this.initialInputHeight || 40;
            input.style.height = this.selected.length === 0
              ? sizeInMap + 'px'
              : Math.max(
                tags ? (tags.clientHeight + (tags.clientHeight > sizeInMap ? 6 : 0)) : 0,
                sizeInMap
              ) + 'px';
            if (this.visible && this.emptyText !== false) {
              this.broadcast('YSelectDropdown', 'updatePopper');
            }
          });
        },
  
        resetHoverIndex() {
          setTimeout(() => {
            if (!this.multiple) {
              this.hoverIndex = this.options.indexOf(this.selected);
            } else {
              if (this.selected.length > 0) {
                this.hoverIndex = Math.min.apply(null, this.selected.map(item => this.options.indexOf(item)));
              } else {
                this.hoverIndex = -1;
              }
            }
          }, 300);
        },
  
        handleOptionSelect(option, byClick) {
          if (this.multiple) {
            const value = (this.value || []).slice();
            const optionIndex = this.getValueIndex(value, option.value);
            if (optionIndex > -1) {
              value.splice(optionIndex, 1);
            } else if (this.multipleLimit <= 0 || value.length < this.multipleLimit) {
              value.push(option.value);
            }
            this.$emit('input', value);
            this.emitChange(value);
            if (option.created) {
              this.query = '';
              this.handleQueryChange('');
              this.inputLength = 20;
            }
            if (this.filterable) this.$refs.input.focus();
          } else {
            this.$emit('input', option.value);
            this.emitChange(option.value);
            this.visible = false;
          }
          this.isSilentBlur = byClick;
          this.setSoftFocus();
          if (this.visible) return;
          this.$nextTick(() => {
            this.scrollToOption(option);
          });
        },
  
        setSoftFocus() {
          // this.softFocus = true;
          // const input = this.$refs.input || this.$refs.reference;
          // if (input) {
          //   input.focus();
          // }
        },
  
        getValueIndex(arr = [], value) {
          const isObject = Object.prototype.toString.call(value).toLowerCase() === '[object object]';
          if (!isObject) {
            return arr.indexOf(value);
          } else {
            const valueKey = this.valueKey;
            let index = -1;
            arr.some((item, i) => {
              if (getValueByPath(item, valueKey) === getValueByPath(value, valueKey)) {
                index = i;
                return true;
              }
              return false;
            });
            return index;
          }
        },
  
        toggleMenu() {
          if (!this.selectDisabled) {
            if (this.menuVisibleOnFocus) {
              this.menuVisibleOnFocus = false;
            } else {
              this.visible = !this.visible;
            }
            if (this.visible) {
              (this.$refs.input || this.$refs.reference).focus();
            }
          }
        },
  
        selectOption() {
          if (!this.visible) {
            this.toggleMenu();
          } else {
            if (this.options[this.hoverIndex]) {
              this.handleOptionSelect(this.options[this.hoverIndex]);
            }
          }
        },
        // 删除选中的
        deleteSelected(event) {
          event.stopPropagation();
          const value = this.multiple ? [] : '';
          this.$emit('input', value);
          this.emitChange(value);
          this.visible = false;
          this.$emit('clear');
        },
        // 删除标签
        deleteTag(event, tag) {
          let index = this.selected.indexOf(tag);
          if (index > -1 && !this.selectDisabled) {
            const value = this.value.slice();
            value.splice(index, 1);
            this.$emit('input', value);
            this.emitChange(value);
            this.$emit('remove-tag', tag.value);
          }
          event.stopPropagation();
        },
        // 
        onInputChange() {
          if (this.filterable && this.query !== this.selectedLabel) {
            this.query = this.selectedLabel;
            this.handleQueryChange(this.query);
          }
        },
  
        onOptionDestroy(index) {
          if (index > -1) {
            this.optionsCount--;
            this.filteredOptionsCount--;
            this.options.splice(index, 1);
          }
        },
  
        resetInputWidth() {
          this.inputWidth = this.$refs.reference.$el.getBoundingClientRect().width;
        },
  
        handleResize() {
          this.resetInputWidth();
          if (this.multiple) this.resetInputHeight();
        },
  
        checkDefaultFirstOption() {
          this.hoverIndex = -1;
          // highlight the created option
          let hasCreated = false;
          for (let i = this.options.length - 1; i >= 0; i--) {
            if (this.options[i].created) {
              hasCreated = true;
              this.hoverIndex = i;
              break;
            }
          }
          if (hasCreated) return;
          for (let i = 0; i !== this.options.length; ++i) {
            const option = this.options[i];
            if (this.query) {
              // highlight first options that passes the filter
              if (!option.disabled && !option.groupDisabled && option.visible) {
                this.hoverIndex = i;
                break;
              }
            } else {
              // highlight currently selected option
              if (option.itemSelected) {
                this.hoverIndex = i;
                break;
              }
            }
          }
        },
  
        getValueKey(item) {
          if (Object.prototype.toString.call(item.value).toLowerCase() !== '[object object]') {
            return item.value;
          } else {
            return getValueByPath(item.value, this.valueKey);
          }
        }
      },
  
      created() {
        this.cachedPlaceHolder = this.currentPlaceholder = this.placeholder;
        if (this.multiple && !Array.isArray(this.value)) {
          this.$emit('input', []);
        }
        if (!this.multiple && Array.isArray(this.value)) {
          this.$emit('input', '');
        }
  
        this.debouncedOnInputChange = debounce(this.debounce, () => {
          this.onInputChange();
        });
  
        this.debouncedQueryChange = debounce(this.debounce, (e) => {
          this.handleQueryChange(e.target.value);
        });
  
        this.$on('handleOptionClick', this.handleOptionSelect);
        this.$on('setSelected', this.setSelected);
      },
  
      mounted() {
        if (this.multiple && Array.isArray(this.value) && this.value.length > 0) {
          this.currentPlaceholder = '';
        }
        addResizeListener(this.$el, this.handleResize);
  
        const reference = this.$refs.reference;
        if (reference && reference.$el) {
          const sizeMap = {
            medium: 36,
            small: 32,
            mini: 28
          };
          const input = reference.$el.querySelector('input');
          this.initialInputHeight = input.getBoundingClientRect().height || sizeMap[this.selectSize];
        }
        if (this.remote && this.multiple) {
          this.resetInputHeight();
        }
        this.$nextTick(() => {
          if (reference && reference.$el) {
            this.inputWidth = reference.$el.getBoundingClientRect().width;
          }
        });
        this.setSelected();
      },
  
      beforeDestroy() {
        if (this.$el && this.handleResize) removeResizeListener(this.$el, this.handleResize);
      }
    };
</script>

<!-- <style scoped>
  @import './scrollbar.css';
  @import './popper.css';
</style> -->
<style scoped>
  .y-select-dropdown__empty {
    padding: 10px 0;
    margin: 0;
    text-align: center;
    color: #999;
    font-size: 14px;
  }

  .y-select-dropdown__wrap {
    max-height: 274px;
    list-style: none;
    padding: 6px 0;
    margin: 0;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }

  .y-select {
    display: inline-block;
    position: relative;
  }

  .y-select .y-select__tags>span {
    display: contents;
  }

  .y-select>.y-input {
    display: block;
  }

  .y-select .y-select__input {
    border: none;
    outline: none;
    padding: 0;
    margin-left: 15px;
    color: #666;
    font-size: 14px;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    height: 28px;
    background-color: transparent;
  }

  .y-select__tags {
    position: absolute;
    line-height: normal;
    white-space: normal;
    z-index: 1;
    top: 50%;
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap;
  }

  .y-select__close {
    cursor: pointer;
    position: absolute;
    top: 8px;
    z-index: 1000;
    right: 25px;
    color: #C0C4CC;
    line-height: 18px;
    font-size: 14px;
  }

  .y-select__close:hover {
    color: #909399;
  }

  .y-select .y-input .y-select__caret {
    color: #C0C4CC;
    font-size: 14px;
    -webkit-transition: -webkit-transform .3s;
    transition: -webkit-transform .3s;
    transition: transform .3s, -webkit-transform .3s;
    -webkit-transform: rotateZ(180deg);
    transform: rotateZ(180deg);
    cursor: pointer;
  }

  .y-select .y-input .y-select__caret.is-reverse {
    -webkit-transform: rotateZ(0deg);
    transform: rotateZ(0deg);
  }

  .y-zoom-in-top-enter-active,
  .y-zoom-in-top-leave-active {
    opacity: 1;
    transform: scaleY(1);
    transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1), opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
    transform-origin: center top;
  }

  .y-zoom-in-top-enter,
  .y-zoom-in-top-leave-active {
    opacity: 0;
    transform: scaleY(0);
  }
</style>
<style>
  .y-select .y-input__inner {
    cursor: pointer;
  }
</style>
