import nock from 'nock';
import os from 'os';
import path from 'path';
import { promises as fs } from 'fs';
import loadPageByPath from '../src';

test('loadPageByPath', async () => {
  const host = 'https://ru.hexlet.io';
  const requestPath = '/courses';
  const requestUrl = `${host}${requestPath}`;

  const responseFilePath = path.resolve(__dirname, '__fixtures__/test_1/index.html');
  nock(host)
    .get(requestPath)
    .replyWithFile(200, responseFilePath, {
      'Content-Type': 'text/html',
    });

  const tmpDir = os.tmpdir();
  const outputPath = await fs.mkdtemp(`${tmpDir}${path.sep}`);
  await loadPageByPath(requestUrl, outputPath);

  const outputFileName = 'ru-hexlet-io-courses.html';
  const outputFilePath = path.resolve(outputPath, outputFileName);
  const outputFileContent = await fs.readFile(outputFilePath, 'utf8');
  const expectedContent = await fs.readFile(responseFilePath, 'utf8');

  expect(outputFileContent).toEqual(expectedContent);
});
