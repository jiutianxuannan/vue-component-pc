<template>
  <div ref="reference" :class="[
        'y-cascader',
        realSize && `y-cascader--${realSize}`,
        { 'is-disabled': isDisabled }
      ]" v-clickoutside="() => toggleDropDownVisible(false)" @mouseenter="inputHover = true"
    @mouseleave="inputHover = false" @click="() => toggleDropDownVisible(readonly ? undefined : true)"
    @keydown="handleKeyDown">

    <y-input ref="input" v-model="multiple ? presentText : inputValue" :size="realSize" :placeholder="placeholder"
      :readonly="readonly" :disabled="isDisabled" :validate-event="false" :class="{ 'is-focus': dropDownVisible }"
      @focus="handleFocus" @blur="handleBlur" @input="handleInput">
      <template slot="suffix">
        <i v-if="clearBtnVisible" key="clear" class="y-input__icon y-icon-circle-close" @click.stop="handleClear"></i>
        <i v-else key="arrow-down" :class="[
              'y-input__icon',
              'y-icon-arrow-down',
              dropDownVisible && 'is-reverse'
            ]" @click.stop="toggleDropDownVisible()"></i>
      </template>
    </y-input>

    <div v-if="multiple" class="y-cascader__tags">
      <y-tag v-for="(tag, index) in presentTags" :key="tag.key" type="info" :size="tagSize" :hit="tag.hitState"
        :closable="tag.closable" disable-transitions @close="deleteTag(index)">
        <span>{{ tag.text }}</span>
      </y-tag>
      <input v-if="filterable && !isDisabled" v-model.trim="inputValue" type="text" class="y-cascader__search-input"
        :placeholder="presentTags.length ? '' : placeholder" @input="e => handleInput(inputValue, e)"
        @click.stop="toggleDropDownVisible(true)" @keydown.delete="handleDelete">
    </div>

    <transition name="y-zoom-in-top" @after-leave="handleDropdownLeave">
      <div v-show="dropDownVisible" ref="popper" :class="['y-cascader__dropdown', 'y-popper', popperClass]">
        <y-cascader-panel ref="panel" v-show="!filtering" v-model="checkedValue" :options="options" :props="config"
          :border="false" :render-label="$scopedSlots.default" @expand-change="handleExpandChange"
          @close="toggleDropDownVisible(false)"></y-cascader-panel>
        <y-scrollbar ref="suggestionPanel" v-if="filterable" v-show="filtering" tag="ul"
          class="y-cascader__suggestion-panel" view-class="y-cascader__suggestion-list"
          @keydown.native="handleSuggestionKeyDown">
          <template v-if="suggestions.length">
            <li v-for="(item, index) in suggestions" :key="item.uid" :class="[
                  'y-cascader__suggestion-item',
                  item.checked && 'is-checked'
                ]" :tabindex="-1" @click="handleSuggestionClick(index)">
              <span>{{ item.text }}</span>
              <i v-if="item.checked" class="y-icon-check"></i>
            </li>
          </template>
          <slot v-else name="empty">
            <li class="y-cascader__empty-text">不匹配</li>
          </slot>
        </y-scrollbar>
      </div>
    </transition>
  </div>
</template>

