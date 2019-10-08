import Button from '@/components/button';
import { Radio, RadioGroup } from '@/components/radio';
import { Checkbox, CheckboxGroup } from '@/components/checkbox';
import Input from '@/components/input';
import Switch from '@/components/switch';
import InputNumber from '@/components/input-number';
import { Select, Option } from '@/components/select';
import { Cascader, CascaderPanel } from '@/components/cascader';

const components = {
  Button,
  Radio,
  RadioGroup,
  Checkbox,
  CheckboxGroup,
  Input,
  Switch,
  InputNumber,
  Select,
  Option,
  Cascader,
  CascaderPanel
};

const directives = {

};

const prototypes = {

};

const filters = {};

const install = function (Vue, opts = {}) {
  if (install.installed) return;
  Object.keys(components).forEach(key => {
    let component = components[key];
    Vue.component(key, component);
    Vue.component(`y-${key.toLocaleLowerCase()}`, component);
    if (key.indexOf('y') !== 0) {
      Vue.component(`y${key}`, component);
    }
  });

  Object.keys(filters).forEach(key => {
    Vue.filter(key, filters[key]);
  });

  Object.keys(directives).forEach(key => {
    Vue.directive(key, directives[key]);
  });

  Object.keys(prototypes).forEach(key => {
    Vue.prototype[key] = prototypes[key];
  });
};

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

const VueComponentsPc = Object.assign(prototypes, {});

VueComponentsPc.install = install;

export default VueComponentsPc;
