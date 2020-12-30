const CloudmersiveConvertApiClient = require("cloudmersive-convert-api-client");
const XLSX = require("xlsx");

const defaultClient = CloudmersiveConvertApiClient.ApiClient.instance;
const { Apikey } = defaultClient.authentications;
Apikey.apiKey = "bfa2fb0f-085f-4d59-9722-f14d8d6a612f";

const converter = (inputFile) => {
  const apiInstance = new CloudmersiveConvertApiClient.ConvertDocumentApi();

  // const inputFile = "/path/to/file.txt"; // File | Input file to perform the operation on.

  const opts = {
    outputEncoding: "UTF-8" // String | Optional, set the output text encoding for the result; possible values are UTF-8, ASCII and UTF-32.  Default is UTF-8.
  };

  const callback = function (error, data, response) {
    if (error) {
    //   console.error(error);
      console.log("unable to convert document to a csv file");
    } else {
      console.log(`API called successfully. Returned data: ${data}`);
      // fs.writeFileSync(path.join(__dirname, "/../public/uploads/test.csv"), data);
    }
  };
  return apiInstance.convertDocumentXlsxToCsv(inputFile, opts, callback);
};

const toCsv = (inputFilename, outputFilename) => {
  const workBook = XLSX.readFile(inputFilename);
  console.log("got here", workBook.Strings);
  XLSX.writeFile(workBook, outputFilename, { bookType: "csv", blankrows: false });
};

module.exports = { converter, toCsv };
// const http = require('http');
// const fs = require('fs');

// const file = fs.createWriteStream("file.jpg");
// const request = http.get("http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg", function(response) {
//   response.pipe(file);
// });