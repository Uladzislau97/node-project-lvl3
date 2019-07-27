import nock from 'nock';
import axios from 'axios';
import os from 'os';
import { promises as fs } from 'fs';
import path from 'path';
import loadPage from '..';

const hostname = 'https://hexlet.io';
axios.defaults.baseURL = hostname;

test('save file by specified path', async () => {
  const requestPath = '/courses';
  const filepath = path.resolve(__dirname, '__fixtures__/test_1.html');

  nock(hostname)
    .get(requestPath)
    .replyWithFile(200, filepath, {
      'Content-Type': 'text/html',
    });

  const tmpDir = os.tmpdir();
  const requestUrl = `${hostname}${requestPath}`;
  const pathForSave = await fs.mkdtemp(`${tmpDir}${path.sep}`);

  await loadPage(requestUrl, pathForSave);

  const actualFilePath = path.resolve(__dirname, pathForSave);
  const actualContent = await fs.readFile(actualFilePath, 'utf8');
  const expectedFilePath = path.resolve(__dirname, '__fixtures__/test_1.html');
  const expectedContent = await fs.readFile(expectedFilePath, 'utf8');

  expect(actualContent).toEqual(expectedContent);
});
