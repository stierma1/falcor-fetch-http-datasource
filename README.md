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
var onResponse = function(url, statusCode, requestHeaders, responseHeaders, jsonBody){
  //json body will only be returned if statusCode is 200-299
  console.log(url, statusCode, requestHeaders, responseHeaders, jsonBody);
}
var source = new FetchDataSource('/model.json', {
  onResponse:onResponse
});

```
