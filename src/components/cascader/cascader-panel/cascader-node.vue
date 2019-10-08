<script>
  import YCheckbox from '@/components/checkbox/checkbox';
  import YRadio from '@/components/radio/radio';
  import { isEqual } from '../util';

  const stopPropagation = e => e.stopPropagation();

  export default {
    inject: ['panel'],

    components: {
      YCheckbox,
      YRadio
    },

    props: {
      node: {
        required: true
      },
      nodeId: String
    },

    computed: {
      config() {
        return this.panel.config;
      },
      isLeaf() {
        return this.node.isLeaf;
      },
      isDisabled() {
        return this.node.isDisabled;
      },
      checkedValue() {
        return this.panel.checkedValue;
      },
      isChecked() {
        return this.node.isSameNode(this.checkedValue);
      },
      inActivePath() {
        return this.isInPath(this.panel.activePath);
      },
      inCheckedPath() {
        if (!this.config.checkStrictly) return false;

        return this.panel.checkedNodePaths
          .some(checkedPath => this.isInPath(checkedPath));
      },
      value() {
        return this.node.getValueByOption();
      }
    },

    methods: {
      handleExpand() {
        const { panel, node, isDisabled, config } = this;
        const { multiple, checkStrictly } = config;

        if (!checkStrictly && isDisabled || node.loading) return;

        if (config.lazy && !node.loaded) {
          panel.lazyLoad(node, () => {
            // do not use cached leaf value here, invoke this.isLeaf to get new value.
            const { isLeaf } = this;

            if (!isLeaf) this.handleExpand();
            if (multiple) {
              // if leaf sync checked state, else clear checked state
              const checked = isLeaf ? node.checked : false;
              this.handleMultiCheckChange(checked);
            }
          });
        } else {
          panel.handleExpand(node);
        }
      },

      handleCheckChange() {
        const { panel, value } = this;
        panel.handleCheckChange(value);
      },

      handleMultiCheckChange(checked) {
        this.node.doCheck(checked);
        this.panel.calculateMultiCheckedValue();
      },

      isInPath(pathNodes) {
        const { node } = this;
        const selectedPathNode = pathNodes[node.level - 1] || {};
        return selectedPathNode.uid === node.uid;
      },

      renderPrefix(h) {
        const { isLeaf, isChecked, config } = this;
        const { checkStrictly, multiple } = config;

        if (multiple) {
          return this.renderCheckbox(h);
        } else if (checkStrictly) {
          return this.renderRadio(h);
        } else if (isLeaf && isChecked) {
          return this.renderCheckIcon(h);
        }

        return null;
      },

      renderPostfix(h) {
        const { node, isLeaf } = this;

        if (node.loading) {
          return this.renderLoadingIcon(h);
        } else if (!isLeaf) {
          return this.renderExpandIcon(h);
        }

        return null;
      },

      renderCheckbox(h) {
        const { node, config, isDisabled } = this;
        const events = {
          on: { change: this.handleMultiCheckChange },
          nativeOn: {}
        };

        if (config.checkStrictly) { // when every node is selectable, click event should not trigger expand event.
          events.nativeOn.click = stopPropagation;
        }

        return (
          <y-checkbox
            value={node.checked}
            indeterminate={node.indeterminate}
            disabled={isDisabled}
            {...events}
          ></y-checkbox>
        );
      },

      renderRadio(h) {
        let { checkedValue, value, isDisabled } = this;

        // to keep same reference if value cause radio's checked state is calculated by reference comparision;
        if (isEqual(value, checkedValue)) {
          value = checkedValue;
        }

        return (
          <y-radio
            value={checkedValue}
            label={value}
            disabled={isDisabled}
            onChange={this.handleCheckChange}
            nativeOnClick={stopPropagation}>
            {/* add an empty element to avoid render label */}
            <span></span>
          </y-radio>
        );
      },

      renderCheckIcon(h) {
        return (
          <i class="y-icon-check y-cascader-node__prefix"></i>
        );
      },

      renderLoadingIcon(h) {
        return (
          <i class="y-icon-loading y-cascader-node__postfix"></i>
        );
      },

      renderExpandIcon(h) {
        return (
          <i class="y-icon-arrow-right y-cascader-node__postfix"></i>
        );
      },

      renderContent(h) {
        const { panel, node } = this;
        const render = panel.renderLabelFn;
        const vnode = render
          ? render({ node, data: node.data })
          : null;

        return (
          <span class="y-cascader-node__label">{vnode || node.label}</span>
        );
      }
    },

    render(h) {
      const {
        inActivePath,
        inCheckedPath,
        isChecked,
        isLeaf,
        isDisabled,
        config,
        nodeId
      } = this;
      const { expandTrigger, checkStrictly, multiple } = config;
      const disabled = !checkStrictly && isDisabled;
      const events = { on: {} };

      if (!isLeaf) {
        if (expandTrigger === 'click') {
          events.on.click = this.handleExpand;
        } else {
          events.on.mouseenter = e => {
            this.handleExpand();
            this.$emit('expand', e);
          };
          events.on.focus = e => {
            this.handleExpand();
            this.$emit('expand', e);
          };
        }
      } else if (!isDisabled && !checkStrictly && !multiple) {
        events.on.click = this.handleCheckChange;
      }

      return (
        <li
          role="menuitem"
          id={nodeId}
          aria-expanded={inActivePath}
          tabindex={disabled ? null : -1}
          class={{
            'y-cascader-node': true,
            'is-selectable': checkStrictly,
            'in-active-path': inActivePath,
            'in-checked-path': inCheckedPath,
            'is-active': isChecked,
            'is-disabled': disabled
          }}
          {...events}>
          {this.renderPrefix(h)}
          {this.renderContent(h)}
          {this.renderPostfix(h)}
        </li>
      );
    }
  };
</script>
<style scoped>
  .y-cascader-node {
    position: relative;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    padding: 0 30px 0 20px;
    height: 34px;
    line-height: 34px;
    outline: none;
  }

  .y-cascader-node.is-selectable.in-active-path {
    color: #606266;
  }

  .y-cascader-node.in-active-path,
  .y-cascader-node.is-selectable.in-checked-path,
  .y-cascader-node.is-active {
    color: #409EFF;
    font-weight: bold;
  }

  .y-cascader-node:not(.is-disabled) {
    cursor: pointer;
  }

  .y-cascader-node:not(.is-disabled):hover,
  .y-cascader-node:not(.is-disabled):focus {
    background: #F5F7FA;
  }

  .y-cascader-node.is-disabled {
    color: #C0C4CC;
    cursor: not-allowed;
  }

  .y-cascader-node__prefix {
    position: absolute;
    left: 10px;
  }

  .y-cascader-node__postfix {
    position: absolute;
    right: 10px;
  }

  .y-cascader-node__label {
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    padding: 0 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .y-cascader-node>.y-checkbox {
    margin-right: 0;
  }

  .y-cascader-node>.y-radio {
    margin-right: 0;
  }

  .y-cascader-node>.y-radio .y-radio__label {
    padding-left: 0;
  }
</style>
