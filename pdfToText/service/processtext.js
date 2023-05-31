import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfjspkg = require('pdfjs-dist/legacy/build/pdf.js');
const { getDocument } = pdfjspkg;
const canvaspkg = require('canvas');
const { createCanvas, loadImage } = canvaspkg;
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import superagent from 'superagent';
import { VISIONKEY, VISION_API } from '../config/config.js';
var toArrayBuffer = require('to-array-buffer');
import axios from 'axios';
const xlsx = require('xlsx');

export const getpdf2text = async (pdfUrl) => {
  try {
    const pdf = await getDocument(pdfUrl).promise;
    var numPages = pdf.numPages;
    var finalString = '';
    for (var i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const pageTextContent = await page.getTextContent();
      const pageText = pageTextContent.items
        .map((item) => (item.str != '' ? item.str : '\n'))
        .join(' ');
      finalString += pageText + '\n\n';
    }
    return finalString;
  } catch (error) {
    console.log('error', error);
  }
};

export const processPdf = async (pdfUrl) => {
  try {
    return await getpdf2text(pdfUrl);
  } catch (err) {
    console.log('error ' + err);
  }
};

export function loadFile(url, callback) {
  try {
    superagent
      .get(url)
      .responseType('arraybuffer')
      .end((err, res) => {
        if (err) {
          callback(err);
          return;
        }
        callback(null, res.body);
      });
  } catch (error) {
    console.log('error', error);
  }
}

export async function processDocx(docxUrl) {
  try {
    const content = await new Promise((resolve, reject) => {
      loadFile(docxUrl, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(toArrayBuffer(data));
        }
      });
    });
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip);
    const text = doc.getFullText();

    return text;
  } catch (err) {
    console.log('error ' + err);
  }
}

export const processXlsx = async (xlsxUrl) => {
  try {
    const response = await axios.get(xlsxUrl, {
      responseType: 'arraybuffer',
      headers: {
        Accept:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

    const workbook = xlsx.read(response.data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const csvText = xlsx.utils.sheet_to_csv(worksheet);
    const text = csvText.replace(/,/g, ' ');
    return text;
  } catch (err) {
    console.log('error ' + err);
  }
};

export const convertImageToBase64Async = (imgUrl) => {
  return new Promise((resolve) => convertImageToBase64(imgUrl, resolve));
};

export const convertImageToBase64 = async (imgUrl, cb) => {
  try {
    const img = await loadImage(imgUrl);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const dataUrl = canvas.toDataURL();
    cb(dataUrl);
    return dataUrl;
  } catch (error) {
    console.log('error', error);
  }
};
export const processImage = async (imageUrl) => {
  try {
    let base64 = (await convertImageToBase64Async(imageUrl)).replace(
      /^data:image\/(png|jpg);base64,/,
      ''
    );
    const response = await fetch(VISION_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + VISIONKEY,
        'x-goog-user-project': 'text2image-380917',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: base64,
            },
            features: [
              {
                type: 'TEXT_DETECTION',
              },
            ],
          },
        ],
      }),
    });
    const data = await response.json();
    const text = data.responses[0].fullTextAnnotation.text;
    return text;
  } catch (error) {
    console.log('error', error);
  }
};
