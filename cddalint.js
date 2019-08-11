/***
Github: https://github.com/ampersand55/cddaJsonLint/
Dependencies: https://www.npmjs.com/package/node-fetch
Usage: node cddalint.js file.json
 ***/
const fs = require('fs');
const fetch = require('node-fetch');

if (process.argv.length !== 3) {
  console.log('usage: node', process.argv[1], 'file.json');
  process.exit();
}

const jsonFile = process.argv[2];

if (!jsonFile.endsWith('.json')) {
  console.log(jsonFile, 'does not end with ".json"');
  process.exit();
}

if (!fs.existsSync(jsonFile)) {
  console.log(jsonFile, 'does not exist');
  process.exit();
}

let originalBody = '';

fs.readFile(jsonFile, 'utf8', fetchLinter);

function fetchLinter(error, body) {
  if (error) {
    throw error;
  }

  JSON.parse(body); // to test if json file is properly formatted;
  
  originalBody = body;

  fetch('http://dev.narc.ro/tools/format/json_formatter.cgi', {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'data=' + encodeURIComponent(body)
  })
  .then(res => res.text())
  .then(saveFile);
}

function saveFile(formattedJSON) {

  formattedJSON = formattedJSON.replace(/\n/g, '\r\n');
  
  if (formattedJSON === originalBody) {
    console.log(jsonFile, 'is already properly linted');
    return;
  }

  fs.writeFile(jsonFile, formattedJSON, error => {
    if (error) {
      throw error;
    }
    console.log(jsonFile, 'has been linted and saved successfully');
  });
}
