const process = require("process");
const util = require("util");

let skips = -1;
// strings
function chkString(bencodedValue, st){
  const firstColonIndex = bencodedValue.indexOf(":", st);
  if (firstColonIndex === -1) {
    throw new Error("Invalid encoded value");
  }
  const startingNum = bencodedValue.slice(st,firstColonIndex);
  if(isNaN(startingNum)){
    throw new Error("Invalid encoded value");
  }
  let res = bencodedValue.slice(firstColonIndex+1, firstColonIndex+1 + +startingNum);
  skips = res.length + startingNum.length + 1;
  return res;
}

// integers
function chkInteger(bencodedValue, st){
  let firstE = bencodedValue.indexOf('e', st);
  if(firstE === -1){
    throw new Error("Invalid encoded value");
  }
  let intergerValue = bencodedValue.slice(st+1, firstE);
  if (isNaN(intergerValue)) {
    throw new Error("Invalid encoded value");
  }
  skips = intergerValue.length + 2;  
  return +intergerValue;
}

// lists
function chkList(bencodedValue, st){
  let resultList = [];
  let start = st+1, end = bencodedValue.length;
  while(start < end && bencodedValue[start] != 'e'){
    if(!isNaN(bencodedValue[start])){
      resultList.push(chkString(bencodedValue, start));
      start += skips;
    }
    else if(bencodedValue[start] == 'i'){
      resultList.push(chkInteger(bencodedValue, start));
      start += skips;
    }
    else if(bencodedValue[start] == 'l'){
      resultList.push(chkList(bencodedValue, start));
      start += skips;
    }
    else{
      throw new Error("Invalid encoded value");
    }
  }
  skips = start - st + 1;
  return resultList;
}

// dicts
function chkDict(bencodedValue, st){
  let resultDict = {};
  let key = null;
  let getKey = true;
  let start = st+1, end = bencodedValue.length;
  while(start < end && bencodedValue[start] != 'e'){
    let val = null;
    if(!isNaN(bencodedValue[start])){
      val = chkString(bencodedValue, start);
      start += skips;
    }
    else if(bencodedValue[start] == 'i'){
      val = chkInteger(bencodedValue, start);
      start += skips;
    }
    else if(bencodedValue[start] == 'l'){
      val = chkList(bencodedValue, start);
      start += skips;
    }
    else if(bencodedValue[start] == 'd'){
      val = chkDict(bencodedValue, start);
      start += skips;
    }
    else{
      throw new Error("Invalid encoded value");
    }
    if(getKey){
      key = val;
      getKey = false;
    }
    else{
      resultDict[key] = val;
      getKey = true;
    }
  }
  skips = start - st + 1;
  return resultDict;
}

// decode
function decodeBencode(bencodedValue) {
  if(!isNaN(bencodedValue[0])){
    return chkString(bencodedValue, 0);
  }
  else if (bencodedValue[0] == 'i'){
    return chkInteger(bencodedValue, 0);
  } 
  else if(bencodedValue[0] == 'l'){
    return chkList(bencodedValue, 0);
  }
  else if(bencodedValue[0] == 'd'){
    return chkDict(bencodedValue, 0);
  }
  else {
    throw new Error("Only strings are supported at the moment");
  }
}

// main
function main() {
  const command = process.argv[2];
  if (command === "decode") {
    const bencodedValue = process.argv[3];
    console.log(JSON.stringify(decodeBencode(bencodedValue)));
  } else {
    throw new Error(`Unknown command ${command}`);
  }
}

main();
