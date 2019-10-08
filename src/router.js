import Vue from 'vue'
import Router from 'vue-router'
import Button from '@/views/button'
import Radio from '@/views/radio'
import Checkbox from '@/views/checkbox'
import Input from '@/views/input'
import Switch from '@/views/switch'
import InputNumber from '@/views/inputNumber'
import Select from '@/views/select'
import Cascader from '@/views/cascader'
Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [{
    path: '/button',
    name: 'button',
    component: Button
  }, {
    path: '/radio',
    name: 'radio',
    component: Radio
  }, {
    path: '/checkbox',
    name: 'checkbox',
    component: Checkbox
  }, {
    path: '/input',
    name: 'input',
    component: Input
  }, {
    path: '/switch',
    name: 'switch',
    component: Switch
  }, {
    path: '/inputNumber',
    name: 'inputNumber',
    component: InputNumber
  }, {
    path: '/select',
    name: 'select',
    component: Select
  },
  {
    path: '/cascader',
    name: 'cascader',
    component: Cascader
  }
  ]
})
