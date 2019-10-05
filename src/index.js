import axios from 'axios';
import fs from 'fs';
import path from 'path';
import url from 'url';
import cheerio from 'cheerio';
import _ from 'lodash';

const notLettersOrNumbersRegex = /[\W_]/g;

const buildName = filepath => filepath
  .split(notLettersOrNumbersRegex)
  .filter(str => str)
  .join('-');

const buildFileObject = (address, outputPath) => {
  const { protocol } = url.parse(address);
  const filepath = address.replace(`${protocol}//`, '');
  const outputFileName = buildName(filepath);
  return {
    type: 'file',
    name: outputFileName,
    outputPath,
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
  const outputPath = path.resolve(fileObject.outputPath, `${fileObject.name}_files/`);
  const type = tag.name === 'IMG' ? 'bin' : 'file';
  const resourceTag = { ...tag, newAttrValue: `${fileObject.name}_files/${resourceName}${ext}` };
  return {
    name: resourceName,
    address: resourceAddress,
    outputPath,
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
      responseType: 'stream',
    });
  }
  return axios.get(address);
};

const writeResource = ({
  outputPath, name, ext, data, type,
}) => {
  const fullOutputPath = path.resolve(outputPath, `${name}${ext}`);
  if (type === 'bin') {
    return data.pipe(fs.createWriteStream(fullOutputPath));
  }
  return fs.promises.writeFile(fullOutputPath, data);
};

const loadPageByPath = (address, outputPath) => {
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

      fileObject.data = $.html();
      fileObject.localResourceObjects = localResourceObjects;

      return Promise.all(
        fileObject.localResourceObjects.map(downloadResource),
      );
    })
    .then((downloadedResources) => {
      fileObject.localResourceObjects = _
        .zip(fileObject.localResourceObjects, downloadedResources)
        .map(([resourceObject, downloadedResource]) => (
          { ...resourceObject, data: downloadedResource.data }
        ));
      return [...fileObject.localResourceObjects, fileObject].map(writeResource);
    });
};

export default loadPageByPath;