<script>
  import Popper from './popper/vue-popper';
  import Clickoutside from './clickoutside';
  import Emitter from './emitter';
  import YInput from '@/components/input/input';
  import YTag from './tag';
  import YScrollbar from './scrollbar/src/main';
  import YCascaderPanel from './cascader-panel/cascader-panel';
  import { isEqual, isEmpty, kebabCase, isUndefined, isFunction, isDef } from './util';
  import { addResizeListener, removeResizeListener } from './scrollbar/src/resize-event';
  import { debounce } from 'throttle-debounce';

  const KeyCode = {
    tab: 9,
    enter: 13,
    space: 32,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    esc: 27
  }
  const MigratingProps = {
    expandTrigger: {
      newProp: 'expandTrigger',
      type: String
    },
    changeOnSelect: {
      newProp: 'checkStrictly',
      type: Boolean
    },
    hoverThreshold: {
      newProp: 'hoverThreshold',
      type: Number
    }
  };

  const PopperMixin = {
    props: {
      placement: {
        type: String,
        default: 'bottom-start'
      },
      appendToBody: Popper.props.appendToBody,
      visibleArrow: {
        type: Boolean,
        default: true
      },
      arrowOffset: Popper.props.arrowOffset,
      offset: Popper.props.offset,
      boundariesPadding: Popper.props.boundariesPadding,
      popperOptions: Popper.props.popperOptions
    },
    methods: Popper.methods,
    data: Popper.data,
    beforeDestroy: Popper.beforeDestroy
  };

  const InputSizeMap = {
    medium: 36,
    small: 32,
    mini: 28
  };

  export default {
    name: 'YCascader',

    directives: { Clickoutside },

    mixins: [PopperMixin, Emitter],

    inject: {
      elForm: {
        default: ''
      },
      elFormItem: {
        default: ''
      }
    },

    components: {
      YInput,
      YTag,
      YScrollbar,
      YCascaderPanel
    },

    props: {
      value: {},
      options: Array,
      props: Object,
      size: String,
      placeholder: {
        type: String,
        default: '请选择'
      },
      disabled: Boolean,
      clearable: Boolean,
      filterable: Boolean,
      filterMethod: Function,
      separator: {
        type: String,
        default: ' / '
      },
      showAllLevels: {
        type: Boolean,
        default: true
      },
      collapseTags: Boolean,
      debounce: {
        type: Number,
        default: 300
      },
      beforeFilter: {
        type: Function,
        default: () => (() => { })
      },
      popperClass: String
    },

    data() {
      return {
        dropDownVisible: false,
        checkedValue: this.value || null,
        inputHover: false,
        inputValue: null,
        presentText: null,
        presentTags: [],
        checkedNodes: [],
        filtering: false,
        suggestions: [],
        inputInitialHeight: 0,
        pressDeleteCount: 0
      };
    },

    computed: {
      realSize() {
        const _elFormItemSize = (this.elFormItem || {}).elFormItemSize;
        return this.size || _elFormItemSize || (this.$ELEMENT || {}).size;
      },
      tagSize() {
        return ['small', 'mini'].indexOf(this.realSize) > -1
          ? 'mini'
          : 'small';
      },
      isDisabled() {
        return this.disabled || (this.elForm || {}).disabled;
      },
      config() {
        const config = this.props || {};
        const { $attrs } = this;

        Object
          .keys(MigratingProps)
          .forEach(oldProp => {
            const { newProp, type } = MigratingProps[oldProp];
            let oldValue = $attrs[oldProp] || $attrs[kebabCase(oldProp)];
            if (isDef(oldProp) && !isDef(config[newProp])) {
              if (type === Boolean && oldValue === '') {
                oldValue = true;
              }
              config[newProp] = oldValue;
            }
          });

        return config;
      },
      multiple() {
        return this.config.multiple;
      },
      leafOnly() {
        return !this.config.checkStrictly;
      },
      readonly() {
        return !this.filterable || this.multiple;
      },
      clearBtnVisible() {
        if (!this.clearable || this.isDisabled || this.filtering || !this.inputHover) {
          return false;
        }

        return this.multiple
          ? !!this.checkedNodes.filter(node => !node.isDisabled).length
          : !!this.presentText;
      },
      panel() {
        return this.$refs.panel;
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

    watch: {
      value(val) {
        if (!isEqual(val, this.checkedValue)) {
          this.checkedValue = val;
          this.computePresentContent();
        }
      },
      checkedValue(val) {
        const { value } = this;
        if (!isEqual(val, value) || isUndefined(value)) {
          this.$emit('input', val);
          this.$emit('change', val);
          this.dispatch('YFormItem', 'el.form.change', [val]);
          this.computePresentContent();
        }
      },
      options: {
        handler: function () {
          this.$nextTick(this.computePresentContent);
        },
        deep: true
      },
      presentText(val) {
        this.inputValue = val;
      },
      presentTags(val, oldVal) {
        if (this.multiple && (val.length || oldVal.length)) {
          this.$nextTick(this.updateStyle);
        }
      },
      filtering(val) {
        this.$nextTick(this.updatePopper);
      }
    },

    mounted() {
      const { input } = this.$refs;
      if (input && input.$el) {
        this.inputInitialHeight = input.$el.offsetHeight || InputSizeMap[this.realSize] || 40;
      }

      if (!isEmpty(this.value)) {
        this.computePresentContent();
      }

      this.filterHandler = debounce(this.debounce, () => {
        const { inputValue } = this;

        if (!inputValue) {
          this.filtering = false;
          return;
        }

        const before = this.beforeFilter(inputValue);
        if (before && before.then) {
          before.then(this.getSuggestions);
        } else if (before !== false) {
          this.getSuggestions();
        } else {
          this.filtering = false;
        }
      });

      addResizeListener(this.$el, this.updateStyle);
    },

    beforeDestroy() {
      removeResizeListener(this.$el, this.updateStyle);
    },

    methods: {
      toggleDropDownVisible(visible) {
        if (this.isDisabled) return;

        const { dropDownVisible } = this;
        const { input } = this.$refs;
        visible = isDef(visible) ? visible : !dropDownVisible;
        if (visible !== dropDownVisible) {
          this.dropDownVisible = visible;
          if (visible) {
            this.$nextTick(() => {
              this.updatePopper();
              this.panel.scrollIntoView();
            });
          }
          input.$refs.input.setAttribute('aria-expanded', visible);
          this.$emit('visible-change', visible);
        }
      },
      handleDropdownLeave() {
        this.filtering = false;
        this.inputValue = this.presentText;
      },
      handleKeyDown(event) {
        switch (event.keyCode) {
          case KeyCode.enter:
            this.toggleDropDownVisible();
            break;
          case KeyCode.down:
            this.toggleDropDownVisible(true);
            this.focusFirstNode();
            event.preventDefault();
            break;
          case KeyCode.esc:
          case KeyCode.tab:
            this.toggleDropDownVisible(false);
            break;
        }
      },
      handleFocus(e) {
        this.$emit('focus', e);
      },
      handleBlur(e) {
        this.$emit('blur', e);
      },
      handleInput(val, event) {
        !this.dropDownVisible && this.toggleDropDownVisible(true);

        if (event && event.isComposing) return;
        if (val) {
          this.filterHandler();
        } else {
          this.filtering = false;
        }
      },
      handleClear() {
        this.presentText = '';
        this.panel.clearCheckedNodes();
      },
      handleExpandChange(value) {
        this.$nextTick(this.updatePopper.bind(this));
        this.$emit('expand-change', value);
        this.$emit('active-item-change', value); // Deprecated
      },
      focusFirstNode() {
        this.$nextTick(() => {
          const { filtering } = this;
          const { popper, suggestionPanel } = this.$refs;
          let firstNode = null;

          if (filtering && suggestionPanel) {
            firstNode = suggestionPanel.$el.querySelector('.y-cascader__suggestion-item');
          } else {
            const firstMenu = popper.querySelector('.y-cascader-menu');
            firstNode = firstMenu.querySelector('.y-cascader-node[tabindex="-1"]');
          }

          if (firstNode) {
            firstNode.focus();
            !filtering && firstNode.click();
          }
        });
      },
      computePresentContent() {
        this.$nextTick(() => {
          const { multiple, checkStrictly } = this.config;
          if (multiple) {
            this.computePresentTags();
            this.presentText = this.presentTags.length ? ' ' : null;
          } else {
            this.computePresentText();
            if (!checkStrictly && this.dropDownVisible) {
              this.toggleDropDownVisible(false);
            }
          }
        });
      },
      computePresentText() {
        const { checkedValue, config } = this;
        if (!isEmpty(checkedValue)) {
          const node = this.panel.getNodeByValue(checkedValue);
          if (node && (config.checkStrictly || node.isLeaf)) {
            this.presentText = node.getText(this.showAllLevels, this.separator);
            return;
          }
        }
        this.presentText = null;
      },
      computePresentTags() {
        const { isDisabled, leafOnly, showAllLevels, separator, collapseTags } = this;
        const checkedNodes = this.getCheckedNodes(leafOnly);
        const tags = [];

        const genTag = node => ({
          node,
          key: node.uid,
          text: node.getText(showAllLevels, separator),
          hitState: false,
          closable: !isDisabled && !node.isDisabled
        });

        if (checkedNodes.length) {
          const [first, ...rest] = checkedNodes;
          const restCount = rest.length;
          tags.push(genTag(first));

          if (restCount) {
            if (collapseTags) {
              tags.push({
                key: -1,
                text: `+ ${restCount}`,
                closable: false
              });
            } else {
              rest.forEach(node => tags.push(genTag(node)));
            }
          }
        }

        this.checkedNodes = checkedNodes;
        this.presentTags = tags;
      },
      getSuggestions() {
        let { filterMethod } = this;

        if (!isFunction(filterMethod)) {
          filterMethod = (node, keyword) => node.text.includes(keyword);
        }

        const suggestions = this.panel.getFlattedNodes(this.leafOnly)
          .filter(node => {
            if (node.isDisabled) return false;
            node.text = node.getText(this.showAllLevels, this.separator) || '';
            return filterMethod(node, this.inputValue);
          });

        if (this.multiple) {
          this.presentTags.forEach(tag => {
            tag.hitState = false;
          });
        } else {
          suggestions.forEach(node => {
            node.checked = isEqual(this.checkedValue, node.getValueByOption());
          });
        }

        this.filtering = true;
        this.suggestions = suggestions;
        this.$nextTick(this.updatePopper);
      },
      handleSuggestionKeyDown(event) {
        const { keyCode, target } = event;
        switch (keyCode) {
          case KeyCode.enter:
            target.click();
            break;
          case KeyCode.up:
            const prev = target.previousElementSibling;
            prev && prev.focus();
            break;
          case KeyCode.down:
            const next = target.nextElementSibling;
            next && next.focus();
            break;
          case KeyCode.esc:
          case KeyCode.tab:
            this.toggleDropDownVisible(false);
            break;
        }
      },
      handleDelete() {
        const { inputValue, pressDeleteCount, presentTags } = this;
        const lastIndex = presentTags.length - 1;
        const lastTag = presentTags[lastIndex];
        this.pressDeleteCount = inputValue ? 0 : pressDeleteCount + 1;

        if (!lastTag) return;

        if (this.pressDeleteCount) {
          if (lastTag.hitState) {
            this.deleteTag(lastIndex);
          } else {
            lastTag.hitState = true;
          }
        }
      },
      handleSuggestionClick(index) {
        const { multiple } = this;
        const targetNode = this.suggestions[index];

        if (multiple) {
          const { checked } = targetNode;
          targetNode.doCheck(!checked);
          this.panel.calculateMultiCheckedValue();
        } else {
          this.checkedValue = targetNode.getValueByOption();
          this.toggleDropDownVisible(false);
        }
      },
      deleteTag(index) {
        const { checkedValue } = this;
        const val = checkedValue[index];
        this.checkedValue = checkedValue.filter((n, i) => i !== index);
        this.$emit('remove-tag', val);
      },
      updateStyle() {
        const { $el, inputInitialHeight } = this;
        if (this.$isServer || !$el) return;

        const { suggestionPanel } = this.$refs;
        const inputInner = $el.querySelector('.y-input__inner');

        if (!inputInner) return;

        const tags = $el.querySelector('.y-cascader__tags');
        let suggestionPanelEl = null;

        if (suggestionPanel && (suggestionPanelEl = suggestionPanel.$el)) {
          const suggestionList = suggestionPanelEl.querySelector('.y-cascader__suggestion-list');
          suggestionList.style.minWidth = inputInner.offsetWidth + 'px';
        }

        if (tags) {
          const { offsetHeight } = tags;
          const height = Math.max(offsetHeight + 6, inputInitialHeight) + 'px';
          inputInner.style.height = height;
          this.updatePopper();
        }
      },
      getCheckedNodes(leafOnly) {
        return this.panel.getCheckedNodes(leafOnly);
      }
    }
  };
</script>
<style scoped>
  .y-cascader {
    display: inline-block;
    position: relative;
    font-size: 14px;
    line-height: 35px;
  }

  .y-cascader:not(.is-disabled):hover .y-input__inner {
    cursor: pointer;
    border-color: #C0C4CC;
  }

  .y-cascader .y-input {
    cursor: pointer;
  }

  .y-cascader .y-input .y-input__inner {
    text-overflow: ellipsis;
  }

  .y-cascader .y-input .y-input__inner:focus {
    border-color: #409EFF;
  }

  .y-cascader .y-input .y-icon-arrow-down {
    -webkit-transition: -webkit-transform .3s;
    transition: -webkit-transform .3s;
    transition: transform .3s;
    font-size: 14px;
  }

  .y-cascader .y-input .y-icon-arrow-down.is-reverse {
    -webkit-transform: rotateZ(180deg);
    transform: rotateZ(180deg);
  }

  .y-cascader .y-input .y-icon-circle-close:hover {
    color: #909399;
  }

  .y-cascader .y-input.is-focus .y-input__inner {
    border-color: #409EFF;
  }

  .y-cascader--medium {
    font-size: 14px;
    line-height: 36px;
  }

  .y-cascader--small {
    font-size: 13px;
    line-height: 32px;
  }

  .y-cascader--mini {
    font-size: 12px;
    line-height: 28px;
  }

  .y-cascader.is-disabled .y-cascader__label {
    z-index: 2;
    color: #C0C4CC;
  }

  .y-cascader__dropdown {
    margin: 12px 0;
    font-size: 14px;
    background: #FFFFFF;
    border: solid 1px #E4E7ED;
    border-radius: 4px;
    -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .y-cascader__tags {
    position: absolute;
    left: 0;
    right: 30px;
    top: 50%;
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap;
    line-height: normal;
    text-align: left;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }

  .y-cascader__tags .y-tag {
    display: -webkit-inline-box;
    display: -ms-inline-flexbox;
    display: inline-flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    max-width: 100%;
    margin: 2px 0 2px 6px;
    text-overflow: ellipsis;
    background: #f0f2f5;
  }

  .y-cascader__tags .y-tag:not(.is-hit) {
    border-color: transparent;
  }

  .y-cascader__tags .y-tag>span {
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .y-cascader__tags .y-tag .y-icon-close {
    -webkit-box-flex: 0;
    -ms-flex: none;
    flex: none;
    background-color: #C0C4CC;
    color: #FFFFFF;
  }

  .y-cascader__tags .y-tag .y-icon-close:hover {
    background-color: #909399;
  }

  .y-cascader__suggestion-panel {
    border-radius: 4px;
  }

  .y-cascader__suggestion-list {
    max-height: 204px;
    margin: 0;
    padding: 6px 0;
    font-size: 14px;
    color: #606266;
    text-align: center;
  }

  .y-cascader__suggestion-item {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    height: 34px;
    padding: 0 15px;
    text-align: left;
    outline: none;
    cursor: pointer;
  }

  .y-cascader__suggestion-item:hover,
  .y-cascader__suggestion-item:focus {
    background: #F5F7FA;
  }

  .y-cascader__suggestion-item.is-checked {
    color: #409EFF;
    font-weight: bold;
  }

  .y-cascader__suggestion-item>span {
    margin-right: 10px;
  }

  .y-cascader__empty-text {
    margin: 10px 0;
    color: #C0C4CC;
  }

  .y-cascader__search-input {
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    height: 24px;
    min-width: 60px;
    margin: 2px 0 2px 15px;
    padding: 0;
    color: #606266;
    border: none;
    outline: none;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }

  .y-cascader__search-input::-webkit-input-placeholder {
    color: #C0C4CC;
  }

  .y-cascader__search-input:-ms-input-placeholder {
    color: #C0C4CC;
  }

  .y-cascader__search-input::-ms-input-placeholder {
    color: #C0C4CC;
  }

  .y-cascader__search-input::placeholder {
    color: #C0C4CC;
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
  .y-cascader .y-input__inner {
    cursor: pointer;
  }
</style>
