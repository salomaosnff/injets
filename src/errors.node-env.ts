import { tokenName } from './index';
import type { Token } from './types';

export function throwCyclicError(
  stack: Array<{ containerName: string; token: Token; isLazy?: boolean }>,
  cyclicIndex: number,
  tokenToSuggest: Token,
): never {
  const graphLabels = stack.map(({
    containerName, token, isLazy,
  }) => isLazy ? `Lazy(${tokenName(token)}) (in ${containerName})` : `${tokenName(token)} (in ${containerName})`);
  const formatedLabels = graphLabels.map((l, idx) => idx === cyclicIndex ? `\x1b[31;1m${l}\x1b[0m` : `\x1b[1m${l}\x1b[0m`);
  let bottom = '';
  for (let i = 0; i < graphLabels.length; i++) {
    const l = graphLabels[i];
    if (i < cyclicIndex) {
      bottom += ' '.repeat(l.length);
    } else if (i === cyclicIndex) {
      bottom += `^${'─'.repeat(l.length - 1)}`;
    } else {
      bottom += '─'.repeat(l.length);
    }

    if (i < graphLabels.length - 1) {
      if (i < cyclicIndex) {
        bottom += '    ';
      } else {
        bottom += '────';
      }
    }
  }
  throw new Error(`Cyclic dependency detected!\n\n    ${formatedLabels.join(' \x1b[2m~>\x1b[0m ')}\x1b[31;1m ╮\n    ${bottom}─╯\x1b[0m\nTry to use "lazy(() => ${tokenName(tokenToSuggest)})" to delay the resolution of the token.`);
}
