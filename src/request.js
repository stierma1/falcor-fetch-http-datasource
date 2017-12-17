var fetch = require("isomorphic-fetch");
var hasOwnProp = Object.prototype.hasOwnProperty;

var noop = function() {};

function Observable() {}

Observable.create = function(subscribe) {
  var o = new Observable();

  o.subscribe = function(onNext, onError, onCompleted) {

    var observer;
    var disposable;

    if (typeof onNext === 'function') {
        observer = {
            onNext: onNext,
            onError: (onError || noop),
            onCompleted: (onCompleted || noop)
        };
    } else {
        observer = onNext;
    }

    disposable = subscribe(observer);

    if (typeof disposable === 'function') {
      return {
        dispose: disposable
      };
    } else {
      return disposable;
    }
  };

  return o;
};

//Will recurse on error of the produced subscriber
function onErrorClosure(observer, retries, method, options, context){
  return function(err){
    if(retries <= 0){
      observer.onError(err);
      return;
    }
    var retry = requestTry(method, options, context);
    retry.subscribe(() => {
        observer.onNext(data);
        observer.onCompleted();
      }, onErrorClosure(observer, retries - 1, method, options, context),
      () => {}
    );

  }
}

function request(method, options, context){

  if(options.retry === undefined || options.retry === 0){
    return requestTry(method, options, context);
  }
  var retries = options.retry;
  var tryObs = requestTry(method, options, context);
  var returnObs = Observable.create(function(observer){
      tryObs.subscribe((data) => {
        observer.onNext(data);
        observer.onCompleted();
      }, onErrorClosure(observer, retries, method, options, context), () => {
      });
  });
  return returnObs;
}

function requestTry(method, options, context) {
  return Observable.create(function requestObserver(observer) {
    if(!options.onResponse){
      options.onResponse = noop;
    }
    var config = {
      method: method || 'GET',
      crossDomain: false,
      async: true,
      headers: {},
      responseType: 'json'
    };

    var
      headers,
      header,
      prop;

    for (prop in options) {
      if (hasOwnProp.call(options, prop)) {
        config[prop] = options[prop];
      }
    }

    // allow the user to mutate the config open
    if (context.onBeforeRequest != null) {
      context.onBeforeRequest(config);
    }

    var url = "";
    var init = {};
    if(config.crossDomain){
      init.mode = "cors";
    }
    init.method = config.method;
    init.headers = config.headers || {};
    init.credentials = config.credentials || "omit";
    init.agent = config.agent || undefined;
    init.timeout = config.timeout || undefined;

    if(config.data){
      init.body = config.data;
    }

    fetch(config.url, init)
      .then((response) => {
        let responseHeaders = {};
        //Newer way of getting all headers
        if(response.headers.entries){
          for(var pair of response.headers.entries()){
            var key = pair[0];
            var value = pair[1];
            responseHeaders[key] = value;
          }
        } else {
          response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
          });
        }

        if(response.ok){
          return Promise.resolve(response.json()).then((json) => {
            options.onResponse( config.url, response.status, init.headers, responseHeaders, json);
            //Falcor can only receive json at the moment
            observer.onNext(json);
            observer.onCompleted();
          });
        } else {
          options.onResponse(config.url, response.status, init.headers, responseHeaders);
          observer.onError(new Error('Response code ' + response.status))
        }
      })
      .catch((err) => {
        observer.onError(err);
      });

    return function dispose() {
      //May add abort to fetch
    };
  });

}

module.exports = request;
