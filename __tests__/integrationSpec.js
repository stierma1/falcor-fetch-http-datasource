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

let server;

beforeEach(() => {
  server = startServer();
});

afterEach(() => {
  server.close();
});

test("test integration", () => {
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
  });
});

test("test integration with query split", () => {
  var dataSource = new FetchHttpSource("http://127.0.0.1:8080/model.json", {
    onResponse: (url, status, requestHeaders, responseHeaders) => {
      expect(requestHeaders["I-am-a-header"]).toBe("I am a value");
      expect(responseHeaders["content-type"]).toBe("application/json; charset=utf-8")
    },
    maxQuerySize:1,
    headers:{"I-am-a-header": "I am a value"}
  });

  var model = new Falcor.Model({source: dataSource});
  return model.get("users.id", "users.name.first", "users.name.last").then((jsong) => {
    expect(jsong.json.users.id).toBe("john_doe");
    expect(jsong.json.users.name.first).toBe("John");
    expect(jsong.json.users.name.last).toBe("Doe");
  });
});

test("test with credentials integration", () => {
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
  });
});

test("test 404", () => {
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
  });

});

test("test integration with retry", () => {
  var responsesReceived = 0;
  var dataSource = new FetchHttpSource("http://127.0.0.1:8080/model.json", {
    onResponse: (url, status, requestHeaders, responseHeaders) => {
      responsesReceived++;
      expect(requestHeaders["I-am-a-header"]).toBe("I am a value");
      expect(responseHeaders["content-type"]).toBe("application/json; charset=utf-8")
    },
    headers:{"I-am-a-header": "I am a value"}
  });

  var model = new Falcor.Model({source: dataSource});
  return model.get("users.id").then((jsong) => {
    expect(jsong.json.users.id).toBe("john_doe");
    expect(responsesReceived).toBe(1);
  });
});

test("test 404 with retry", () => {
  var responsesReceived = 0;
  var dataSource = new FetchHttpSource("http://127.0.0.1:8080/model2.json", {
    retry:3,
    onResponse: (url, status, requestHeaders, responseHeaders) => {
      responsesReceived++;
      expect(requestHeaders["I-am-a-header"]).toBe("I am a value");
      expect(responseHeaders["content-type"]).toBe("text/html; charset=utf-8")
    },
    headers:{"I-am-a-header": "I am a value"}
  });

  var model = new Falcor.Model({source: dataSource});

  return model.get("users.id").then(() => {}).catch((err) => {
    expect(responsesReceived).toBe(4);
    expect(err.message).toBe("Response code 404");
  });

});

test("passing previewTimestamp", () => {
  var responsesReceived = 0;
  var dataSource = new FetchHttpSource("http://127.0.0.1:8080/model.json?previewTimestamp=test", {
    onResponse: (url, status, requestHeaders, responseHeaders) => {
      responsesReceived++;
      expect(url).toBe('http://127.0.0.1:8080/model.json?previewTimestamp=test&paths=%5B%5B%22users%22%2C%22id%22%5D%5D&method=get')
    },
  });

  var model = new Falcor.Model({source: dataSource});
  return model.get("users.id").then((jsong) => {
    expect(jsong.json.users.id).toBe("john_doe");
    expect(responsesReceived).toBe(1);
  });
});