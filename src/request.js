var fetch = require("isomorphic-fetch");
var {mergeResponses, breakQueryIntoSubQueries, getQueryObj, buildUrl} = require("./utils");
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

//Will recurse on error of the produced retried call
function onErrorClosure(observer, retries, method, options, context){
  return function(err){
    if(retries <= 0){
      observer.onError(err);
      return;
    }
    var retry = requestTry(method, options, context);
    retry.subscribe((data) => {
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

    var queryMap = getQueryObj(config.url);
    var { paths } = queryMap;

    try {
      var pathObjs = JSON.parse(paths);
    } catch (err) {
      pathObjs = [];
    }
 
    var subQueries = breakQueryIntoSubQueries(pathObjs, options.maxQuerySize || 7000);
    var configBaseUrl = config.url.split("?")[0];
    var fetches = [];
    for(var i in subQueries){
      var subQuery = subQueries[i];
      paths = JSON.stringify(subQuery);
      const newUrl = buildUrl(
        configBaseUrl,
        Object.assign({}, queryMap, {
          paths: subQuery.length ? paths : undefined 
        })
      );

      var fetchProm = fetch(newUrl, init)
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
              return Promise.resolve(
                options.onResponse(config.url, response.status, init.headers, responseHeaders, json, options)
              ).then(() => {
                //Falcor can only receive json at the moment
                return json;
              });
            });
          } else {
            return Promise.resolve(options.onResponse(config.url, response.status, init.headers, responseHeaders, undefined, options))
              .then(() => {
                throw new Error('Response code ' + response.status);
              })
          }
        })

        fetches.push(fetchProm);
    }

    Promise.all(fetches)
      .then((values) => {
        var mergedValue = values.reduce((reduced, value) => {
          return mergeResponses(value, reduced)
        }, {});
        observer.onNext(mergedValue);
        observer.onCompleted();
      })
      .catch((err) => {
        observer.onError(err);
      })
    /*
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
            return Promise.resolve(
              options.onResponse(config.url, response.status, init.headers, responseHeaders, json, options)
            ).then(() => {
              //Falcor can only receive json at the moment
              observer.onNext(json);
              observer.onCompleted();
            });
          });
        } else {
          return Promise.resolve(options.onResponse(config.url, response.status, init.headers, responseHeaders, undefined, options))
            .then(() => {
              observer.onError(new Error('Response code ' + response.status))
            })
        }
      })
      .catch((err) => {
        observer.onError(err);
      });*/

    return function dispose() {
      //May add abort to fetch
    };
  });

}


module.exports = request;
