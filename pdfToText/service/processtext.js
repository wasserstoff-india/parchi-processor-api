import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfjspkg = require('pdfjs-dist/legacy/build/pdf.js');
const { getDocument } = pdfjspkg;
const canvaspkg = require('canvas');
const { createCanvas } = canvaspkg;
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import superagent from 'superagent';
var toArrayBuffer = require('to-array-buffer');
import axios from 'axios';
const xlsx = require('xlsx');
import { createImageFromText, processImage } from './response.js';

// this all code is from using tesseract library

export const getpdf2text = async (pdfUrl) => {
  try {
    const pdf = await getDocument(pdfUrl).promise;
    const numPages = pdf.numPages;
    let finalString = '';

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
      const canvas = createCanvas('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;

      const imageSrc = canvas.toDataURL('image/png');
      const pageText = await processImage(imageSrc);
      finalString += pageText + '\n\n';
    }

    return finalString;
  } catch (error) {
    console.log('Error:', error);
  }
};

export const processPdf = async (pdfUrl) => {
  try {
    return await getpdf2text(pdfUrl);
  } catch (err) {
    console.log('Error:', err);
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

    const imageSrc = await createImageFromText(text);
    const processedText = await processImage(imageSrc);
    return processedText;
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
    const imageSrc = await createImageFromText(text);
    const processedText = await processImage(imageSrc);
    return processedText;
  } catch (err) {
    console.log('error ' + err);
  }
};

// here we are extracting text from diffrent library without  using tesseract

// export const getpdf2text = async (pdfUrl) => {
//   try {
//     const pdf = await getDocument(pdfUrl).promise;
//     var numPages = pdf.numPages;
//     var finalString = '';
//     for (var i = 1; i <= numPages; i++) {
//       const page = await pdf.getPage(i);
//       const pageTextContent = await page.getTextContent();
//       const pageText = pageTextContent.items
//         .map((item) => (item.str != '' ? item.str : '\n'))
//         .join(' ');
//       finalString += pageText + '\n\n';
//     }
//     return finalString;
//   } catch (error) {
//     console.log('error', error);
//   }
// };

// export const processPdf = async (pdfUrl) => {
//   try {
//     return await getpdf2text(pdfUrl);
//   } catch (err) {
//     console.log('error ' + err);
//   }
// };

// export function loadFile(url, callback) {
//   try {
//     superagent
//       .get(url)
//       .responseType('arraybuffer')
//       .end((err, res) => {
//         if (err) {
//           callback(err);
//           return;
//         }
//         callback(null, res.body);
//       });
//   } catch (error) {
//     console.log('error', error);
//   }
// }

// export async function processDocx(docxUrl) {
//   try {
//     const content = await new Promise((resolve, reject) => {
//       loadFile(docxUrl, (err, data) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(toArrayBuffer(data));
//         }
//       });
//     });
//     const zip = new PizZip(content);
//     const doc = new Docxtemplater(zip);
//     const text = doc.getFullText();

//     return text;
//   } catch (err) {
//     console.log('error ' + err);
//   }
// }

// export const processXlsx = async (xlsxUrl) => {
//   try {
//     const response = await axios.get(xlsxUrl, {
//       responseType: 'arraybuffer',
//       headers: {
//         Accept:
//           'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//       },
//     });

//     const workbook = xlsx.read(response.data, { type: 'buffer' });
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];
//     const csvText = xlsx.utils.sheet_to_csv(worksheet);
//     const text = csvText.replace(/,/g, ' ');
//     return text;
//   } catch (err) {
//     console.log('error ' + err);
//   }
// };

// export const convertImageToBase64Async = (imgUrl) => {
//   return new Promise((resolve) => convertImageToBase64(imgUrl, resolve));
// };

// export const convertImageToBase64 = async (imgUrl, cb) => {
//   try {
//     const img = await loadImage(imgUrl);
//     const canvas = createCanvas(img.width, img.height);
//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(img, 0, 0);
//     const dataUrl = canvas.toDataURL();
//     cb(dataUrl);

//     return dataUrl;
//   } catch (error) {
//     console.log('error', error);
//   }
// };

// export const processImage = async (imageUrl) => {
//   try {
//     const { data } = await Tesseract.recognize(encodeURI(imageUrl), 'eng');
//     const text = data.text;
//     return text;
//   } catch (error) {
//     console.log('error', error);
//   }
// };
