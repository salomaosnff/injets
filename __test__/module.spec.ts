import 'reflect-metadata'
import { Module, Provider, Inject, ROOT_MODULE, CURRENT_MODULE } from '../src'
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

    try {
      await createModule(TestModule)
      expect(false).toBeTruthy()
    } catch (e) {
      expect(e).toBeInstanceOf(ProviderNotImportedError)
    }
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

it('injects global module providers as classes', async () => {
    @Module({})
    class IntermediateModule {}

    class NotAProviderClass {}

    @Module({
      global: true,
      providers: [
        {
          provide: NotAProviderClass,
          useValue: new NotAProviderClass
        }
      ],
      exports: [
        NotAProviderClass
      ]
    })
    class GlobalModule {}

    @Module({ imports: [GlobalModule, IntermediateModule] })
    class RootModule {}

    const rootModule = await createModule(RootModule)
    const intermediateModule = await rootModule.getModule(IntermediateModule)
    const providerGotten = await intermediateModule.get(NotAProviderClass)

    expect(providerGotten).toBeInstanceOf(NotAProviderClass)
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
    expect(app.get(Foo2Provider)).rejects.toBeInstanceOf(ProviderNotImportedError)
  })

  it('injects current module in constructor using inject decorator', async () => {
    @Provider()
    class TestProvider {
      constructor(
        @Inject(CURRENT_MODULE)
        public testModule: any
      ) {}
    }

    @Module({
      providers: [
        TestProvider
      ]
    })
    class TestModule{}

    const testModule = await createModule(TestModule)
    const testProvider = await testModule.get<TestProvider>(TestProvider) as TestProvider

    expect(testProvider.testModule).toBe(testModule)
  })
})
