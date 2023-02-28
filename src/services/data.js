import * as d3 from "d3";

export function getParsedData(input) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const data = JSON.parse(text);
      resolve(data);
    };
    reader.readAsText(input);
  });
}

export function createDataObject(objArr) {
  const data_key = "data";
  const offset_key = "Offsets";

  let _ = require("lodash");
  let objArrCloned = _.cloneDeep(objArr);
  objArrCloned["incomplete"] = [];

  for (let i = 0; i < objArrCloned[data_key].length; i++) {
    if (offset_key in objArrCloned[data_key][i]) {
      if (objArrCloned[data_key][i][offset_key][0] === -1) {
        objArrCloned["incomplete"].push(i);
      }
    } else {
      objArrCloned[data_key][i][offset_key] = [-1, -1];
      objArrCloned["incomplete"].push(i);
    }
    objArrCloned[data_key][i]["id"] = i;
  }
  return objArrCloned;
}

export function downloadData(dataState) {
  let json = JSON.stringify(dataState.dataObject);
  var a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([json], { type: "application/json" }));
  a.download = `${dataState.fileName}_updated`;
  a.click();
  document.getElementById("a");
}
