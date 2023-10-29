import { Inject, Module, Provider, Token, mount } from '../src';

@Provider()
class Provider2 {
  x = Math.random();
}

@Provider()
class Provider1 {
  @Inject()
  public provider2!: Provider2;

  constructor(@Inject() public a: Provider2) {}
}


@Module({
  global: true,
  providers: [Provider2],
  exports: [Provider2], 
})
class Container2 {}

@Module({ providers: [Provider1] })
class Container1 {}

const c1 = mount(Container1);

console.log(c1.resolve(Provider1));