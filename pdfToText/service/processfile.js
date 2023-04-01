import pkg from 'pdfjs-dist';
const { getDocument } = pkg;

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

export const loadFile = (url, callback) =>  {
  PizZipUtils.getBinaryContent(url, callback);
}

export const processDocx = async (docxUrl) => {
  try {
    console.log('processDocx');
    const content = await loadFileAsync(docxUrl);
    const zip = new PizZip(content);
    const doc = new window.docxtemplater(zip);
    const text = doc.getFullText();
    return text
  } catch (err) {
    console.log('error ' + err);
  }
};

export const convertImageToBase64Async = (imgUrl) => {
  return new Promise(resolve => convertImageToBase64(imgUrl, resolve))
} 

export const convertImageToBase64 = (imgUrl, callback) => {
  const image = new Image();
  image.crossOrigin='anonymous';
  image.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.height = image.naturalHeight;
    canvas.width = image.naturalWidth;
    ctx.drawImage(image, 0, 0);
    const dataUrl = canvas.toDataURL();
    callback && callback(dataUrl)
  }
  image.src = imgUrl;
}
export const processImage = async (imageUrl) => {
  console.log('processImage')
  try {
    let base64 = (await convertImageToBase64Async(imageUrl)).replace(/^data:image\/(png|jpg);base64,/, "");
    const response = await fetch('https://vision.googleapis.com/v1/images:annotate', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer ya29.a0Ael9sCN_Ifx2yzeFLaq5vZoB_2lEMeR2lkhbHPJ-QsTGS4FgNrA_zplF5sEkrcq7WgC2Z_W-kPqD-ee4aWVBfJWx2EtiMXU21hOVRx30wmPColsVO9CbaY23aUwaKGvRNvK2Il5r9lmc_bMIkiacWtpMIv6N3vwpRToKVgaCgYKAbISARESFQF4udJho76BxqS0KOFWGHPPom_Z1Q0173",
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
    console.log(data);

    const text = data.responses[0].fullTextAnnotation.text;
   return text
  } catch (error) {
    console.log('error', error);
  }
};