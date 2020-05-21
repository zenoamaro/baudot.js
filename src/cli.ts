const pkg = require('../package.json');
import program from 'commander';
import {decoder, encoder, ITA1, ITA2, US_TTY} from './baudot';

program
  .name('baudot')
  .version(pkg.version);

program
  .command('decode')
  .description('decodes bytes to unicode')
  .option('-a, --alphabet <ITA1|ITA2|US-TTY>', 'baudot alphabet',
    (s) => s.replace('-', '_').toUpperCase(), 'ITA2')
  .action((options: {
    alphabet: 'ITA1' | 'ITA2' | 'US_TTY',
  }) => {
    const alphabet = {ITA1, ITA2, US_TTY}[options.alphabet];
    if (!alphabet) throw `Invalid alphabet: ${options.alphabet}`;
    const decode = decoder(alphabet);
    process.stdin.on('data', (chunk) => {
      process.stdout.write(
        decode(chunk)
      );
    });
  });

program
  .command('encode')
  .description('encodes unicode to bytes')
  .option('-a, --alphabet <ITA1|ITA2|US-TTY>', 'baudot alphabet',
    (s) => s.replace('-', '_').toUpperCase(), 'ITA2')
  .action((options: {
    alphabet: 'ITA1' | 'ITA2' | 'US_TTY',
  }) => {
    const alphabet = {ITA1, ITA2, US_TTY}[options.alphabet];
    if (!alphabet) throw `Invalid alphabet: ${options.alphabet}`;
    const encode = encoder(alphabet);
    process.stdin.on('data', (chunk) => {
      process.stdout.write(
        encode(chunk.toString()).map(b => String.fromCharCode(b)).join('')
      );
    });
  });

try {
  program.parse();
} catch (err) {
  console.error('Error: %s', err);
  process.exit(1);
}
