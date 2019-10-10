import nock from 'nock';
import os from 'os';
import path from 'path';
import { promises as fs } from 'fs';
import _ from 'lodash';
import loadPageByPath from '../src';

test('loadPageByPath', async () => {
  const outputPath = os.tmpdir();
  const outputFileName = 'hexlet-io-courses.html';
  const outputFilePath = path.resolve(outputPath, outputFileName);
  await fs.unlink(outputFilePath).catch(_.noop);

  const host = 'https://hexlet.io';
  const requestPath = '/courses';
  const responseFilePath = path.resolve(__dirname, '__fixtures__/test_1.html');
  nock(host)
    .get(requestPath)
    .replyWithFile(200, responseFilePath, {
      'Content-Type': 'text/html',
    });

  const requestUrl = `${host}${requestPath}`;
  await loadPageByPath(requestUrl, outputPath);

  const outputFileContent = await fs.readFile(outputFilePath, 'utf8');
  const expectedContent = await fs.readFile(responseFilePath, 'utf8');

  expect(outputFileContent).toEqual(expectedContent);
});
