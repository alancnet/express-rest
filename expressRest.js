var bodyParser = require('body-parser'),
    jsonBodyParser = bodyParser.json();

module.exports = function(app) {
    if (!app) throw new Error('Must provide express instance.');


    var rest = {
        get: get,
        put: put,
        post: post,
        'delete': delete_
    };
    var methods = ['GET', 'PUT', 'POST', 'DELETE'];
    var maxParams = 0;
    return rest;
    // reference; http://www.w3schools.com/tags/ref_httpmessages.asp


    function register(app, path, controller) {
        if (typeof controller.get === 'function') {
            // Register GET handlers
            var handler = anyHandler(controller.get.bind(controller));
            app.get(path, handler);
            var getPath = path;
            for (var i = 1; i < controller.get.length; i++) {
                getPath += '/:api' + i;
                app.get(getPath, handler);
            }
        }
    }

    function get(path, handler) {
        app.get(path, anyHandler(handler));
        return this;
    }
    function put(path, handler) {
        app.put(path, anyHandler(handler));
        return this;
    }
    function post(path, handler) {
        app.post(path, anyHandler(handler));
        return this;
    }
    function delete_(path, handler) {
        app.delete(path, anyHandler(handler));
        return this;
    }

    function anyHandler(apiHandler) {
        return function(req, res) {
            // parse JSON body
            jsonBodyParser(req, res, function() {
                var rest = restResponse(req, res);
                if (+req.headers['content-length'] && !req.is('json')) {
                    rest.unsupportedMediaType();
                } else {
                    apiHandler(req, rest);
                }
            })
        }
    }

    function restResponse(req, res) {
        var rest = {
            request: req,
            response: res,
            body: req.body,
            continue:                       status(100, 'Continue'),
            switchingProtocols:             status(101, 'Switching Protocols'),
            checkpoint:                     status(103, 'Checkpoint'),
            ok:                             status(200, 'OK'),
            created:                        status(201, 'Created', 'Location'),
            accepted:                       status(202, 'Accepted', 'Location'),
            nonAuthoritativeInformation:    status(203, 'Non Authoritative Information'),
            noContent:                      status(204, 'No Content'),
            resetContent:                   status(205, 'Reset Content'),
            partialContent:                 status(206, 'Partial Content'),
            multipleChoices:                status(300, 'Multiple Choices'),
            movedPermanently:               status(301, 'Moved Permanently', 'Location'),
            found:                          status(302, 'Found', 'Location'),
            seeOther:                       status(303, 'See Other'),
            notModified:                    status(304, 'Not Modified'),
            switchProxy:                    status(306, 'Switch Proxy'),
            temporaryRedirect:              status(307, 'Temporary Redirect', 'Location'),
            resumeIncomplete:               status(308, 'Resume Incomplete'),
            badRequest:                     status(400, 'Bad Request'),
            unauthorized:                   status(401, 'Unauthorized'),
            paymentRequired:                status(402, 'Payment Required'),
            forbidden:                      status(403, 'Forbidden'),
            notFound:                       status(404, 'Not Found'),
            methodNotAllowed:               status(405, 'Method Not Allowed'),
            notAcceptable:                  status(406, 'Not Acceptable'),
            proxyAuthenticationRequired:    status(407, 'Proxy Authentication Required'),
            requestTimeout:                 status(408, 'Request Timeout'),
            conflict:                       status(409, 'Conflict'),
            gone:                           status(410, 'Gone'),
            lengthRequired:                 status(411, 'Length Required'),
            preconditionFailed:             status(412, 'Precondition Failed'),
            requestEntityTooLarge:          status(413, 'Request Entity Too Large'),
            requestURITooLong:              status(414, 'Request URI Too Long'),
            unsupportedMediaType:           status(415, 'Unsupported Media Type'),
            requestedRangeNotSatisfiable:   status(416, 'Requested Range Not Satisfiable'),
            expectationFailed:              status(417, 'Expectation Failed'),
            internalServerError:            status(500, 'Internal Server Error'),
            notImplemented:                 status(501, 'Not Implemented'),
            badGateway:                     status(502, 'Bad Gateway'),
            serviceUnavailable:             status(503, 'Service Unavailable'),
            gatewayTimeout:                 status(504, 'Gateway Timeout'),
            httpVersionNotSupported:        status(505, 'HTTP Version Not Supported'),
            networkAuthenticationRequired:  status(511, 'Network Authentication Required')
        };

        // prototypical inheritance from res
        rest.__proto__ = res;

        return rest;

        function status(statusCode, message, header) {
            return function(data) {
                res.status(statusCode);
                if (header) {
                    // response data should go into a header, not body.
                    res.set(header, data);
                    data = arguments[1];
                }
                if (data) {
                    res.set('Content-Type', 'Application/json');
                    var json = JSON.stringify(data);
                    res.send(json);
                } else {
                    res.end();
                }
                return rest;
            }

        }

    }

};