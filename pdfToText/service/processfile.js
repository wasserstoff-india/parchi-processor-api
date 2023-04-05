import { createRequire } from "module";

const require = createRequire(import.meta.url);
const  pdfjspkg =require('pdfjs-dist');
const { getDocument } = pdfjspkg;
import docxpkg from 'docx'
const { Packer, Document } =docxpkg;
const canvaspkg = require('canvas')
const { createCanvas, loadImage }=canvaspkg
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import superagent from 'superagent';
import axios from "axios";
var toArrayBuffer = require('to-array-buffer')
const StreamZip = require('node-stream-zip');
const WordExtractor = require("word-extractor"); 
const extractor = new WordExtractor();
var textract = require('textract');



export const getpdf2text = async (pdfUrl) => {
  const pdf = await getDocument(pdfUrl).promise;
  // console.log(pdf, "pdf")
  var numPages = pdf.numPages;
  // console.log(numPages, "numPages")
  var finalString = '';    
  for(var i = 1; i <= numPages; i++){
    const page = await pdf.getPage(i);
    console.log(page, "page 1")
    const pageTextContent = await page.getTextContent();
    console.log(pageTextContent, "pageTextContent")
    const pageText = pageTextContent.items.map(item => item.str!='' ? item.str : '\n').join(' ');
    finalString += pageText + '\n\n';
  }
  return finalString;
}


export const processPdf = async (pdfUrl) => {
  try {
    return await getpdf2text(pdfUrl);
  } catch (err) {
    console.log('error ' + err);
  }
};

export function loadFile(url, callback) {
  superagent.get(url).responseType('arraybuffer').end((err, res) => {
    if (err) {
      callback(err);
      return;
    }
    callback(null, res.body);
  });
}


export async function processDocx(docxUrl) {
  try {
    console.log('processDocx');
    const content = await new Promise((resolve, reject) => {
      loadFile(docxUrl, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(toArrayBuffer(data));
        }
      });
    });
    console.log(content,"@@@@@@@@@@@@")
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip);
    const text = doc.getFullText();
    return text;
  } catch (err) {
    console.log('error ' + err);
  }
}

// const loadfile = async (url) => {
//   const response = await fetch(url);
//   console.log(response.headers.get('Content-Type'))
//   const data = await response.arrayBuffer();
//   console.log(data,'Data Buffer')
//   return data;
// }






// invalid argument type of docs url or the 
// export const processfile = async (docxUrl) => {
//   console.log(docxUrl,"#############")
//   try {
//     axios.get(docxUrl, { responseType: 'arraybuffer' })
//   .then((response) => {
//     const buffer = Buffer.from(response.data);

//     textract.fromBufferWithMime('application/msword', buffer, (error, text) => {
//       if (error) {
//         console.error(error);
//         return;
//       }

//       console.log(text);
//     });
//   })
//   .catch((error) => {
//     console.error(error);
//   });
//     const response = await axios({
//       method: 'GET',
//       url: docxUrl,
//       responseType: 'arraybuffer'
//     });
// console.log(response);
//     const zip = new StreamZip({
//       storeEntries: true,
//       zlib: { level: 1 }
//     });
//     zip.on('error', function(err) {
//       console.error(err);
//     });

//     zip.on('ready', function() {
//       const docBuffer = zip.entryDataSync('word/document.xml');
//       const doc = new docxpkg.Document(docBuffer);
//       const text = doc.getText();
//       console.log(text);
//       zip.close();
//     });

//     zip.load(response.data);
  // } catch (error) {
  //   console.error(error);
  // }
    // const content = await loadfile(docxUrl);
    // const zip = new PizZip(content);
    // console.log(zip,"!!!!!!!!!!!!!!!!!")
    // const doc = new window.docxtemplater(zip);
    // console.log(doc, "doc")
    // const text = doc.getFullText();

    // const extracted = extractor.extract(docxUrl);

    // extracted.then(function(doc) { console.log(doc.getBody(), 'extracted body'); });
    // textract.fromUrl(docxUrl, function( error, text ) {
    //   console.log(error, text, "textract response");
    // })
    // getSummary(text)
  // } catch (error) {
  //   console.error(error);
  // }
// };




export const convertImageToBase64Async = (imgUrl) => {
  console.log(imgUrl,"#########")
  return new Promise(resolve => convertImageToBase64(imgUrl, resolve))
} 


export const convertImageToBase64 = async (imgUrl, cb) => {
  const img = await loadImage(imgUrl);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const dataUrl = canvas.toDataURL();
  cb(dataUrl);
  return dataUrl;
}
export const processImage = async (imageUrl) => {
  try {
    let base64 = (await convertImageToBase64Async(imageUrl)).replace(/^data:image\/(png|jpg);base64,/, "");
    const response = await fetch('https://vision.googleapis.com/v1/images:annotate', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer ya29.a0Ael9sCMXMpOIVj_EsVNmBUmsJjey1qs41CRHBtZt5_VeAkwOOFOX7UxsGst73JNiCvg5O0FcjeXUd6LGtEK6aECSGEwXg8c65jRcogFbVDWYyCzY2SjWstD2FICQHFWSHiW87Ya1EzIAVfj9Mw9GSpag-6iV5eTGRUraBgaCgYKAagSARESFQF4udJhKYVN7pVYg7cgr4hx1qrLQw0173",
        "x-goog-user-project": "text2image-380917"
      },
      body: JSON.stringify({
        "requests": [
          {
            "image": {
              "content": base64
            },
            "features": [
              {
                "type": "TEXT_DETECTION"
              }
            ]
          }
        ]
      })
    });
    const data = await response.json();
    console.log(data)
    const text = data.responses[0].fullTextAnnotation.text;
    console.log(text)
   return text
  } catch (error) {
    console.log('error', error);
  }
};