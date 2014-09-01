var express = require('express'),
    expressRest = require('../expressRest');

var app = express();
var rest = expressRest(app);

var records = [
    {id: 'a', value: 'Apple'},
    {id: 'b', value: 'Banana'}
];

rest.get('/api/food', function(req, rest) {
    rest.ok(records);
});

rest.get('/api/food/:id', function(req, rest) {
   for (var i = 0; i < records.length; i++) {
       var record = records[i];
       if (record.id === req.params.id) {
           rest.ok(record);
           return;
       }
   }
    rest.notFound();
});

rest.put('/api/food/:id', function(req, rest) {
    if (req.body.id != req.params.id) return rest.badRequest('Cannot change id');
    for (var i = 0; i < records.length; i++) {
        var record = records[i];
        if (record.id === req.params.id) {
            records[i] = rest.body;
            rest.accepted('/api/food/' + encodeURI(req.params.id))
            return;
        }
    }
    rest.notFound();
});

rest.post('/api/food', function(req, rest) {
    if (!req.body.id) {
        return rest.badRequest('id field is required');
    }
    for (var i = 0; i < records.length; i++) {
        var record = records[i];
        if (record.id === req.params.id) {
            return rest.conflict('A record already exists with this URL.');
        }
    }
    records.push(req.body);
    rest.created('/api/food/' + encodeURI(req.body.id));
});

rest.delete('/api/food/:id', function(req, rest) {
    for (var i = 0; i < records.length; i++) {
        var record = records[i];
        if (record.id === req.params.id) {
            records.splice(i, 1);
            return rest.gone('The record has been deleted.');;
        }
    }
    rest.notFound();
})


var listener = app.listen(process.env.PORT, process.env.IP);
var addr = listener.address().address,
    port = listener.address().port;
if (addr === '0.0.0.0') addr = '127.0.0.1';
console.info('Listening on http://' + addr + ':' + port + '/api/food');