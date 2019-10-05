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

const generateOutputPath = async () => {
  const tmpDir = os.tmpdir();
  const outputPath = `${tmpDir}${path.sep}`;
  await fs.mkdtemp(outputPath);
  return outputPath;
};

const deleteLineBreaks = string => string
  .split('\n')
  .filter(str => str)
  .map(str => str.trim())
  .join('');

test('load html page', async () => {
  const requestPath = '/courses_1';
  const responseFilePath = path.resolve(__dirname, '__fixtures__/test_1/index.html');
  nockFileRequests(requestPath, responseFilePath, htmlContentType);

  const requestUrl = `${hostName}${requestPath}`;
  const outputPath = await generateOutputPath();
  await loadPageByPath(requestUrl, outputPath);

  const outputFileName = 'ru-hexlet-io-courses-1.html';
  const outputFilePath = path.resolve(outputPath, outputFileName);
  const outputFileContent = await fs.readFile(outputFilePath, 'utf8');
  const expectedContent = await fs.readFile(responseFilePath, 'utf8');
  expect(
    deleteLineBreaks(outputFileContent),
  ).toEqual(
    deleteLineBreaks(expectedContent),
  );
});

test('load html page and other internal content', async () => {
  const htmlRequestPath = '/courses_2';
  const responseHTMLFilePath = path.resolve(__dirname, '__fixtures__/test_2/index.html');
  nockFileRequests(htmlRequestPath, responseHTMLFilePath, htmlContentType);

  const cssRequestPath = '/assets/index.css';
  const responseCSSFilePath = path.resolve(__dirname, '__fixtures__/test_2/index.css');
  nockFileRequests(cssRequestPath, responseCSSFilePath, cssContentType);

  const jsRequestPath = '/assets/index.js';
  const responseJSFilePath = path.resolve(__dirname, '__fixtures__/test_2/index.js');
  nockFileRequests(jsRequestPath, responseJSFilePath, jsContentType);

  const imgRequestPath = '/assets/index.jpg';
  const responseImgPath = path.resolve(__dirname, '__fixtures__/test_2/index.jpg');
  nockFileRequests(imgRequestPath, responseImgPath, binaryContentType);

  const requestUrl = `${hostName}${htmlRequestPath}`;
  const outputPath = await generateOutputPath();
  await loadPageByPath(requestUrl, outputPath);

  const assetsDirName = 'ru-hexlet-io-courses-2_files';

  const outputCSSFileName = 'assets-index.css';
  const outputCSSFilePath = path.resolve(outputPath, assetsDirName, outputCSSFileName);
  const outputCSSFileContent = await fs.readFile(outputCSSFilePath, 'utf8');
  const expectedCSSContent = await fs.readFile(responseCSSFilePath, 'utf8');
  expect(
    deleteLineBreaks(outputCSSFileContent),
  ).toEqual(
    deleteLineBreaks(expectedCSSContent),
  );

  const outputJSFileName = 'assets-index.js';
  const outputJSFilePath = path.resolve(outputPath, assetsDirName, outputJSFileName);
  const outputJSFileContent = await fs.readFile(outputJSFilePath, 'utf8');
  const expectedJSContent = await fs.readFile(responseJSFilePath, 'utf8');
  expect(
    deleteLineBreaks(outputJSFileContent),
  ).toEqual(
    deleteLineBreaks(expectedJSContent),
  );

  const outputImgName = 'assets-index.jpg';
  const outputImgPath = path.resolve(outputPath, assetsDirName, outputImgName);
  const outputImg = await fs.readFile(outputImgPath, 'utf8');
  const outputImgAsString = Buffer.from(outputImg).toString('base64');
  const expectedImg = await fs.readFile(responseCSSFilePath, 'utf8');
  const expectedImgAsString = Buffer.from(expectedImg).toString('base64');
  expect(outputImgAsString).toEqual(expectedImgAsString);

  const outputHTMLFileName = 'ru-hexlet-io-courses-2.html';
  const outputHTMLFilePath = path.resolve(outputPath, outputHTMLFileName);
  const outputHTMLFileContent = await fs.readFile(outputHTMLFilePath, 'utf8');
  const resultHTMLFilePath = path.resolve(__dirname, '__fixtures__/test_2/result.html');
  const expectedHTMLContent = await fs.readFile(resultHTMLFilePath, 'utf8');
  expect(
    deleteLineBreaks(outputHTMLFileContent),
  ).toEqual(
    deleteLineBreaks(expectedHTMLContent),
  );
});
