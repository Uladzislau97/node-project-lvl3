import nock from 'nock';
import os from 'os';
import path from 'path';
import { promises as fs } from 'fs';
import loadPageByPath from '../src';

const hostName = 'https://ru.hexlet.io';
const htmlContentType = 'text/html';
const cssContentType = 'text/css';
const jsContentType = 'application/javascript';
const binaryContentType = 'arraybuffer';

let nockedHost;

beforeEach(() => {
  nockedHost = nock(hostName);
});

const nockFileRequests = (requestPath, responseFilePath, contentType) => {
  nockedHost
    .get(requestPath)
    .replyWithFile(200, responseFilePath, {
      'Content-Type': contentType,
    });
};

test('load html page', async () => {
  const requestPath = '/courses';
  const responseFilePath = path.resolve(__dirname, '__fixtures__/test_1/index.html');
  nockFileRequests(requestPath, responseFilePath, htmlContentType);

  const requestUrl = `${hostName}${requestPath}`;
  const tmpDir = os.tmpdir();
  const outputPath = await fs.mkdtemp(`${tmpDir}${path.sep}`);
  await loadPageByPath(requestUrl, outputPath);

  const outputFileName = 'ru-hexlet-io-courses.html';
  const outputFilePath = path.resolve(outputPath, outputFileName);
  const outputFileContent = await fs.readFile(outputFilePath, 'utf8');
  const expectedContent = await fs.readFile(responseFilePath, 'utf8');

  expect(outputFileContent).toEqual(expectedContent);
});

test('load html page and other internal content', async () => {
  const requestPath = '/courses';
  const responseFilePath = path.resolve(__dirname, '__fixtures__/test_2/index.html');
  nockFileRequests(requestPath, responseFilePath, htmlContentType);

  const cssRequestPath = '/assets/index.css';
  const responseCSSFilePath = path.resolve(__dirname, '__fixtures__/test_2/index.css');
  nockFileRequests(cssRequestPath, responseCSSFilePath, cssContentType);

  const jsRequestPath = '/assets/index.js';
  const responseJSFilePath = path.resolve(__dirname, '__fixtures__/test_2/index.js');
  nockFileRequests(jsRequestPath, responseJSFilePath, jsContentType);

  const imgRequestPath = '/assets/index.jpg';
  const responseImgFilePath = path.resolve(__dirname, '__fixtures__/test_2/index.jpg');
  nockFileRequests(imgRequestPath, responseImgFilePath, binaryContentType);
});
