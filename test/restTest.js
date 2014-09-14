var express = require('express'),
    expressRest = require('../expressRest'),
    mockExpress = require('nodeunit-express');

module.exports = {
    'Constructor requires express': function(test) {
        test.throws(function() {
            expressRest();
        });
        test.doesNotThrow(function() {
            expressRest({});
        });
        test.done();
    },
    'Express server': {
        setUp: function(callback) {
            var app = express();
            expressRest(app)
                .get('/api/entity', function(req, rest) {
                    rest.ok([{id: 1, pass: true}]);
                })
                .get('/api/entity/:id', function(req, rest) {
                    rest.ok({id: req.params.id, pass: true});
                })
                .put('/api/entity/:id', function(req, rest) {
                    rest.accepted('/api/entity/' + req.body.id);
                })
                .post('/api/entity', function(req, rest) {
                    rest.created('/api/entity/' + req.body.id, req.body);
                });
            this.request = mockExpress(app);
            callback();
        },
        'GET -> ok(list)': function(test) {

            this.request.get('/api/entity')
                .set('accept', 'application/json')
                .expect(function(response) {
                    test.ok(response.body)
                    test.equal(response.statusCode, 200);
                    test.equal(response.headers['content-type'], 'application/json; charset=utf-8');

                    test.doesNotThrow(function() {
                        test.ok(JSON.parse(response.body)[0].pass);
                    }, 'response has data passed to ok()');
                    test.done();
                });
        },
        'GET with ID -> ok(body)': function(test) {
            this.request.get('/api/entity/1')
                .set('accept', 'application/json')
                .expect(function(response) {
                    test.ok(response.body)
                    test.equal(response.statusCode, 200);
                    test.equal(response.headers['content-type'], 'application/json; charset=utf-8');
                    test.doesNotThrow(function() {
                        test.ok(JSON.parse(response.body).pass);
                    }, 'response has data passed to ok()');
                    test.done();
                });
        },
        'PUT with ID -> accepted(location)': function(test) {
            this.request.put('/api/entity/1')
                .set('accept', 'application/json')
                .set('content-type', 'application/json')
                .write('{"id": 1, "pass": true}')
                .end(function(response) {
                    test.equal(response.statusCode, 202);
                    test.equal(response.headers.location, '/api/entity/1', 'returns location');
                    test.done();
                });
        },
        'POST with ID and Body -> created(location, body)': function(test) {
            this.request.post('/api/entity')
                .set('accept', 'application/json')
                .set('content-type', 'application/json')
                .write('{"id": 1, "pass": true}')
                .end(function(response) {
                    test.equal(response.statusCode, 201);
                    test.equal(response.headers.location, '/api/entity/1', 'returns location');
                    test.ok(response.body)
                    test.equal(response.headers['content-type'], 'application/json; charset=utf-8');
                    test.doesNotThrow(function() {
                        test.ok(JSON.parse(response.body).pass);
                    }, 'response has data passed to ok()');
                    test.done();
                });
        }
    }
};