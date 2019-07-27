#!/usr/bin/env node
import program from 'commander';
import loadPage from '..';

program
  .name('page-loader-js')
  .version('1.0.0')
  .arguments('<url>')
  .action(url => loadPage(url, program.output))
  .description('Download the specified address from the network.')
  .option('-o, --output [path]', 'downloading path')
  .parse(process.argv);
