var request = require("../src/request");

jest.mock("isomorphic-fetch");

function convertObsToPromise(obs){
  return new Promise((resolve, reject) => {
    obs.subscribe((data) => {
      resolve(data);
    }, (err) => {
      reject(err);
    });
  });
}

test('request works', () => {
  return convertObsToPromise(
    request("GET", {url:"simple-ok.json"}, {})
  ).then((data) => {
    expect(data.hello).toBe("world");
  });
});

test('request rejects on 404', () => {
  return convertObsToPromise(
    request("GET", {url:"simple-404.json"}, {})
  ).catch((err) => {
    expect(err.message).toBe("Response code 404");
    throw "OK";
  }).then((data) => {
    throw new Error("Was suppose to reject on 404 but did not");
  }).catch((e) => {
    expect(e).toBe("OK");
  })
});

test('response headers can be collected', () => {
  var onResponseValues = null;
  function onResponse(...args){
    onResponseValues = args;
  }

  return convertObsToPromise(
    request("GET", {url:"simple-response-headers.json", headers:{"requestHeaderKey":"requestHeaderValue"}, onResponse}, {})
  ).then((data) => {
    expect(data.hello).toBe("world");
    expect(onResponseValues[0]).toBe("simple-response-headers.json");
    expect(onResponseValues[1]).toBe(200);
    expect(onResponseValues[2]).toMatchObject({"requestHeaderKey": "requestHeaderValue"});
    expect(onResponseValues[3]).toMatchObject({"testHeaderKey":"testHeaderValue"});
    expect(onResponseValues[4]).toMatchObject({hello:"world"});
  });
});

test('response headers can be collected even on 404', () => {
  var onResponseValues = null;
  function onResponse(...args){
    onResponseValues = args;
  }

  return convertObsToPromise(
    request("GET", {url:"simple-response-headers-404.json", headers:{"requestHeaderKey":"requestHeaderValue"}, onResponse}, {})
  ).catch((err) => {
    expect(err.message).toBe("Response code 404");
    expect(onResponseValues[0]).toBe("simple-response-headers-404.json");
    expect(onResponseValues[1]).toBe(404);
    expect(onResponseValues[2]).toMatchObject({"requestHeaderKey": "requestHeaderValue"});
    expect(onResponseValues[3]).toMatchObject({"testHeaderKey":"testHeaderValue"});
    throw "OK";
  }).then((data) => {
    throw new Error("Was suppose to reject on 404 but did not");
  }).catch((e) => {
    expect(e).toBe("OK");
  });
});

test('response headers can be collected with retry', () => {
  var onResponseValues = null;
  function onResponse(...args){
    onResponseValues = args;
  }

  return convertObsToPromise(
    request("GET", {url:"simple-response-headers.json", retry:1, headers:{"requestHeaderKey":"requestHeaderValue"}, onResponse}, {})
  ).then((data) => {
    expect(data.hello).toBe("world");
    expect(onResponseValues[0]).toBe("simple-response-headers.json");
    expect(onResponseValues[1]).toBe(200);
    expect(onResponseValues[2]).toMatchObject({"requestHeaderKey": "requestHeaderValue"});
    expect(onResponseValues[3]).toMatchObject({"testHeaderKey":"testHeaderValue"});
    expect(onResponseValues[4]).toMatchObject({hello:"world"});
  });
});

test('response headers can be collected even on 404 with retry', () => {
  var onResponseValues = null;
  function onResponse(...args){
    onResponseValues = args;
  }

  return convertObsToPromise(
    request("GET", {url:"simple-response-headers-404.json", retry:1, headers:{"requestHeaderKey":"requestHeaderValue"}, onResponse}, {})
  ).catch((err) => {
    expect(err.message).toBe("Response code 404");
    expect(onResponseValues[0]).toBe("simple-response-headers-404.json");
    expect(onResponseValues[1]).toBe(404);
    expect(onResponseValues[2]).toMatchObject({"requestHeaderKey": "requestHeaderValue"});
    expect(onResponseValues[3]).toMatchObject({"testHeaderKey":"testHeaderValue"});
    throw "OK";
  }).then((data) => {
    throw new Error("Was suppose to reject on 404 but did not");
  }).catch((e) => {
    expect(e).toBe("OK");
  });
});
