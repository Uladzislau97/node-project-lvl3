import nock from 'nock';
import os from 'os';
import { promises as fs } from 'fs';
import path from 'path';
import loadPage from '..';

const hostname = 'https://hexlet.io';
const requestPath = '/courses';
const requestUrl = `${hostname}${requestPath}`;
const tmpDir = os.tmpdir();

beforeEach(() => {
  const expectedFilePath = path.resolve(__dirname, '__fixtures__/test_1.html');
  nock(hostname)
    .get(requestPath)
    .replyWithFile(200, expectedFilePath, {
      'Content-Type': 'text/html',
    });
});

test('save file by specified path', async () => {
  const pathForSave = await fs.mkdtemp(`${tmpDir}${path.sep}`);
  await loadPage(requestUrl, pathForSave);
  const actualFilePath = path.resolve(__dirname, pathForSave);
  const actualContent = await fs.readFile(actualFilePath, 'utf8');
  const expectedFilePath = path.resolve(__dirname, '__fixtures__/test_1.html');
  const expectedContent = await fs.readFile(expectedFilePath, 'utf8');
  expect(actualContent).toEqual(expectedContent);
});
