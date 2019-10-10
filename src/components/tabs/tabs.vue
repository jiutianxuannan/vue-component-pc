<script>
  import TabNav from './tab-nav';

  export default {
    name: 'YTabs',

    components: {
      TabNav
    },

    props: {
      type: String,
      activeName: String,
      closable: Boolean,
      addable: Boolean,
      value: {},
      editable: Boolean,
      tabPosition: {
        type: String,
        default: 'top'
      },
      beforeLeave: Function,
      stretch: Boolean
    },

    provide() {
      return {
        rootTabs: this
      };
    },

    data() {
      return {
        currentName: this.value || this.activeName,
        panes: []
      };
    },

    watch: {
      activeName(value) {
        this.setCurrentName(value);
      },
      value(value) {
        this.setCurrentName(value);
      },
      currentName(value) {
        if (this.$refs.nav) {
          this.$nextTick(() => {
            this.$refs.nav.$nextTick(_ => {
              this.$refs.nav.scrollToActiveTab();
            });
          });
        }
      }
    },

    methods: {
      calcPaneInstances(isForceUpdate = false) {
        if (this.$slots.default) {
          const paneSlots = this.$slots.default.filter(vnode => vnode.tag &&
            vnode.componentOptions && vnode.componentOptions.Ctor.options.name === 'YTabPane');
          // update indeed
          const panes = paneSlots.map(({ componentInstance }) => componentInstance);
          const panesChanged = !(panes.length === this.panes.length && panes.every((pane, index) => pane === this.panes[index]));
          if (isForceUpdate || panesChanged) {
            this.panes = panes;
          }
        } else if (this.panes.length !== 0) {
          this.panes = [];
        }
      },
      handleTabClick(tab, tabName, event) {
        if (tab.disabled) return;
        this.setCurrentName(tabName);
        this.$emit('tab-click', tab, event);
      },
      handleTabRemove(pane, ev) {
        if (pane.disabled) return;
        ev.stopPropagation();
        this.$emit('edit', pane.name, 'remove');
        this.$emit('tab-remove', pane.name);
      },
      handleTabAdd() {
        this.$emit('edit', null, 'add');
        this.$emit('tab-add');
      },
      setCurrentName(value) {
        const changeCurrentName = () => {
          this.currentName = value;
          this.$emit('input', value);
        };
        if (this.currentName !== value && this.beforeLeave) {
          const before = this.beforeLeave(value, this.currentName);
          if (before && before.then) {
            before
              .then(() => {
                changeCurrentName();
                this.$refs.nav && this.$refs.nav.removeFocus();
              }, () => {
              });
          } else if (before !== false) {
            changeCurrentName();
          }
        } else {
          changeCurrentName();
        }
      }
    },

    render(h) {
      let {
        type,
        handleTabClick,
        handleTabRemove,
        handleTabAdd,
        currentName,
        panes,
        editable,
        addable,
        tabPosition,
        stretch
      } = this;

      const newButton = editable || addable
        ? (
          <span
            class="y-tabs__new-tab"
            on-click={handleTabAdd}
            tabindex="0"
            on-keydown={(ev) => { if (ev.keyCode === 13) { handleTabAdd(); } }}
          >
            <i class="y-icon-plus"></i>
          </span>
        )
        : null;

      const navData = {
        props: {
          currentName,
          onTabClick: handleTabClick,
          onTabRemove: handleTabRemove,
          editable,
          type,
          panes,
          stretch
        },
        ref: 'nav'
      };
      const header = (
        <div class={['y-tabs__header', `is-${tabPosition}`]}>
          {newButton}
          <tab-nav {...navData}></tab-nav>
        </div>
      );
      const panels = (
        <div class="y-tabs__content">
          {this.$slots.default}
        </div>
      );

      return (
        <div class={{
          'y-tabs': true,
          [`y-tabs--${tabPosition}`]: true
        }}>
          {tabPosition !== 'bottom' ? [header, panels] : [panels, header]}
        </div>
      );
    },

    created() {
      if (!this.currentName) {
        this.setCurrentName('0');
      }

      this.$on('tab-nav-update', this.calcPaneInstances.bind(null, true));
    },

    mounted() {
      this.calcPaneInstances();
    },

    updated() {
      this.calcPaneInstances();
    }
  };
