import nock from 'nock';
import os from 'os';
import path from 'path';
import { promises as fs } from 'fs';
import _ from 'lodash';
import loadPageByPath from '../src';

const deleteLineBreaks = string => string
  .split('\n')
  .filter(str => str)
  .map(str => str.trim())
  .join('');

test('load html page', async () => {
  const outputPath = os.tmpdir();
  const outputFileName = 'hexlet-io-courses.html';
  const outputFilePath = path.resolve(outputPath, outputFileName);
  await fs.unlink(outputFilePath).catch(_.noop);

  const host = 'https://hexlet.io';
  const requestPath = '/courses';
  const responseFilePath = path.resolve(__dirname, '__fixtures__/test_1/index.html');
  nock(host)
    .get(requestPath)
    .replyWithFile(200, responseFilePath, {
      'Content-Type': 'text/html',
    });

  const requestUrl = `${host}${requestPath}`;
  await loadPageByPath(requestUrl, outputPath);

  const outputFileContent = await fs.readFile(outputFilePath, 'utf8');
  const formattedOutputFileContent = deleteLineBreaks(outputFileContent);
  const expectedContent = await fs.readFile(responseFilePath, 'utf8');
  const formattedExpectedContent = deleteLineBreaks(expectedContent);
  expect(formattedOutputFileContent).toEqual(formattedExpectedContent);
});

test('load html page and other internal content', async () => {
  const outputPath = os.tmpdir();

  const outputHTMLFileName = 'hexlet-io-courses.html';
  const outputHTMLFilePath = path.resolve(outputPath, outputHTMLFileName);
  await fs.unlink(outputHTMLFilePath).catch(_.noop);

  const assetsDirName = 'hexlet-io-courses_files';

  const outputCSSFileName = 'assets-index.css';
  const outputCSSFilePath = path.resolve(outputPath, assetsDirName, outputCSSFileName);
  await fs.unlink(outputCSSFilePath).catch(_.noop);

  const outputJSFileName = 'assets-index.js';
  const outputJSFilePath = path.resolve(outputPath, assetsDirName, outputJSFileName);
  await fs.unlink(outputJSFilePath).catch(_.noop);

  const outputImgName = 'assets-index.jpg';
  const outputImgPath = path.resolve(outputPath, assetsDirName, outputImgName);
  await fs.unlink(outputImgPath).catch(_.noop);

  const host = 'https://hexlet.io';

  const htmlRequestPath = '/courses';
  const responseHTMLFilePath = path.resolve(__dirname, '__fixtures__/test_2/index.html');
  nock(host)
    .get(htmlRequestPath)
    .replyWithFile(200, responseHTMLFilePath, {
      'Content-Type': 'text/html',
    });

  const cssRequestPath = '/assets/index.css';
  const responseCSSFilePath = path.resolve(__dirname, '__fixtures__/test_2/index.css');
  nock(host)
    .get(cssRequestPath)
    .replyWithFile(200, responseCSSFilePath, {
      'Content-Type': 'text/css',
    });

  const jsRequestPath = '/assets/index.js';
  const responseJSFilePath = path.resolve(__dirname, '__fixtures__/test_2/index.js');
  nock(host)
    .get(jsRequestPath)
    .replyWithFile(200, responseJSFilePath, {
      'Content-Type': 'application/javascript',
    });

  const imgRequestPath = '/assets/index.jpg';
  const responseImgPath = path.resolve(__dirname, '__fixtures__/test_2/index.jpg');
  nock(host)
    .get(imgRequestPath)
    .replyWithFile(200, responseImgPath, {
      'Content-Type': 'arraybuffer',
    });

  const requestUrl = `${host}${htmlRequestPath}`;
  await loadPageByPath(requestUrl, outputPath);

  const outputHTMLFileContent = await fs.readFile(outputHTMLFilePath, 'utf8');
  const formattedOutputHtmlContent = deleteLineBreaks(outputHTMLFileContent);
  const resultHTMLFilePath = path.resolve(__dirname, '__fixtures__/test_2/result.html');
  const expectedHTMLContent = await fs.readFile(resultHTMLFilePath, 'utf8');
  const formattedExpectedHTMLContent = deleteLineBreaks(expectedHTMLContent);
  expect(formattedOutputHtmlContent).toEqual(formattedExpectedHTMLContent);

  const outputCSSFileContent = await fs.readFile(outputCSSFilePath, 'utf8');
  const formattedOutputCSSFileContent = deleteLineBreaks(outputCSSFileContent);
  const expectedCSSContent = await fs.readFile(responseCSSFilePath, 'utf8');
  const formattedExpectedCSSContent = deleteLineBreaks(expectedCSSContent);
  expect(formattedOutputCSSFileContent).toEqual(formattedExpectedCSSContent);

  const outputJSFileContent = await fs.readFile(outputJSFilePath, 'utf8');
  const formattedOutputJSFileContent = deleteLineBreaks(outputJSFileContent);
  const expectedJSContent = await fs.readFile(responseJSFilePath, 'utf8');
  const formattedExpectedJSContent = deleteLineBreaks(expectedJSContent);
  expect(formattedOutputJSFileContent).toEqual(formattedExpectedJSContent);

  const outputImg = await fs.readFile(outputImgPath, 'utf8');
  const outputImgAsString = Buffer.from(outputImg).toString('base64');
  const expectedImg = await fs.readFile(responseImgPath, 'utf8');
  const expectedImgAsString = Buffer.from(expectedImg).toString('base64');
  expect(outputImgAsString).toEqual(expectedImgAsString);
});
