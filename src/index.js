import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';
import cheerio from 'cheerio';
import _ from 'lodash';
import debug from 'debug';

const pageLoaderLog = debug('page-loader-js');
const notLettersOrNumbersRegex = /[\W_]/g;

const buildName = filepath => filepath
  .split(notLettersOrNumbersRegex)
  .filter(str => str)
  .join('-');

const buildFileObject = (address, outputPath) => {
  const { protocol } = url.parse(address);
  const filepath = address.replace(`${protocol}//`, '');
  const outputFileName = buildName(filepath);
  const resourcesFolderName = `${outputFileName}_files`;
  const resourcesFolderPath = path.resolve(outputPath, resourcesFolderName);
  return {
    type: 'file',
    name: outputFileName,
    outputPath,
    resourcesFolderPath,
    address,
    ext: '.html',
  };
};

const buildResourceObject = (element) => {
  const tagName = element.prop('tagName');
  const tag = tagName === 'LINK'
    ? { name: tagName, attrName: 'href', attrValue: element.attr('href') }
    : { name: tagName, attrName: 'src', attrValue: element.attr('src') };
  return { tag };
};

const isLocalResourceObject = ({ tag }) => !url.parse(tag.attrValue).protocol;

const buildLocalResourceObject = ({ tag }, fileObject) => {
  const resourceAddress = url.resolve(fileObject.address, tag.attrValue);
  const { path: resourcePath } = url.parse(resourceAddress);
  const { dir, name: filename, ext } = path.parse(resourcePath);
  const filepath = `${dir}/${filename}`;
  const resourceName = buildName(filepath);
  const type = tag.name === 'IMG' ? 'bin' : 'file';
  const resourceTag = { ...tag, newAttrValue: `${fileObject.name}_files/${resourceName}${ext}` };
  return {
    name: resourceName,
    address: resourceAddress,
    outputPath: fileObject.resourcesFolderPath,
    ext,
    type,
    tag: resourceTag,
  };
};

const downloadResource = ({ type, address }) => {
  if (type === 'bin') {
    return axios({
      method: 'get',
      url: address,
      responseType: 'buffer',
    });
  }
  return axios.get(address);
};

const writeResource = ({
  outputPath, name, ext, data,
}) => {
  const fullOutputPath = path.resolve(outputPath, `${name}${ext}`);
  return fs.writeFile(fullOutputPath, data);
};

const loadPageByPath = (address, outputPath) => {
  pageLoaderLog(`address: ${address}`);
  pageLoaderLog(`output path: ${outputPath}`);

  const fileObject = buildFileObject(address, outputPath);
  return axios
    .get(address)
    .then(({ data }) => {
      const $ = cheerio.load(data);
      const $resourceElements = $('link, img, script')
        .toArray()
        .map(element => $(element))
        .filter($element => $element.attr('src') || $element.attr('href'));
      const resourceObjects = $resourceElements.map(buildResourceObject);
      const localResourceObjects = resourceObjects
        .filter(isLocalResourceObject)
        .map(obj => buildLocalResourceObject(obj, fileObject));

      localResourceObjects
        .map(({ tag }) => tag)
        .forEach(({
          name, attrName, attrValue, newAttrValue,
        }) => {
          $(`${name}[${attrName}='${attrValue}']`).attr(`${attrName}`, newAttrValue);
        });

      pageLoaderLog(`local resource objects: ${JSON.stringify(localResourceObjects, null, 2)}`);

      fileObject.data = $.html();
      fileObject.localResourceObjects = localResourceObjects;

      return writeResource(fileObject);
    })
    .then(() => Promise.all(
      fileObject.localResourceObjects.map(downloadResource),
    ))
    .then((downloadedResources) => {
      fileObject.localResourceObjects = _
        .zip(fileObject.localResourceObjects, downloadedResources)
        .map(([resourceObject, downloadedResource]) => (
          { ...resourceObject, data: downloadedResource.data }
        ));
      if (fileObject.localResourceObjects.length > 0) {
        return fs.mkdir(fileObject.resourcesFolderPath);
      }
      return null;
    })
    .then(() => Promise.all(
      fileObject.localResourceObjects.map(writeResource),
    ));
};

export default loadPageByPath;
