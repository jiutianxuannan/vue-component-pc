<script>
  export default {
    name: 'YTag',
    props: {
      text: String,
      closable: Boolean,
      type: String,
      hit: Boolean,
      disableTransitions: Boolean,
      color: String,
      size: String,
      effect: {
        type: String,
        default: 'light',
        validator(val) {
          return ['dark', 'light', 'plain'].includes(val);
        }
      }
    },
    methods: {
      handleClose(event) {
        event.stopPropagation();
        this.$emit('close', event);
      },
      handleClick(event) {
        this.$emit('click', event);
      }
    },
    computed: {
      tagSize() {
        return this.size || (this.$ELEMENT || {}).size;
      }
    },
    render(h) {
      const { type, tagSize, hit, effect } = this;
      const classes = [
        'y-tag',
        type ? `y-tag--${type}` : '',
        tagSize ? `y-tag--${tagSize}` : '',
        effect ? `y-tag--${effect}` : '',
        hit && 'is-hit'
      ];
      const tagEl = (
        <span
          class={classes}
          style={{ backgroundColor: this.color }}
          on-click={this.handleClick}>
          {this.$slots.default}
          {
            this.closable && <i class="y-tag__close y-icon-close" on-click={this.handleClose}></i>
          }
        </span>
      );

      return this.disableTransitions ? tagEl : <transition name="y-zoom-in-center">{tagEl}</transition>;
    }
  };
</script>
<style scoped>
  .y-tag {
    background-color: #ecf5ff;
    border-color: #d9ecff;
    color: #409eff;
    display: inline-block;
    height: 26px;
    padding: 0 8px;
    line-height: 24px;
    font-size: 12px;
    border-width: 1px;
    border-style: solid;
    border-radius: 4px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    white-space: nowrap;
    margin: 2px 0 2px 6px;
  }

  .y-tag.is-hit {
    border-color: #409EFF;
  }

  .y-tag .y-tag__close {
    color: #409eff;
  }

  .y-tag .y-tag__close:hover {
    color: #FFFFFF;
    background-color: #409eff;
  }

  .y-tag.y-tag--info {
    background-color: #f4f4f5;
    border-color: #e9e9eb;
    color: #909399;
  }

  .y-tag.y-tag--info.is-hit {
    border-color: #909399;
  }

  .y-tag.y-tag--info .y-tag__close {
    color: #909399;
  }

  .y-tag.y-tag--info .y-tag__close:hover {
    color: #FFFFFF;
    background-color: #909399;
  }

  .y-tag .y-icon-close {
    border-radius: 50%;
    text-align: center;
    position: relative;
    cursor: pointer;
    font-size: 8px;
    height: 12px;
    width: 12px;
    line-height: 12px;
    vertical-align: middle;
    top: 0;
    right: -5px;
  }

  .y-tag .y-icon-close::before {
    display: block;
  }
</style>
