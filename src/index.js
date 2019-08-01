import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';

const loadPageByPath = (address, outputPath) => axios
  .get(address)
  .then(({ data }) => {
    const notLettersOrNumbersRegex = /[\W_]/g;
    const { host, pathname } = url.parse(address);
    const outputFileName = `${host}${pathname}`
      .replace(notLettersOrNumbersRegex, '-');
    const fullOutputFileName = `${outputFileName}.html`;
    const outputFilePath = path.resolve(outputPath, fullOutputFileName);
    return fs.writeFile(outputFilePath, data);
  });

export default loadPageByPath;
