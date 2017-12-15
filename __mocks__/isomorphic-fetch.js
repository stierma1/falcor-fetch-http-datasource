var fs = require("fs");
var path = require("path");


function fetch(url, init){
  return new Promise((resolve, reject) => {
    try{
    var response = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "__mockData__", url), "utf8"));
    if(response.headers.entries){
      let entries = response.headers.entries;
      response.headers.entries = () => {return entries};
    }
    if(response.json){
      let json = response.json;
      response.json = function(){return Promise.resolve(JSON.parse(json))};
    }

    resolve(response);
  } catch(e){
    reject(e);
  }
  });
}

module.exports = fetch;
