# falcor-fetch-http-datasource
Falcor Http DataSource using isomorphic fetch

## Install
```bash
npm install falcor-fetch-http-datasource
```

## Usage

Minimalistic ES6 example, a quick dirty setup

```es6
import falcor from 'falcor';
import FetchDataSource from 'falcor-fetch-http-datasource';

var model = new falcor.Model({
  source: new FetchDataSource('/model.json')
});
```
If you need some additional info for your global HTTP requests consider something like

Headers
```javascript
var source = new FetchDataSource('/model.json', {
  headers: {
    'Authorization': `bearer ' + token`
  }
});
```
Cookies
```javascript
var source = new FetchDataSource('/model.json', {
  credentials: 'include'
});
// server must include the header `Access-Control-Allow-Credentials: true`
```
CORS
```javascript
var source = new FetchDataSource('/model.json', {
  crossDomain: true
});
```
Agent (Node only)
```javascript
var source = new FetchDataSource('/model.json', {
  agent: {...agentObject}
});
```
Timeout
```javascript
var source = new FetchDataSource('/model.json', {
  timeout: 5000
});
```
Retry
```javascript
//Retry will try again if response status was not in 200-299 range
var source = new FetchDataSource('/model.json', {
  retry:1
});

```
OnResponse
```javascript
var onResponse = function(url, statusCode, requestHeaders, responseHeaders, jsonBody, options){
  //json body will only be returned if statusCode is 200-299
  console.log(url, statusCode, requestHeaders, responseHeaders, jsonBody, options);
  //You can update options for subsequent retry calls  
}

var source = new FetchDataSource('/model.json', {
  onResponse:onResponse
});

```

MaxQuerySize
```javascript
//Will split the query based on how many characters are in the url.  If its over maxQuerySize the multiple requests will be made to the server by splitting up the query into smaller subqueries.
// This should happen transparently and should not have any impact on the output value.
var source = new FetchDataSource('/model.json', {
  maxQuerySize:1 //Default is 7000 characters
});

```
