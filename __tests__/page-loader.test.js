import nock from 'nock';
import os from 'os';
import path from 'path';
import { promises as fs } from 'fs';
import loadPageByPath from '..';

test('save file by specified path', async () => {
  const responseFilePath = path.resolve(__dirname, '__fixtures__/test_1.html');
  nock('https://test-host.com')
    .get('/test-path')
    .replyWithFile(200, responseFilePath, {
      'Content-Type': 'text/html',
    });

  const requestUrl = 'https://test-host.com/test-path';
  const tmpDir = os.tmpdir();
  const outputPath = await fs.mkdtemp(`${tmpDir}${path.sep}`);
  await loadPageByPath(requestUrl, outputPath);

  const outputFilePath = path.resolve(outputPath, 'test-host-com-test-path.html');
  const outputFileContent = await fs.readFile(outputFilePath, 'utf8');
  const expectedContent = await fs.readFile(responseFilePath, 'utf8');

  expect(outputFileContent).toEqual(expectedContent);
});
