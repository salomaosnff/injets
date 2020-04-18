import "reflect-metadata";
import { Module } from "./decorators/module.decorator";
import { Inject } from "./decorators/inject.decorator";
import { Provider } from "./decorators";
import { ModuleRef } from "./module";

@Module({
  global: true,
  providers: [{ provide: 'NUMBER', useValue: 5 }]
})
class GlobalModule {}


@Provider()
class Provider1 {
  constructor (@Inject('NUMBER') n:number) {
    console.log(n)
  }
}

@Module({
  providers: [Provider1]
})
class NoGlobalModule {}

@Module({
  imports: [GlobalModule, NoGlobalModule]
})
export class AppModule {}

ModuleRef.create(AppModule).then(async mod => {
  const p = await mod.getModule(NoGlobalModule).get(Provider1);
  console.log(p)
})