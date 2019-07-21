#!/usr/bin/env node
import program from 'commander';
import loadPage from '..';

program
  .version('1.0.0')
  .arguments('<url>')
  .action(url => loadPage(url))
  .description('Download the specified address from the network.')
  .option('-o, --output [path]', 'downloading path')
  .parse(process.argv);
