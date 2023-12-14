import {
  createResolver,
  Token,
  depends,
  transient,
  constant,
  singleton,
  inject
} from '../src';

class MyService {
  constructor(private readonly hostname: string) {}

  send() {
    console.log('MyService send', this.hostname);
  }
}

const RANDOM: Token<number> = 'random';
const CONFIG_HOSTNAME: Token<string> = 'hostname';
const CONFIG_PORT: Token<number> = 'port';

const useConfig = createResolver('Config', () => {
  constant(CONFIG_HOSTNAME, 'localhost');
  constant(CONFIG_PORT, 3000);
});


const useApp = createResolver('App', () => {
  depends(useConfig);

  transient(RANDOM, () => Math.random());

  singleton(MyService, () => new MyService(inject(CONFIG_HOSTNAME)));
});

// Resolve token
const val = useApp(RANDOM);

// Resolve multiple tokens
const [
  service,
  randomValue,
] = useApp([
  MyService,
  RANDOM,
]);

console.log(service, randomValue, val);
