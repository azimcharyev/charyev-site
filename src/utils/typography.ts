/* Короткие служебные слова не должны оставаться в конце строки. */
const SHORT_WORDS = new Set([
  'а', 'без', 'бы', 'в', 'во', 'вы', 'да', 'для', 'до', 'же', 'за', 'и', 'из',
  'или', 'их', 'к', 'как', 'ко', 'мы', 'на', 'над', 'не', 'ни', 'но', 'о', 'об',
  'обо', 'он', 'она', 'они', 'от', 'по', 'под', 'при', 'про', 'с', 'со', 'то',
  'у', 'что', 'чтобы', 'это', 'я', 'его', 'её',
]);

const SHORT_WORD_PATTERN = /(?<!\S)([\p{L}Ёё]+)[ \t]+(?=\S)/gu;

export function typographText(text: string) {
  let result = text;
  let previous = '';

  /* Повтор нужен для цепочек вроде «и в кадре»: после первого прохода
     связывается «и», после второго — «в». */
  while (result !== previous) {
    previous = result;
    result = result.replace(SHORT_WORD_PATTERN, (match, word: string) =>
      SHORT_WORDS.has(word.toLocaleLowerCase('ru-RU')) ? `${word}\u00a0` : match,
    );
  }

  return result
    .replace(/(?<=\d) (?=\d{3}\b)/g, '\u00a0')
    .replace(/(\d) (?=(?:млн|млрд|миллион|миллиард|руб\.|года?\b))/giu, '$1\u00a0')
    .replace(/(?<=[\p{L}\p{N}])-(?=[\p{L}\p{N}])/gu, '\u2011')
    .replace(/№ /g, '№\u00a0');
}
