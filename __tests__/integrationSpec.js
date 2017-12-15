jest.dontMock('isomorphic-fetch');
var FetchHttpSource = require("../src/fetch-http-datasource");
var Falcor = require("falcor");
var express = require("express");
var fastFalcor = require("fast-falcor-app");

function startServer(){
var app = express();

var dataObject = {
  id:"john_doe",
  name: {
    first:"John",
    last:"Doe"
  },
  relatives:[
    {
      id:"jane_doe"
    }
  ]
};

var dataService = {getData:function({rawDataRoute, route, params, resolve, reject}){
  resolve(dataObject);
}}

var dataRoute = "users"

var dataObjectsToRoutes = [{dataRoute, dataObject, dataService, expires:-10}];
fastFalcor({dataObjectsToRoutes, expressApp:app, apiEndpointPath:"/api", falcorBrowserEndpoint: "/falcor.browser.js"})

return app.listen(8080);
}

test("test integration", () => {
  var server = startServer();
  var dataSource = new FetchHttpSource("http://127.0.0.1:8080/model.json", {
    onResponse: (url, status, requestHeaders, responseHeaders) => {
      expect(requestHeaders["I-am-a-header"]).toBe("I am a value");
      expect(responseHeaders["content-type"]).toBe("application/json; charset=utf-8")
    },
    headers:{"I-am-a-header": "I am a value"}
  });

  var model = new Falcor.Model({source: dataSource});
  return model.get("users.id").then((jsong) => {
    expect(jsong.json.users.id).toBe("john_doe");
    return model.get("users.id");
  }).then(() => {
    server.close();
  });
});

test("test with credentials integration", () => {
  var server = startServer();
  var dataSource = new FetchHttpSource("http://127.0.0.1:8080/model.json", {
    onResponse: (url, status, requestHeaders, responseHeaders) => {
      expect(requestHeaders["I-am-a-header"]).toBe("I am a value");
      expect(responseHeaders["content-type"]).toBe("application/json; charset=utf-8")
    },
    credentials: "include",
    headers:{"I-am-a-header": "I am a value"}
  });

  var model = new Falcor.Model({source: dataSource});
  return model.get("users.id").then((jsong) => {
    expect(jsong.json.users.id).toBe("john_doe");
    return model.get("users.id");
  }).then(() => {
    server.close();
  });
});

test("test 404", () => {
  var server = startServer();

  var dataSource = new FetchHttpSource("http://127.0.0.1:8080/model2.json", {
    onResponse: (url, status, requestHeaders, responseHeaders) => {
      expect(requestHeaders["I-am-a-header"]).toBe("I am a value");
      expect(responseHeaders["content-type"]).toBe("text/html; charset=utf-8")
    },
    headers:{"I-am-a-header": "I am a value"}
  });

  var model = new Falcor.Model({source: dataSource});

  return model.get("users.id").then(() => {}).catch((err) => {
    expect(err.message).toBe("Response code 404");
  }).then(() => {
    server.close();
  });

});
