$(document).ready(function() {
  console.log("!!!!!!")
  
  $('#submit-button').click(function() {
    var file_data = $('#file').prop('files')[0];   
    var form_data = new FormData();     
    
    form_data.append('app', 'pdf2text');
    form_data.append('dir', 'testdir');             
    form_data.append('file', file_data);
    $.ajax({
      url: 'https://gfa.thewasserstoff.com/upload',
      dataType: 'json',
      cache: false,
      contentType: false,
      processData: false,
      data: form_data,
      type: 'post',
      success: function(data) {
        console.log(data);
        const fileType = data.file.split('.').pop();
        switch (fileType) {
          case 'pdf': 
            processPdf(data.file)
            break;
          case 'doc':
          case 'docx':
            processDocx(data.file)
            break;
          case 'jpeg':
          case 'jpg':
          case 'png':
            processImage(data.file)
            break;
          default:
            console.log('file type not supported')
            break
        }
      }
    });
  });

  const getpdf2text = async (pdfUrl) => {
    const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
    console.log(pdf, "pdf")
    var numPages = pdf.numPages;
    console.log(numPages, "numPages")
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

  const processPdf = async (pdfUrl) => {
    getpdf2text(pdfUrl).then(function (text) {
      console.log('parse ' + text);
      const toPresent = text.replace(/\n/g, "<br />");
      $('#text-preview-area').html(toPresent)
      getSummary(text)
    }).catch(function (err) {
      console.log('error ' + err);
    });
  }

  const loadFile = (url, callback) =>  {
    PizZipUtils.getBinaryContent(url, callback);
  }

  const processDocx = (docxUrl) => {
    console.log('processDocx')
    loadFile(
      docxUrl,
      function (error, content) {
        if (error) {
          throw error;
        }
        var zip = new PizZip(content);
        var doc = new window.docxtemplater(zip);
        console.log(doc, "doc")
        var text = doc.getFullText();
        console.log(text);
        const toPresent = text.replace(/\n/g, "<br />");
        $('#text-preview-area').html(toPresent)
        // alert("Text is " + text);
        getSummary(text)
      }
  );
  }

  const convertImageToBase64Async = (imgUrl) => {
    return new Promise(resolve => convertImageToBase64(imgUrl, resolve))
  } 

  const convertImageToBase64 = (imgUrl, callback) => {
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

  const processImage = async (imageUrl) => {
    console.log('processImage')
    let base64 = (await convertImageToBase64Async(imageUrl)).replace(/^data:image\/(png|jpg);base64,/, "");;
    $.ajax({
      url: 'https://vision.googleapis.com/v1/images:annotate',
      dataType: 'json',
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer ya29.a0Ael9sCN_Ifx2yzeFLaq5vZoB_2lEMeR2lkhbHPJ-QsTGS4FgNrA_zplF5sEkrcq7WgC2Z_W-kPqD-ee4aWVBfJWx2EtiMXU21hOVRx30wmPColsVO9CbaY23aUwaKGvRNvK2Il5r9lmc_bMIkiacWtpMIv6N3vwpRToKVgaCgYKAbISARESFQF4udJho76BxqS0KOFWGHPPom_Z1Q0173",
        "x-goog-user-project": "text2image-380917"
      },
      data: JSON.stringify({
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
      }),
      type: 'post',
      success: function(data) {
        console.log(data);

        const text = data.responses[0].fullTextAnnotation.text
        const toPresent = text.replace(/\n/g, "<br />");
        $('#text-preview-area').html(toPresent)
        
        // const fullTextAnnotation = data.responses[0].fullTextAnnotation;
        // const containerDiv = presentStyledDiv(fullTextAnnotation)
        // $('#text-style-area').html(containerDiv)

        getSummary(text)
      }
    });
  }

  const presentStyledDiv = (fullTextAnnotation) => {
    const containerDiv = document.createElement('div');

    fullTextAnnotation.pages.forEach((page) => {
      page.blocks.forEach((block) => {
        const blockDiv = document.createElement('div');

        const blockBoundingBox = block.boundingBox.vertices;
        blockDiv.style.position = 'absolute';
        blockDiv.style.left = blockBoundingBox[0].x + 'px';
        blockDiv.style.top = blockBoundingBox[0].y + 'px';
        blockDiv.style.width = (blockBoundingBox[2].x - blockBoundingBox[0].x) + 'px';
        blockDiv.style.height = (blockBoundingBox[2].y - blockBoundingBox[0].y) + 'px';

        block.paragraphs.forEach((paragraph) => {
          const paragraphDiv = document.createElement('div');

          const paragraphBoundingBox = paragraph.boundingBox.vertices;
          paragraphDiv.style.position = 'absolute';
          paragraphDiv.style.left = paragraphBoundingBox[0].x + 'px';
          paragraphDiv.style.top = paragraphBoundingBox[0].y + 'px';
          paragraphDiv.style.width = (paragraphBoundingBox[2].x - paragraphBoundingBox[0].x) + 'px';
          paragraphDiv.style.height = (paragraphBoundingBox[2].y - paragraphBoundingBox[0].y) + 'px';

          paragraph.words.forEach((word) => {
            const wordDiv = document.createElement('div');

            const wordText = word.symbols.map((symbol) => symbol.text).join('');
            wordDiv.textContent = wordText;

            const wordBoundingBox = word.boundingBox.vertices;
            wordDiv.style.position = 'absolute';
            wordDiv.style.left = wordBoundingBox[0].x + 'px';
            wordDiv.style.top = wordBoundingBox[0].y + 'px';
            wordDiv.style.width = (wordBoundingBox[2].x - wordBoundingBox[0].x) + 'px';
            wordDiv.style.height = (wordBoundingBox[2].y - wordBoundingBox[0].y) + 'px';

            paragraphDiv.appendChild(wordDiv);
          });

          blockDiv.appendChild(paragraphDiv);
        });

        containerDiv.appendChild(blockDiv);
      });
    });

    containerDiv.style.border = '1px solid black';
    containerDiv.style.position = 'relative';
    containerDiv.style.width = fullTextAnnotation.pages[0].width + 'px';
    containerDiv.style.height = fullTextAnnotation.pages[0].height + 'px';

    return containerDiv;
  }

  const getSummary = (text) => {
    console.log("getSummary")
    $.ajax({
      url: 'https://api.openai.com/v1/completions',
      dataType: 'json',
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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"
      },
      data: JSON.stringify({
        "model": "text-davinci-003",
        "prompt": "Summarise the following text : " + text + "\n\n",
        "max_tokens": 1024,
        "temperature": 0
      }),
      type: 'post',
      success: function(data) {
        console.log(data);
        const toPresent = data.choices[0].text.replace(/\n/g, "<br />");
        $('#text-summary-area').html(toPresent)
      }
    });
  }
  
});