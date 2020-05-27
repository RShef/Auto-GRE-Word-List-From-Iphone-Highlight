/*
* addSy gets a phrase and returns a list of it's synonyms from the webster dictonary.
*/

function addSy(phrase) {
  // Sending my request to the dictonary api. My real keys are ommited.
  var base_url = "https://www.dictionaryapi.com/api/v3/references/thesaurus/json/";
  phrase = encodeURI(phrase);
  var url = (base_url.concat(phrase)).concat("?key=exampleKey");
  var response = UrlFetchApp.fetch(url);
  var responseObj = JSON.parse(response);

  // Find the synonyms of each word sense in the json response.
  var syss = []
  var i;
  var le;
  if (typeof(responseObj[0]) != "undefined") {
    for (le = 0; le < responseObj[0]["meta"]["syns"].length; le++) {
      if (typeof(responseObj[0]["meta"]["syns"][le]) != "undefined") {
        for (i = 0; i < responseObj[0]["meta"]["syns"][le].length && i < 3; i++) {
          syss.push(responseObj[0]["meta"]["syns"][le][i]);
          console.log(i, le, syss)
        }
      }
    }
  } else {
    syss.push("**NO SYN FOUND**")
  }

  // Nicely format the output.
  return syss.join(",  ") + '.';

}


/*
* addEx gets a phrase and returns a list of usage examples from the webster dictonary.
*/

function addEx(phrase) {
  // Sending my request to the dictonary api. My real keys are ommited.
  var base_url = "https://www.dictionaryapi.com/api/v3/references/collegiate/json/";
  phrase = encodeURI(phrase);
  var url = (base_url.concat(phrase)).concat("?key=exampleKey")
  var response = UrlFetchApp.fetch(url);
  var responseObj = JSON.parse(response);

  // Finding the usages of each word sense in the json response - a sentance or phrase.
  var syss = []
  var i;
  var j;
  var definition = "";
  for (i = 0; i < responseObj[0]["def"][0]["sseq"].length; i++) {
    for (j = 0; j < responseObj[0]["def"][0]["sseq"][i].length; j++) {
      if (typeof(responseObj[0]["def"][0]["sseq"][i][j][1]["dt"]) != "undefined") {
        if (typeof(responseObj[0]["def"][0]["sseq"][i][j][1]["dt"][1]) != "undefined") {
          definition = responseObj[0]["def"][0]["sseq"][i][j][1]["dt"][1][1][0]["t"];
          definition = definition.replace(/{\/wi}|{wi}/g, function(x) {
            return ("");
          });
          syss.push(definition);
        }
      }
    }
  }
  // Nicely format the output.
  return (syss.join(";\n\n"));

}




/*
* addDefinition gets a phrase and returns it's definition from the webster dictonary.
*/
function addDefinition(phrase) {

  // Finding the definition of each word-sense in the json response.
  var base_url = "https://www.dictionaryapi.com/api/v3/references/collegiate/json/";
  phrase = encodeURI(phrase);
  var url = (base_url.concat(phrase)).concat("?key=exampleKey")
  var response = UrlFetchApp.fetch(url);
  var responseObj = JSON.parse(response);

  // Find the definition of each word-sense in the json response.
  var syss = []
  var i;
  var sy;
  var le;
  if (typeof(responseObj[0]) != "undefined") {
    syss.length = 0;
    syss.push(responseObj[0]["shortdef"]);
    syss = syss.join();
    syss = syss.split(",");
  } else {
    syss.push("**NO SYN FOUND**")
  }
  // Nicely format the output.
  return syss.join(";\n") + '.';
}


/*
* alreadyExists checkes if a phrase was already added, if so, does not add it again.
*/

function alreadyExists(sheet, word, latestRow) {
  var lastRowIndex = sheet.getLastRow();
  var words = sheet.getRange(5, 3, lastRowIndex).getValues();
  var wordsFlat = words.map(function(row) {
    return row[0];
  });

  indexOf = wordsFlat.indexOf(word) + 5;
  Logger.log(latestRow + ", " + indexOf);
  if (indexOf != -1 && indexOf != latestRow) {
    return true;
  }
  return false;
}

/*
* onNewRow is a trigger function that is called when a new row
* is added to the spread sheet.
* The function take the pharse added and assigins it's definition, synonyms,
* line number and usages - to the appropriate cells of the new row.
*/

function onNewRow(e) {
  // Get the relevent spreadsheet.
  var sheet = SpreadsheetApp.getActiveSheet();
  if (e.changeType == 'INSERT_ROW') {
    // Get index of row inserted
    var row = sheet.getLastRow();
    // Get the phrase inserted
    var range = sheet.getRange(row, 3);
    var phrase = range.getValue();

    // Dont add if allrady in the sheet.
    if (alreadyExists(sheet, phrase, row)) {
      sheet.deleteRow(row);
      Logger.log(phrase + " already exists!");
    } else {
      // Where we update the sheet.
      sheet.getRange(row, 1).setValue(sheet.getRange(row - 1, 1).getValue() + 1);
      sheet.getRange(row, 5).setValue(addDefinition(phrase));
      sheet.getRange(row, 4).setValue(addSy(phrase));
      sheet.getRange(row, 6).setValue(addEx(phrase));
      Logger.log(phrase + " added!");
    }
  }
}
