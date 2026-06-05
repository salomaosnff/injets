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

  const plainMessage = `Cyclic dependency detected!\n\n    ${graphLabels.join(' ~> ')} ╮\n    ${bottom}─╯\nTry to use "lazy(() => ${tokenName(tokenToSuggest)})" to delay the resolution of the token.`;

  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(
      `%cCyclic dependency detected!%c\n\n    ${graphLabels.map((l, idx) => idx === cyclicIndex ? `%c${l}%c` : l).join(' ~> ')} ╮\n    ${bottom}─╯\n%cTry to use "lazy(() => ${tokenName(tokenToSuggest)})" to delay the resolution of the token.`,
      'color: #ea4335; font-weight: bold; font-size: 14px;',
      'color: inherit;',
      ...(() => {
        const styles: string[] = [];
        graphLabels.forEach((_, idx) => {
          if (idx === cyclicIndex) {
            styles.push('color: #ea4335; font-weight: bold;', 'color: inherit;');
          }
        });
        styles.push('color: #34a853; font-weight: bold;');
        return styles;
      })()
    );
  }

  throw new Error(plainMessage);
}
