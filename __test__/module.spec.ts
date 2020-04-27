import 'reflect-metadata'
import { Module, Provider, Inject, DynamicModule, ROOT_MODULE, CURRENT_MODULE } from '../src'
import { ProviderNotFoundError } from '../src/errors/module.errors'
import { ProviderNotImportedError } from '../src/errors/provider.errors'
import { createModule } from '../src'

describe('testing module', () => {
  it('can access providers inside itself', async () => {
    @Provider()
    class FooProvider {}
    @Module({
      providers: [
        FooProvider
      ]
    })
    class FooModule {
      @Inject() fooProvider!: FooProvider
      onModuleInit () {
        expect(this.fooProvider).toBeInstanceOf(FooProvider)
      }
    }

    await createModule(FooModule)
  })

  it('can access one provider inside another provider', async () => {
    @Provider()
    class BarProvider {}
    @Provider()
    class FooProvider {
      constructor (barProvider: BarProvider) {
        expect(barProvider).toBeInstanceOf(BarProvider)
      }
    }
    @Module(
      {
        providers: [
          FooProvider,
          BarProvider
        ]
      }
    )
    class FooModule {}

    await createModule(FooModule)
  })

  it('cannot access a private provider from another module', async () => {
    @Provider()
    class PrivateProvider {}

    @Module({})
    class PrivateProviderModule {}

    @Module({ imports: [PrivateProviderModule] })
    class TestModule {
      @Inject() privateProvider!: PrivateProvider
    }

    expect(createModule(TestModule)).rejects.toBeInstanceOf(ProviderNotFoundError)
  })

  it('cannot inject a private provider on the constructor of another provider', async () => {
    @Provider()
    class PrivateProvider {}

    @Provider()
    class TestProvider {
      constructor (public privateProvider: PrivateProvider) {}
    }

    @Module({ providers: [TestProvider] })
    class TestModule {
      @Inject() testProvider!: TestProvider
    }

    expect(createModule(TestModule)).rejects.toBeInstanceOf(ProviderNotImportedError)
  })

  it('injects global module providers', async () => {
    @Module({})
    class IntermediateModule {}

    @Module({
      global: true,
      providers: [
        {
          provide: 'globalModuleProvider',
          useValue: 'works'
        }
      ],
      exports: [
        'globalModuleProvider'
      ]
    })
    class GlobalModule {}

    @Module({ imports: [GlobalModule, IntermediateModule] })
    class RootModule {}

    const rootModule = await createModule(RootModule)
    const intermediateModule = await rootModule.getModule(IntermediateModule)
    const globalModuleProvider = await intermediateModule.get('globalModuleProvider')

    expect(globalModuleProvider).toBe('works')
  })

it('rejects non global providers', async () => {
    @Module({})
    class IntermediateModule {}

    @Module({
      global: false,
      providers: [
        {
          provide: 'globalModuleProvider',
          useValue: 'works'
        }
      ],
      exports: [
        'globalModuleProvider'
      ]
    })
    class GlobalModule {}

    @Module({ imports: [GlobalModule, IntermediateModule] })
    class RootModule {}

    const rootModule = await createModule(RootModule)
    const intermediateModule = await rootModule.getModule(IntermediateModule)

    expect(intermediateModule.get('globalModuleProvider')).rejects.toBeInstanceOf(ProviderNotFoundError)
  })

  it('injects global provider class', async () => {
    @Module({})
    class IntermediateModule {}

    class NotAProvider {}

    @Module({
      global: true,
      providers: [
        {
          provide: NotAProvider,
          useValue: new NotAProvider
        }
      ],
      exports: [
        NotAProvider
      ]
    })
    class GlobalModule {}

    @Module({ imports: [GlobalModule, IntermediateModule] })
    class RootModule {}

    const rootModule = await createModule(RootModule)
    const intermediateModule = await rootModule.getModule(IntermediateModule)
    const providerGotten = await intermediateModule.get(NotAProvider)

    expect(providerGotten).toBeInstanceOf(NotAProvider)
  })

it('injects root module as provider', async () => {

    @Module({})
    class TestModule {}

    @Module({
      imports: [TestModule]
    })
    class RootModule{}

    const rootModule = await createModule(RootModule)
    const testModule = await rootModule.getModule(TestModule)
    const rootModuleFromTestModule = await testModule.get(ROOT_MODULE)

    expect(rootModuleFromTestModule).toBe(rootModule)
  })

  it('injects current module', async () => {
    @Module({})
    class TestModule {}

    @Module({
      imports: [TestModule]
    })
    class RootModule{}

    const rootModule = await createModule(RootModule)
    const testModule = await rootModule.getModule(TestModule)
    const rootModuleFromTestModule = await testModule.get(CURRENT_MODULE)

    expect(rootModuleFromTestModule).toBe(testModule)
  })

  it('should throw an exception if the provider is not registered', async () => {
    @Provider()
    class FooProvider {}

    @Provider()
    class Foo2Provider {
      constructor (
        readonly foo: FooProvider
      ) {
        console.log('AAAA', foo)
      }
    }

    @Module({
      providers: [Foo2Provider]
    })
    class BarModule {}

    const app = await createModule(BarModule);
    expect(app.get(Foo2Provider)).rejects.toBeInstanceOf(ProviderNotFoundError)
  })
})
