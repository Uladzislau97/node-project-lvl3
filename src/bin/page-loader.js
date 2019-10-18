#!/usr/bin/env node --no-warnings
import program from 'commander';
import path from 'path';
import loadPageByPath from '..';

program
  .name('page-loader-js')
  .version('1.2.0')
  .arguments('<url>')
  .action((url) => {
    const outputPath = path.resolve(program.output || '');
    loadPageByPath(url, outputPath).catch(console.log);
  })
  .description('Download the specified address from the network.')
  .option('-o, --output [path]', 'downloading path')
  .parse(process.argv);
