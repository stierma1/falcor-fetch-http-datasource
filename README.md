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

JWT
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
  withCredentials: true
});
// server must include the header `Access-Control-Allow-Credentials: true`
```
CORS
```javascript
var source = new FetchDataSource('/model.json', {
  crossDomain: true
});
```
or you might want to pass it to constructor as your global AppSource
