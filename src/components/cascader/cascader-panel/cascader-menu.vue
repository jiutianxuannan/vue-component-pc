<script>
  import YScrollbar from '../scrollbar/src/main';
  import CascaderNode from './cascader-node.vue';
  import { generateId } from '../util';

  export default {
    name: 'YCascaderMenu',


    inject: ['panel'],

    components: {
      YScrollbar,
      CascaderNode
    },

    props: {
      nodes: {
        type: Array,
        required: true
      },
      index: Number
    },

    data() {
      return {
        activeNode: null,
        hoverTimer: null,
        id: generateId()
      };
    },

    computed: {
      isEmpty() {
        return !this.nodes.length;
      },
      menuId() {
        return `cascader-menu-${this.id}-${this.index}`;
      }
    },

    methods: {
      handleExpand(e) {
        this.activeNode = e.target;
      },
      handleMouseMove(e) {
        const { activeNode, hoverTimer } = this;
        const { hoverZone } = this.$refs;

        if (!activeNode || !hoverZone) return;

        if (activeNode.contains(e.target)) {
          clearTimeout(hoverTimer);

          const { left } = this.$el.getBoundingClientRect();
          const startX = e.clientX - left;
          const { offsetWidth, offsetHeight } = this.$el;
          const top = activeNode.offsetTop;
          const bottom = top + activeNode.offsetHeight;

          hoverZone.innerHTML = `
          <path style="pointer-events: auto;" fill="transparent" d="M${startX} ${top} L${offsetWidth} 0 V${top} Z" />
          <path style="pointer-events: auto;" fill="transparent" d="M${startX} ${bottom} L${offsetWidth} ${offsetHeight} V${bottom} Z" />
        `;
        } else if (!hoverTimer) {
          this.hoverTimer = setTimeout(this.clearHoverZone, this.panel.config.hoverThreshold);
        }
      },
      clearHoverZone() {
        const { hoverZone } = this.$refs;
        if (!hoverZone) return;
        hoverZone.innerHTML = '';
      },

      renderEmptyText(h) {
        return (
          <div class="y-cascader-menu__empty-text">没数据</div>
        );
      },
      renderNodeList(h) {
        const { menuId } = this;
        const { isHoverMenu } = this.panel;
        const events = { on: {} };

        if (isHoverMenu) {
          events.on.expand = this.handleExpand;
        }

        const nodes = this.nodes.map((node, index) => {
          const { hasChildren } = node;
          return (
            <cascader-node
              key={node.uid}
              node={node}
              node-id={`${menuId}-${index}`}
              aria-haspopup={hasChildren}
              aria-owns={hasChildren ? menuId : null}
              {...events}></cascader-node>
          );
        });

        return [
          ...nodes,
          isHoverMenu ? <svg ref='hoverZone' class='y-cascader-menu__hover-zone'></svg> : null
        ];
      }
    },

    render(h) {
      const { isEmpty, menuId } = this;
      const events = { nativeOn: {} };

      // optimize hover to expand experience (#8010)
      if (this.panel.isHoverMenu) {
        events.nativeOn.mousemove = this.handleMouseMove;
        // events.nativeOn.mouseleave = this.clearHoverZone;
      }

      return (
        <y-scrollbar
          tag="ul"
          role="menu"
          id={menuId}
          class="y-cascader-menu"
          wrap-class="y-cascader-menu__wrap"
          view-class={{
            'y-cascader-menu__list': true,
            'is-empty': isEmpty
          }}
          {...events}>
          {isEmpty ? this.renderEmptyText(h) : this.renderNodeList(h)}
        </y-scrollbar>
      );
    }
  };
</script>
<style scoped>
  .y-cascader-menu {
    min-width: 180px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    color: #606266;
    border-right: solid 1px #E4E7ED;
  }

  .y-cascader-menu:last-child {
    border-right: none;
  }

  .y-cascader-menu:last-child .y-cascader-node {
    padding-right: 20px;
  }

  .y-cascader-menu__wrap {
    height: 204px;
  }

  .y-cascader-menu__hover-zone {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .y-cascader-menu__empty-text {
    position: absolute;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    text-align: center;
    color: #C0C4CC;
  }
</style>
<style>
  .y-cascader-menu__list {
    position: relative;
    max-height: 274px;
    min-height: 100%;
    margin: 0;
    padding: 6px 0;
    list-style: none;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }
</style>
