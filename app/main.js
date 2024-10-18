const process = require("process");
const util = require("util");

// Examples:
// - decodeBencode("5:hello") -> "hello"
// - decodeBencode("10:hello12345") -> "hello12345"
let skipPos = -1;
function chkString(bencodedValue){
  const firstColonIndex = bencodedValue.indexOf(":");
  if (firstColonIndex === -1) {
    throw new Error("Invalid encoded value");
  }
  else
    return bencodedValue.slice(firstColonIndex+1, firstColonIndex+1 + +bencodedValue.slice(0,firstColonIndex));
}

function chkInterger(bencodedValue){
  let firstE = bencodedValue.indexOf('e')
  if(firstE === -1){
    throw new Error("Invalid encoded value");
  }
  let intergerValue = bencodedValue.slice(1, firstE);
  if (isNaN(intergerValue)) {
    throw new Error("Invalid encoded value");
  }
  else
  return +intergerValue;
}

function chkList(bencodedValue){
  let resultList = [];
  let start = 0, end = bencodedValue.length;
  while(start < end && bencodedValue[start] != 'e'){
    if(!isNaN(bencodedValue[start])){
      resultList.push(chkString(bencodedValue.slice(start)));
      let vals = bencodedValue.slice(start, bencodedValue.indexOf(":", start));        
      start = start + Number(vals) + vals.length + 1;
    }
    else if(bencodedValue[start] == 'i'){
      resultList.push(chkInterger(bencodedValue.slice(start)))
      let firstE = bencodedValue.indexOf('e', start);
      start = firstE + 1;
    }
    else if(bencodedValue[start] == 'l'){
      resultList.push(chkList(bencodedValue.slice(start+1)));
      start = start + skipPos + 1;
    }
    else{
      throw new Error("Invalid encoded value");
    }
  }
  skipPos = start + 1;
  return resultList;
}

function decodeBencode(bencodedValue) {
  // Check if the first character is a digit
  if(!isNaN(bencodedValue[0])){
    return chkString(bencodedValue);
  }
  else if (bencodedValue[0] == 'i'){
    return chkInterger(bencodedValue.slice(1));
  } 
  else if(bencodedValue[0] == 'l'){
    return chkList(bencodedValue.slice(1));
  }
  else {
    throw new Error("Only strings are supported at the moment");
  }
}

function main() {
  const command = process.argv[2];

  // You can use print statements as follows for debugging, they'll be visible when running tests.
  // console.log("Logs from your program will appear here!");

  // Uncomment this block to pass the first stage
  if (command === "decode") {
    const bencodedValue = process.argv[3];
  
  //   // In JavaScript, there's no need to manually convert bytes to string for printing
  //   // because JS doesn't distinguish between bytes and strings in the same way Python does.
    console.log(JSON.stringify(decodeBencode(bencodedValue)));
  } else {
    throw new Error(`Unknown command ${command}`);
  }
}

main();
