import Vue from 'vue'
import Router from 'vue-router'
import components from './component.json'
Vue.use(Router)
export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: components.map(component => {
    return {
      path: `/${component.name}`,
      name: `${component.name}`,
      components: require(`./views/${component.name}`)
    }
  })
})
