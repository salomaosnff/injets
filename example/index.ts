import { defineContainer, defineToken, lazy, singleton } from 'src';

const A = defineToken<string>('A');
const B = defineToken<string>('B');
const C = defineToken<string>('C');

const useA = defineContainer('a', () => {
  singleton(A, () => useA(B));
  singleton(B, () => useA(C));
  singleton(C, () => useA(B));
});

const result = useA(A);
console.log('Resolvido A com sucesso:', result);