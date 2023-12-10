import { Token } from '@injets/core';
import { constant, createResolver, delayed, global, inject, singleton } from '../src';

const useConfigContainer = createResolver('Config', () => {
  global();
  constant('host', 'localhost');
  constant('port', 3000);
});

const userContainer = createResolver('Example', () => {
  singleton('teste', () => inject('host' as Token<string>), true);
});

const [test] = userContainer('teste');

console.log(test);