import {encoder, decoder, US_TTY} from './baudot';

test('encodes single characters and strings', () => {
  const source = 'HELLO, WORLD!';
  const encode = encoder();
  expect(source.split('').flatMap(encode))
    .toEqual(encoder()(source));
});

test('decodes single words and arrays', () => {
  const source = [20, 1, 18, 18, 24, 27, 12, 4, 31, 19, 24, 10, 18, 9, 27, 13];
  const decode = decoder();
  expect(source.flatMap(decode).join(''))
    .toBe(decoder()(source));
});

test('ignores invalid characters', () => {
  const source = 'A{B}C';
  const decoded = decoder()(encoder()(source));
  expect(decoded).toBe('ABC');
});

test('ignores invalid words', () => {
  const source = [3, 50, 25, -10, 14];
  const encoded = encoder()(decoder()(source));
  expect(encoded).toEqual([3, 25, 14]);
});

test('encodes shifts', () => {
  const encode = encoder();
  expect(encode('AA')).toEqual([3, 3]);
  expect(encode('!!')).toEqual([27, 13, 13]);
  expect(encode('AA')).toEqual([31, 3, 3]);
  expect(encode('A!A')).toEqual([3, 27, 13, 31, 3]);
});

test('decodes shifts', () => {
  const decode = decoder();
  expect(decode([3, 3])).toEqual('AA');
  expect(decode([27, 13, 13])).toEqual('!!');
  expect(decode([31, 3, 3])).toEqual('AA');
  expect(decode([3, 27, 13, 31, 3])).toEqual('A!A');
});

test('supports alternative alphabets', () => {
  const source = 'A "STEADY RHYTHM"; 30 WORDS PER MINUTE';
  const decoded = decoder(US_TTY)(encoder(US_TTY)(source));
  expect(decoded).toBe(source);
});
