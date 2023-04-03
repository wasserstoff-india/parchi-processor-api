import { createRequire } from "module";

const require = createRequire(import.meta.url);
const  pdfjspkg =require('pdfjs-dist');
const { getDocument } = pdfjspkg;
// const pizzpkg=require("pizzip")
const canvaspkg = require('canvas')
const { createCanvas, loadImage }=canvaspkg
const docxtemplaterpkg=require("docxtemplater")
import PizZipUtils from 'pizzip/utils/index.js';
import PizZip from "pizzip";



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



export function loadFile(url,callback){
  console.log(url,"###############")

  PizZipUtils.getBinaryContent(url,callback);
}

export const processDocx = async (docxUrl) => {
  try {
    console.log('processDocx');
    const content = loadFile(docxUrl);
    console.log(content);
    const zip = new PizZip(content);
    const doc = new window.docxtemplaterpkg(zip);
    const text = doc.getFullText();
    return text
  } catch (err) {
    console.log('error ' + err);
  }
};

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