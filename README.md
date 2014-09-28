express-rest
=========
![Build](https://api.travis-ci.org/alancnet/express-rest.svg)
![Downloads](http://img.shields.io/npm/dm/express-rest.svg) 
![Version](http://img.shields.io/npm/v/express-rest.svg) 
![License](http://img.shields.io/npm/l/express-rest.svg) 

Simplest possible REST implementation for Node / Express.

  - Uses familiar syntax for those who use express
  - Handles serialization and content-types *(XML coming soon)*
  - Embrace HTTP


Installation
--------------

```sh
npm install express-rest
```

Usage
-----

```javascript
var express = require('express'),
    expressRest = require('express-rest');

var app = express();
var rest = expressRest(app);

var records = [
    {value: 'Apple'},
    {value: 'Banana'}
];

rest.get('/api/food', function(req, rest) {
    rest.ok(records);
});

rest.get('/api/food/:id', function(req, rest) {
    var record = records[req.params.id];
    if (record) rest.ok(record);
    else rest.notFound();
});

rest.put('/api/food/:id', function(req, rest) {
    records[req.params.id] = req.body;
    return rest.accepted('/api/food/' + encodeURI(req.params.id));
});

rest.post('/api/food', function(req, rest) {
    records.push(req.body);
    rest.created('/api/food/' + (records.length - 1));
});

rest.delete('/api/food/:id', function(req, rest) {
    delete records[req.params.id];
    rest.gone();
})


app.listen();
```

Custom MIME Types
--------------------

```javascript
var express = require('express'),
    expressRest = require('express-rest');

var app = express();
var rest = expressRest(app, {
    serializers: {
        'text/yaml': {
            deserialize: function(req, rest, next) {
                req.body = object;
                next();
            },
            serialize: function(req, rest, next) {
                rest.send(buffer);
                next();
            }
        }
    }
});
```


### Response functions

Each HTTP response code is conveniently wrapped in an appropriately named function.
Depending on the status, the parameter can be **body** (state object to be returned),
**location** (URI to the resource), or **message** (string to describe an error).

|Function                       |#  |Status Text                    |Parameter
|-------------------------------|---|-------------------------------|---------|
|continue                       |100|Continue                       |         |
|switchingProtocols             |101|Switching Protocols            |         |
|checkpoint                     |103|Checkpoint                     |         |
|ok                             |200|OK                             |Body     |
|created                        |201|Created                        |Location |
|accepted                       |202|Accepted                       |Location |
|nonAuthoritativeInformation    |203|Non Authoritative Information  |Body     |
|noContent                      |204|No Content                     |         |
|resetContent                   |205|Reset Content                  |         |
|partialContent                 |206|Partial Content                |Body     |
|multipleChoices                |300|Multiple Choices               |Body     |
|movedPermanently               |301|Moved Permanently              |Location |
|found                          |302|Found                          |Location | 
|seeOther                       |303|See Other                      |Location |
|notModified                    |304|Not Modified                   |         |
|switchProxy                    |306|Switch Proxy                   |         |
|temporaryRedirect              |307|Temporary Redirect             |Location |
|resumeIncomplete               |308|Resume Incomplete              |Body     |
|badRequest                     |400|Bad Request                    |Message  |
|unauthorized                   |401|Unauthorized                   |Message  |
|paymentRequired                |402|Payment Required               |Message  |
|forbidden                      |403|Forbidden                      |Message  |
|notFound                       |404|Not Found                      |Message  |
|methodNotAllowed               |405|Method Not Allowed             |Message  |
|notAcceptable                  |406|Not Acceptable                 |Message  |
|proxyAuthenticationRequired    |407|Proxy Authentication Required  |Message  |
|requestTimeout                 |408|Request Timeout                |Message  |
|conflict                       |409|Conflict                       |Message  |
|gone                           |410|Gone                           |Message  |
|lengthRequired                 |411|Length Required                |Message  |
|preconditionFailed             |412|Precondition Failed            |Message  |
|requestEntityTooLarge          |413|Request Entity Too Large       |Message  |
|requestURITooLong              |414|Request URI Too Long           |Message  |
|unsupportedMediaType           |415|Unsupported Media Type         |Message  |
|requestedRangeNotSatisfiable   |416|Requested Range Not Satisfiable|Message  |
|expectationFailed              |417|Expectation Failed             |Message  |
|internalServerError            |500|Internal Server Error          |Message  |
|notImplemented                 |501|Not Implemented                |Message  |
|badGateway                     |502|Bad Gateway                    |Message  |
|serviceUnavailable             |503|Service Unavailable            |Message  |
|gatewayTimeout                 |504|Gateway Timeout                |Message  |
|httpVersionNotSupported        |505|HTTP Version Not Supported     |Message  |
|networkAuthenticationRequired  |511|Network Authentication Required|Message  |

