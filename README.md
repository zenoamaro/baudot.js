Baudot.js
=========
![Build](https://img.shields.io/github/workflow/status/zenoamaro/baudot.js/CI%20(node.js))
[![NPM](https://img.shields.io/npm/v/baudot)](https://www.npmjs.com/package/baudot)

A [Baudot] encoder and decoder for node.js and the browser.

Sports a [programmatic] and a [command line] interface.

Comes with ITA1, ITA2 and US-TTY [alphabets], and you can [bring your own].

[Baudot]: https://en.wikipedia.org/wiki/Baudot_code
[alphabets]: #included-alphabets
[bring your own]: #custom-alphabets
[programmatic]: #programmatic-usage
[command line]: #command-line-usage


Command line usage
------------------

You can either install the package globally, or use `npx`:

~~~sh
npm install baudot --global
~~~

~~~sh
echo -n 'HELLO, WORLD!' | npx baudot encode | hexdump
0000000 14 01 12 12 18 1b 0c 04 1f 13 18 0a 12 09 1b 0d
0000010

echo -n 'HELLO, WORLD!' | npx baudot encode | npx baudot decode
HELLO, WORLD!

echo -n 'HELLO; WORLD$' | npx baudot encode -v us-tty | npx baudot decode -v us-tty
HELLO; WORLD$
~~~


Programmatic usage
------------------

~~~sh
npm install baudot
# or yarn add baudot
~~~

~~~js
import {encoder, decoder, US_TTY} from 'baudot';

// Defaults to ITA2
const encode = encoder();
const decode = decoder();

console.log(encode('H'));
// >>> [20]

console.log(encode('!'));
// >>> [27, 13]
// Note the switch to Figure Set

console.log(encode('HELLO, WORLD!'));
// >>> [31, 20, 1, 18, 18, 24, 27, 12, 4, 31, 19, 24, 10, 18, 9, 27, 13]
// Note the switch to Letter Set at the beginning, and the Figure Set at the end

console.log(decode(encode('HELLO, WORLD!')));
// >>> "HELLO, WORLD!"

console.log(
  decoder(US_TTY)(
    encoder(US_TTY)('HELLO; WORLD$')
  )
);
// >>> "HELLO; WORLD$"
~~~


Troubleshooting
---------------

Decoding `US_TTY` correctly:

~~~
OPERATORS HAD TO MAINTAIN A "STEADY RHYTHM"; THE USUAL SPEED OF OPERATION WAS 30 WORDS PER MINUTE
~~~

Trying to decode `US_TTY` as `ITA2`:

~~~
OPERATORS HAD TO MAINTAIN A +STEADY RHYTHM+= THE USUAL SPEED OF OPERATION WAS 30 WORDS PER MINUTE
~~~

Trying to decode `ITA1` as `ITA2`/`US_TTY`:
~~~
U
MEYUMHTJEKTYUTGEIVYEIVTETHY
EK TMJ YJGTYJ
TSHSE5£

KTUCTU
TPUMKHTPEHT
MTGIVSY
Z
~~~

Trying to decode `ITA2`/`US_TTY` as `ITA1`:

~~~
UYLAWYPZGJUYWAGYRIBO AE
~~~

Missing a figure or letter shift somewhere:
~~~
OPERATORS HAD TO MAINTAIN A "53-$6 4#65#."; 5#3 77-) 033$ 9! 9034-589, 2- 30 WORDS PER MINUTE
~~~

Trying to encode lower-case letters:
~~~
O             30 W P M
~~~


API
---

### Alphabet

~~~ts
type Alphabet = string[][];
~~~

An array of two sets of characters.

### encoder()

~~~ts
(alphabet: Alphabet = ITA2) =>
  (str: string) => number[]
~~~

Returns an encoder function that, when fed a unicode string, produces one or more baudot-encoded words, one for each symbol. Characters that are not part of the selected alphabet are ignored.

The encoder will keep track of the current Letter or Figure Set, and will produce the appropriate `LS` and `FS` shift codes when fed characters from the other set.

### decoder()

~~~ts
(alphabet: Alphabet = ITA2) =>
  (word: number | Iterable<number>) => string
~~~

Returns a decoder function that, when fed one or more baudot-encoded words, one for each symbol, produces a unicode string containing the decoded data. Word that are not valid indexes into the selected alphabet are ignored.

The decoder will keep track of the current Letter or Figure Set, and will use it to decode words. When fed a `LS` or `FS` character, it will shift to the appropriate set.


Included alphabets
-----------------

All built-in alphabets can be directly imported from the main package, and contain both letter (`LS`) and figure (`FS`) sets:

~~~ts
import {encoder, decoder} from 'baudot';
import {ITA1, ITA2, US_TTY} from 'baudot';

const encode = encoder(US_TTY);
const decode = decoder(US_TTY);

decode(encode('£$'));
// >>> "$"
~~~

| Binary | Hex | Dec | ITA1 LS | ITA1 FS | ITA2 LS | ITA2 FS | US_TTY LS | US_TTY FS |
| ------ | --- | --- | ------- | ------- | ------- | ------- | --------- | --------- |
| 00000  | 00  | 0   | `<NUL>` | `<NUL>` | `<NUL>` | `<NUL>` | `<NUL>`   | `<NUL>`   |
| 00001  | 01  | 1   | `A`     | `1`     | `E`     | `3`     | `E`       | `3`       |
| 00010  | 02  | 2   | `E`     | `2`     | `<LF>`  | `<LF>`  | `<LF>`    | `<LF>`    |
| 00011  | 03  | 3   | `<CR>`  | `<CR>`  | `A`     | `-`     | `A`       | `-`       |
| 00100  | 04  | 4   | `Y`     | `3`     | `<SPC>` | `<SPC>` | `<SPC>`   | `<SPC>`   |
| 00101  | 05  | 5   | `U`     | `4`     | `S`     | `'`     | `S`       | `<BEL>`   |
| 00110  | 06  | 6   | `I`     | `<DC1>` | `I`     | `8`     | `I`       | `8`       |
| 00111  | 07  | 7   | `O`     | `5`     | `U`     | `7`     | `U`       | `7`       |
| 01000  | 08  | 8   | `<FS>`  | `<SPC>` | `<CR>`  | `<CR>`  | `<CR>`    | `<CR>`    |
| 01001  | 09  | 9   | `J`     | `6`     | `D`     | `<ENQ>` | `D`       | `$`       |
| 01010  | 0A  | 10  | `G`     | `7`     | `R`     | `4`     | `R`       | `4`       |
| 01011  | 0B  | 11  | `H`     | `+`     | `J`     | `<BEL>` | `J`       | `'`       |
| 01100  | 0C  | 12  | `B`     | `8`     | `N`     | `,`     | `N`       | `,`       |
| 01101  | 0D  | 13  | `C`     | `9`     | `F`     | `!`     | `F`       | `!`       |
| 01110  | 0E  | 14  | `F`     | `<DC2>` | `C`     | `:`     | `C`       | `:`       |
| 01111  | 0F  | 15  | `D`     | `0`     | `K`     | `(`     | `K`       | `(`       |
| 10000  | 10  | 16  | `<SPC>` | `<LS>`  | `T`     | `5`     | `T`       | `5`       |
| 10001  | 11  | 17  | `<LF>`  | `<LF>`  | `Z`     | `+`     | `Z`       | `"`       |
| 10010  | 12  | 18  | `X`     | `,`     | `L`     | `)`     | `L`       | `)`       |
| 10011  | 13  | 19  | `Z`     | `:`     | `W`     | `2`     | `W`       | `2`       |
| 10100  | 14  | 20  | `S`     | `.`     | `H`     | `£`     | `H`       | `#`       |
| 10101  | 15  | 21  | `T`     | `<DC3>` | `Y`     | `6`     | `Y`       | `6`       |
| 10110  | 16  | 22  | `W`     | `?`     | `P`     | `0`     | `P`       | `0`       |
| 10111  | 17  | 23  | `V`     | `'`     | `Q`     | `1`     | `Q`       | `1`       |
| 11000  | 18  | 24  | `<DEL>` | `<DEL>` | `O`     | `9`     | `O`       | `9`       |
| 11001  | 19  | 25  | `K`     | `(`     | `B`     | `?`     | `B`       | `?`       |
| 11010  | 1A  | 26  | `M`     | `)`     | `G`     | `&`     | `G`       | `&`       |
| 11011  | 1B  | 27  | `L`     | `=`     | `<FS>`  | `<FS>`  | `<FS>`    | `<FS>`    |
| 11100  | 1C  | 28  | `R`     | `-`     | `M`     | `.`     | `M`       | `.`       |
| 11101  | 1D  | 29  | `Q`     | `/`     | `X`     | `/`     | `X`       | `/`       |
| 11110  | 1E  | 30  | `N`     | `<DC4>` | `V`     | `=`     | `V`       | `;`       |
| 11111  | 1F  | 31  | `P`     | `%`     | `<LS>`  | `<LS>`  | `<LS>`    | `<LS>`    |


Custom alphabets
---------------

Alphabets are two sets of 32 characters, one set for letters, and one for figures. Characters in each set are ordered by their code, from code zero to 31.

The `LS` and `FS` symbols are special: they won't become part of the final output, but they will cause the decoder to switch from one set to another. Conversely, when trying to encode a character from a different set, the appropriate `LS` or `FS` will also be encoded.

~~~js
import {
  encoder, decoder,
  NUL, ENQ, BEL, LF, CR, FS, LS,
  DC1, DC2, DC3, DC4, DEL,
} from 'baudot';

const ITA2_LOWERCASE = [
  [
    /* LS:   0-7 */  NUL, `e`, LF,  `a`, ` `, `s`, `i`, `u`,
    /* LS:  8-15 */  CR,  `d`, `r`, `j`, `n`, `f`, `c`, `k`,
    /* LS: 16-23 */  `t`, `z`, `l`, `w`, `h`, `y`, `p`, `q`,
    /* LS: 24-32 */  `o`, `b`, `g`, FS,  `m`, `x`, `v`, LS ,
  ], [
    /* FS:   0-7 */  NUL, `3`, LF,  `-`, ` `, `'`, `8`, `7`,
    /* FS:  8-15 */  CR,  ENQ, `4`, BEL, `,`, `!`, `:`, `(`,
    /* FS: 16-23 */  `5`, `+`, `)`, `2`, `£`, `6`, `0`, `1`,
    /* FS: 24-32 */  `9`, `?`, `&`, FS,  `.`, `/`, `=`, LS ,
  ],
];

console.log(
  decoder(ITA2_LOWERCASE)(
    encoder(ITA2_LOWERCASE)('hello, world!')
  )
);
// >>> "hello, world!"
~~~


Missing features
----------------
- [ ] Replace unknown characters with the most similar alternative
- [ ] Optional bit-packing into 8-bit bytes
- [ ] Optional automatic re-encoding of figure shifts after spaces
- [ ] Optional automatic reset to Letter Set after spaces
- [ ] Set shift locking to access the third and fourth code page


License
-------

Copyright (c) 2020, zenoamaro \<zenoamaro@gmail.com\>

Licensed under the [MIT LICENSE](LICENSE.md).
