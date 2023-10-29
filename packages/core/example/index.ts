import { Container } from '../src';

const container = new Container<'MyToken'>({
  name: 'MyContainer',
  providers: [
    {
      token: 'MyToken',
      useFactory() {
        return Math.random();
      },
    },
  ],
});

console.log(container.resolve('MyToken'));

console.assert(container.resolve('MyToken') === container.resolve('MyToken'));
