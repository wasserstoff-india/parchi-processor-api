import { processDocx, processImage, processPdf, processXlsx } from "../service/processtext.js";

export const ProcessFile=async(req,res)=>{
try {
  const  {file}  = req.body;
  const fileType = file.split('.').pop();
  console.log(file);
  switch (fileType) {
    case 'pdf': 
      var text=await processPdf(file)
      res.status(200).send({ success: true ,text});
      break;
      case 'csv':
      case 'xlsx':   
      var text=await processXlsx(file)
      res.status(200).send({ success: true ,text});
      break;
    case "doc":
    case 'docx':
      var text=await processDocx(file)
      res.status(200).send({ success: true,text});
      break;
    case 'jpeg':
    case 'jpg':
    case 'png':
      var text= await processImage(file)
      res.status(200).send({ success: true,text });
      break;
    default:
      console.log('file type not supported')
      res.json({ success: false });
      break;
  }
} catch (error) {
  console.log(error)
}
}

