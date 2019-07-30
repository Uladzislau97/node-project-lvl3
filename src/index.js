import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';

const loadPageByPath = (downloadUrl, outputPath) => axios
  .get(downloadUrl)
  .then(({ data }) => {
    const downloadUrlData = url.parse(downloadUrl);
    const host = downloadUrlData.host.replace(/[./_:]/g, '-');
    const pathname = downloadUrlData.pathname.replace(/[./_:]/g, '-');
    const outputFileName = `${host}${pathname}.html`;
    const outputFilePath = path.resolve(outputPath, outputFileName);
    return fs.writeFile(outputFilePath, data);
  });

export default loadPageByPath;
