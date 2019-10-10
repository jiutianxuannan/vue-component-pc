<script>
  export default {
    name: 'YTimeline',

    props: {
      reverse: {
        type: Boolean,
        default: false
      }
    },

    provide() {
      return {
        timeline: this
      };
    },

    render() {
      const reverse = this.reverse;
      const classes = {
        'y-timeline': true,
        'is-reverse': reverse
      };
      let slots = this.$slots.default || [];
      if (reverse) {
        slots = slots.reverse();
      }
      return (<ul class={classes}>
        {slots}
      </ul>);
    }
  };
</script>
<style scoped>
  .y-timeline {
    margin: 0;
    font-size: 14px;
    list-style: none;
  }

  .y-timeline .y-timeline-item:last-child .y-timeline-item__tail {
    display: none;
  }
</style>
