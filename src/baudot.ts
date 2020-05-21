/** ASCII <NUL> character */
export const NUL = '\x00';

/** ASCII <ENQ> character */
export const ENQ = '\x05';

/** ASCII <BEL> character */
export const BEL = '\x07';

/** ASCII <LF> character */
export const LF  = '\x0A';

/** ASCII <CR> character */
export const CR  = '\x0D';

/** ASCII <SO> character. Causes a shift to the Figure Set. */
export const FS  = '\x0E';

/** ASCII <SI> character. Causes a shift to the Letter Set. */
export const LS  = '\x0F';

/** ASCII <DC1> character. Left to device interpretation. */
export const DC1 = '\x11';

/** ASCII <DC2> character. Left to device interpretation. */
export const DC2 = '\x12';

/** ASCII <DC3> character. Left to device interpretation. */
export const DC3 = '\x13';

/** ASCII <DC4> character. Left to device interpretation. */
export const DC4 = '\x14';

/** ASCII <DEL> character */
export const DEL = `\x7F`;


/**
 * A set of 32 letters and 32 figures
 */
export type Alphabet = string[][];

/**
 * The ITA1 international teletype alphabet
 */
export const ITA1: Alphabet = [
  [NUL, `A`, `E`, CR, `Y`, `U`, `I`, `O`, FS,  `J`, `G`, `H`, `B`, `C`, `F`, `D`, ` `, LF,  `X`, `Z`, `S`, `T`, `W`, `V`, DEL, `K`, `M`, `L`, `R`, `Q`, `N`, `P`],
  [NUL, `1`, `2`, CR, `3`, `4`, DC1, `5`, ` `, `6`, `7`, `+`, `8`, `9`, DC2, `0`, LS,  LF,  `,`, `:`, `.`, DC3, `?`, `'`, DEL, `(`, `)`, `=`, `-`, `/`, DC4, `%`],
];

/**
 * The ITA2 international teletype alphabet
 */
export const ITA2: Alphabet = [
  [NUL, `E`, LF,  `A`, ` `, `S`, `I`, `U`, CR,  `D`, `R`, `J`, `N`, `F`, `C`, `K`, `T`, `Z`, `L`, `W`, `H`, `Y`, `P`, `Q`, `O`, `B`, `G`, FS,  `M`, `X`, `V`, LS ],
  [NUL, `3`, LF,  `-`, ` `, `'`, `8`, `7`, CR,  ENQ, `4`, BEL, `,`, `!`, `:`, `(`, `5`, `+`, `)`, `2`, `£`, `6`, `0`, `1`, `9`, `?`, `&`, FS,  `.`, `/`, `=`, LS ],
];

/**
 * The US standard teletype alphabet
 */
export const US_TTY: Alphabet = [
  [NUL, `E`, LF,  `A`, ` `, `S`, `I`, `U`, CR,  `D`, `R`, `J`, `N`, `F`, `C`, `K`, `T`, `Z`, `L`, `W`, `H`, `Y`, `P`, `Q`, `O`, `B`, `G`, FS,  `M`, `X`, `V`, LS ],
  [NUL, `3`, LF,  `-`, ` `, BEL, `8`, `7`, CR,  `$`, `4`, `'`, `,`, `!`, `:`, `(`, `5`, `"`, `)`, `2`, `#`, `6`, `0`, `1`, `9`, `?`, `&`, FS,  `.`, `/`, `;`, LS ],
];

/**
 * a decoder function that, when fed one or more baudot-encoded words, one for
 * each symbol, produces a unicode string containing the decoded data.
 */
export type Decoder = (word: number | Iterable<number>) => string;

/**
 * Returns a decoder function that, when fed one or more baudot-encoded words,
 * one for each symbol, produces a unicode string containing the decoded data.
 * Word that are not valid indexes into the selected alphabet are ignored.
 *
 * The decoder will keep track of the current Letter or Figure Set, and will use
 * it to decode words. When fed a `LS` or `FS` character, it will shift to the
 * appropriate set.
 */
export function decoder(alphabet: Alphabet = ITA2): Decoder {
  let set = 0;

  return function decode(word): string {
    if (typeof word !== 'number') {
      return Array.from(word).map(decode).join('');
    }

    const char = alphabet[set][word];
    if (char === LS) return set=0, '';
    else if (char === FS) return set=1, '';
    else return char;
  }
}

/**
 * An encoder function that, when fed a unicode string, produces one or more
 * baudot-encoded words, one for each symbol.
 */
export type Encoder = (str: string) => number[];

/**
 * Returns an encoder function that, when fed a unicode string, produces one or
 * more baudot-encoded words, one for each symbol. Characters that are not part
 * of the selected alphabet are ignored.
 *
 * The encoder will keep track of the current Letter or Figure Set, and will
 * produce the appropriate `LS` and `FS` shift codes when fed characters from
 * the other set.
 */
export function encoder(alphabet: Alphabet = ITA2): Encoder {
  let set = 0;

  return function encode(char): number[] {
    if (char.length > 1) {
      return char.split('').flatMap(encode);
    }

    const a = alphabet[set].indexOf(char);
    const b = alphabet[1-set].indexOf(char);
    const s = alphabet[set].indexOf(set? LS : FS);

    if (a !== -1) return [a];
    else if (b !== -1) return set=1-set, [s, b];
    else return [];
  }
}