</script>
<style>
  .y-tabs__header {
    padding: 0;
    position: relative;
    margin: 0 0 15px;
  }

  .y-tabs__content {
    overflow: hidden;
    position: relative;
  }

  .y-tabs__new-tab {
    float: right;
    border: 1px solid #d3dce6;
    height: 18px;
    width: 18px;
    line-height: 18px;
    margin: 12px 0 9px 10px;
    border-radius: 3px;
    text-align: center;
    font-size: 12px;
    color: #d3dce6;
    cursor: pointer;
    -webkit-transition: all .15s;
    transition: all .15s;
  }

  .y-tabs__new-tab .y-icon-plus {
    -webkit-transform: scale(0.8, 0.8);
    transform: scale(0.8, 0.8);
  }

  .y-tabs__new-tab:hover {
    color: #409EFF;
  }

  .y-tabs__nav-wrap {
    overflow: hidden;
    margin-bottom: -1px;
    position: relative;
  }

  .y-tabs__nav-wrap::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 2px;
    background-color: #E4E7ED;
    z-index: 1;
  }

  .y-tabs__nav-wrap.is-scrollable {
    padding: 0 20px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }

  .y-tabs__nav-scroll {
    overflow: hidden;
  }

  .y-tabs__nav-next,
  .y-tabs__nav-prev {
    position: absolute;
    cursor: pointer;
    line-height: 44px;
    font-size: 12px;
    color: #909399;
  }

  .y-tabs__nav-next {
    right: 0;
  }

  .y-tabs__nav-prev {
    left: 0;
  }

  .y-tabs__nav {
    white-space: nowrap;
    position: relative;
    -webkit-transition: -webkit-transform .3s;
    transition: -webkit-transform .3s;
    transition: transform .3s;
    float: left;
    z-index: 2;
  }

  .y-tabs__nav.is-stretch {
    min-width: 100%;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
  }

  .y-tabs__nav.is-stretch>* {
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    text-align: center;
  }

  .y-tabs--bottom .y-tabs__header.is-bottom {
    margin-bottom: 0;
    margin-top: 10px;
  }

  .y-tabs--left,
  .y-tabs--right {
    overflow: hidden;
  }

  .y-tabs--left .y-tabs__nav.is-left,
  .y-tabs--left .y-tabs__nav.is-right,
  .y-tabs--right .y-tabs__nav.is-left,
  .y-tabs--right .y-tabs__nav.is-right {
    float: none;
  }

  .y-tabs--left .y-tabs__header.is-left {
    float: left;
    margin-bottom: 0;
    margin-right: 10px;
  }

  .y-tabs--left .y-tabs__nav-wrap.is-left {
    margin-right: -1px;
  }

  .y-tabs--left .y-tabs__nav-wrap.is-left::after {
    left: auto;
    right: 0;
  }

  .y-tabs--right .y-tabs__header.is-right {
    float: right;
    margin-bottom: 0;
    margin-left: 10px;
  }

  .y-tabs--right .y-tabs__nav-wrap.is-right {
    margin-left: -1px;
  }

  .y-tabs--right .y-tabs__nav-wrap.is-right::after {
    left: 0;
    right: auto;
  }

  .y-tabs--left .y-tabs__item.is-left {
    text-align: right;
  }

  .y-tabs--left .y-tabs__item.is-left,
  .y-tabs--left .y-tabs__item.is-right,
  .y-tabs--right .y-tabs__item.is-left,
  .y-tabs--right .y-tabs__item.is-right {
    display: block;
  }

  .y-tabs--top .y-tabs__item.is-top:nth-child(2),
  .y-tabs--top .y-tabs__item.is-bottom:nth-child(2),
  .y-tabs--bottom .y-tabs__item.is-top:nth-child(2),
  .y-tabs--bottom .y-tabs__item.is-bottom:nth-child(2) {
    padding-left: 0;
  }

  .y-tabs--top .y-tabs__item.is-top:last-child,
  .y-tabs--top .y-tabs__item.is-bottom:last-child,
  .y-tabs--bottom .y-tabs__item.is-top:last-child,
  .y-tabs--bottom .y-tabs__item.is-bottom:last-child {
    padding-right: 0;
  }

  .y-tabs--top .y-tabs--left>.y-tabs__header .y-tabs__item:nth-child(2),
  .y-tabs--top .y-tabs--right>.y-tabs__header .y-tabs__item:nth-child(2),
  .y-tabs--bottom .y-tabs--left>.y-tabs__header .y-tabs__item:nth-child(2),
  .y-tabs--bottom .y-tabs--right>.y-tabs__header .y-tabs__item:nth-child(2) {
    padding-left: 20px;
  }

  .y-tabs--top .y-tabs--left>.y-tabs__header .y-tabs__item:last-child,
  .y-tabs--top .y-tabs--right>.y-tabs__header .y-tabs__item:last-child,
  .y-tabs--bottom .y-tabs--left>.y-tabs__header .y-tabs__item:last-child,
  .y-tabs--bottom .y-tabs--right>.y-tabs__header .y-tabs__item:last-child {
    padding-right: 20px;
  }

  .y-tabs--left .y-tabs__active-bar.is-left,
  .y-tabs--left .y-tabs__active-bar.is-right,
  .y-tabs--right .y-tabs__active-bar.is-left,
  .y-tabs--right .y-tabs__active-bar.is-right {
    top: 0;
    bottom: auto;
    width: 2px;
    height: auto;
  }

  .y-tabs--left .y-tabs__active-bar.is-left {
    right: 0;
    left: auto;
  }

  .y-tabs--right .y-tabs__active-bar.is-right {
    left: 0;
  }

  .y-tabs--left .y-tabs__header.is-left,
  .y-tabs--left .y-tabs__header.is-right,
  .y-tabs--left .y-tabs__nav-wrap.is-left,
  .y-tabs--left .y-tabs__nav-wrap.is-right,
  .y-tabs--left .y-tabs__nav-scroll,
  .y-tabs--right .y-tabs__header.is-left,
  .y-tabs--right .y-tabs__header.is-right,
  .y-tabs--right .y-tabs__nav-wrap.is-left,
  .y-tabs--right .y-tabs__nav-wrap.is-right,
  .y-tabs--right .y-tabs__nav-scroll {
    height: 100%;
  }

  .y-tabs--left .y-tabs__nav-wrap.is-left,
  .y-tabs--left .y-tabs__nav-wrap.is-right,
  .y-tabs--right .y-tabs__nav-wrap.is-left,
  .y-tabs--right .y-tabs__nav-wrap.is-right {
    margin-bottom: 0;
  }

  .y-tabs--left .y-tabs__nav-wrap.is-left>.y-tabs__nav-prev,
  .y-tabs--left .y-tabs__nav-wrap.is-left>.y-tabs__nav-next,
  .y-tabs--left .y-tabs__nav-wrap.is-right>.y-tabs__nav-prev,
  .y-tabs--left .y-tabs__nav-wrap.is-right>.y-tabs__nav-next,
  .y-tabs--right .y-tabs__nav-wrap.is-left>.y-tabs__nav-prev,
  .y-tabs--right .y-tabs__nav-wrap.is-left>.y-tabs__nav-next,
  .y-tabs--right .y-tabs__nav-wrap.is-right>.y-tabs__nav-prev,
  .y-tabs--right .y-tabs__nav-wrap.is-right>.y-tabs__nav-next {
    height: 30px;
    line-height: 30px;
    width: 100%;
    text-align: center;
    cursor: pointer;
  }

  .y-tabs--left .y-tabs__nav-wrap.is-left>.y-tabs__nav-prev i,
  .y-tabs--left .y-tabs__nav-wrap.is-left>.y-tabs__nav-next i,
  .y-tabs--left .y-tabs__nav-wrap.is-right>.y-tabs__nav-prev i,
  .y-tabs--left .y-tabs__nav-wrap.is-right>.y-tabs__nav-next i,
  .y-tabs--right .y-tabs__nav-wrap.is-left>.y-tabs__nav-prev i,
  .y-tabs--right .y-tabs__nav-wrap.is-left>.y-tabs__nav-next i,
  .y-tabs--right .y-tabs__nav-wrap.is-right>.y-tabs__nav-prev i,
  .y-tabs--right .y-tabs__nav-wrap.is-right>.y-tabs__nav-next i {
    -webkit-transform: rotateZ(90deg);
    transform: rotateZ(90deg);
  }

  .y-tabs--left .y-tabs__nav-wrap.is-left>.y-tabs__nav-prev,
  .y-tabs--left .y-tabs__nav-wrap.is-right>.y-tabs__nav-prev,
  .y-tabs--right .y-tabs__nav-wrap.is-left>.y-tabs__nav-prev,
  .y-tabs--right .y-tabs__nav-wrap.is-right>.y-tabs__nav-prev {
    left: auto;
    top: 0;
  }

  .y-tabs--left .y-tabs__nav-wrap.is-left>.y-tabs__nav-next,
  .y-tabs--left .y-tabs__nav-wrap.is-right>.y-tabs__nav-next,
  .y-tabs--right .y-tabs__nav-wrap.is-left>.y-tabs__nav-next,
  .y-tabs--right .y-tabs__nav-wrap.is-right>.y-tabs__nav-next {
    right: auto;
    bottom: 0;
  }

  .y-tabs--left .y-tabs__nav-wrap.is-left.is-scrollable,
  .y-tabs--left .y-tabs__nav-wrap.is-right.is-scrollable,
  .y-tabs--right .y-tabs__nav-wrap.is-left.is-scrollable,
  .y-tabs--right .y-tabs__nav-wrap.is-right.is-scrollable {
    padding: 30px 0;
  }

  .y-tabs--left .y-tabs__nav-wrap.is-left::after,
  .y-tabs--left .y-tabs__nav-wrap.is-right::after,
  .y-tabs--right .y-tabs__nav-wrap.is-left::after,
  .y-tabs--right .y-tabs__nav-wrap.is-right::after {
    height: 100%;
    width: 2px;
    bottom: auto;
    top: 0;
  }
</style>
