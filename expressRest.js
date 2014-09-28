var concatStream = require('concat-stream'),
    stringDecoder = require('string_decoder');

module.exports = function(app, options) {
    if (!app) throw new Error('Must provide express instance.');


    var rest = {
        get: get,
        put: put,
        post: post,
        'delete': delete_

    };
    var serializers = {
        json: jsonSerializer()
        // TODO: xml: xmlSerializer()
    };

    var methods = ['GET', 'PUT', 'POST', 'DELETE'];
    var maxParams = 0;
    init();
    return rest;
    // reference; http://www.w3schools.com/tags/ref_httpmessages.asp

    function init() {
        if (options) {
            if (options.serializers) {
                for (var key in options.serializers) {
                    serializers[key] = options.serializers[key];
                }
            }
        }
    }

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
            var contentType = req.headers['content-type'];
            if (contentType) {
                // Parse request body
                for (var key in serializers) {
                    if (req.is(key) || contentType == key) {
                        var ser = serializers[key];
                        try {
                            ser.deserialize(req, res, continueRequest);
                        } catch (ex) {
                            continueRequest(ex);
                        }
                        return;
                    }
                }
                // Could not find a parser.
                rest.unsupportedMediaType();
            } else {
                return continueRequest();
            }

            function continueRequest(err) {
                var rest = restResponse(req, res, continueResponse);
                if (err) {
                    res.set('Content-Type', 'text/plain');
                    res.status(500);
                    res.send(err.toString());
                } else {
                    apiHandler(req, rest);
                }
            }

            function continueResponse(statusCode, message, data) {
                res.status(statusCode);
                res.body = data;
                for (var key in serializers) {
                    if (req.accepts(key) || req.headers.accept == key) {
                        var ser = serializers[key];
                        try {
                            ser.serialize(req, res, finishResponse);
                        } catch (ex) {
                            finishResponse(ex);
                        }
                        return;
                    }
                }
                res.status(415);
                finishResponse();

                function finishResponse(err) {
                    if (err) {
                        // Serialization failed, revert to plain text.
                        try {
                            res.set('Content-Type', 'text/plain');
                            res.status(500);
                            res.send(err.toString());
                        } catch (ex) {
                            console.error('Unable to return exception: ', err, ex);
                        }
                    }
                    res.end();
                }

            }

        }
    }

    function restResponse(req, res, next) {
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
                if (header) {
                    // response data should go into a header, not body.
                    res.set(header, data);
                    data = arguments[1];
                }
                next(statusCode, message, data);
                return rest;
            }

        }

    }

    function jsonSerializer() {
        var ser = {
            serialize: serialize,
            deserialize: deserialize
        }
        return ser;

        function deserialize(req, res, next) {
            req.pipe(concatStream(function(data) {
                try {
                    var decoder = new stringDecoder.StringDecoder();
                    var json = decoder.write(data);
                    req.body = JSON.parse(json);
                    next();
                } catch (ex) {
                    next(ex);
                }
            }));
        }

        function serialize(req, res, next) {
            try {
                res.set('Content-Type', 'application/json');
                var json = JSON.stringify(res.body);
                res.send(json);
                next();
            } catch (ex) {
                next(ex);
            }
        }
    }

    function xmlSerializer() {
        var ser = {
            serialize: serialize,
            deserialize: deserialize
        }
        return ser;

        function deserialize(req, rest, next) {
            req.pipe(concatStream(function(data) {
                var decoder = new stringDecoder.StringDecoder();
                var xml = decoder.write(data);
                //TODO: req.body = XML.parse(xml);
                next();
            }));
        }

        function serialize(req, rest, next) {
            res.set('Content-Type', 'application/xml');
            //TODO: res.send(XML.stringify(res.body));
            next();
        }
    }
};
