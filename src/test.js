const { StreamParser } = require("@json2csv/plainjs");

const jsonParser = (obj) => {
   const parser = new StreamParser();

   let csv = "";

   // Listen for data events to accumulate the CSV
   parser.onData = (chunk) => (csv += chunk.toString());

   // Listen for the end event
   parser.onEnd = () => {
    fs.writeFileSync('output.csv', csv);
   };

   // Listen for errors
   parser.onError = (err) => {
      console.error("Error:", err);
   };


   // Convert the array of JSON objects to CSV
   const json = JSON.stringify(obj);
   parser.write(json);

   // Indicate the end of data
   parser.end();
   return csv
};

module.exports = {jsonParser}