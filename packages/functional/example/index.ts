import { Token } from '@injets/core';
import { createResolver, delayed } from '../src';

const useConfigContainer = createResolver('Config', ({
  constant, global, 
}) => {
  global();
  constant('host', 'localhost');
  constant('port', 3000);
});

const userContainer = createResolver('Example', ({
  inject, constant, singleton, transient, depends,
}) => {
  singleton('teste', () => inject('host' as Token<string>), true);
});

const [test] = userContainer('teste');

console.log(test);