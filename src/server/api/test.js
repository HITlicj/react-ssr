var express = require('express');
var mongoose = require('mongoose');
var gridfs = require('gridfs-stream');
var fs = require('fs');

var db_filename = "1.jpeg";
var local_file = "1.jpeg";

mongoose.connect('mongodb://127.0.0.1:27017/test', { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var app = express();
gridfs.mongo = mongoose.mongo;
var connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', function () {

    var gfs = gridfs(connection.db);

    app.get('/', function (req, res) {
        res.send('Demo of MongoDB – GridFS by niralar.com');
    });

    // Writing a file from local to MongoDB
    app.get('/write', function (req, res) {
        var writestream = gfs.createWriteStream({ filename: db_filename });
        fs.createReadStream(local_file).pipe(writestream);
        writestream.on('close', function (file) {
            res.send('File Created : ' + file.filename);
        });
    });

    // Reading a file from MongoDB
    app.get('/read', function (req, res) {
        // Check file exist on MongoDB
        gfs.exist({ filename: db_filename }, function (err, file) {
            if (err || !file) {
                res.send('File Not Found');
            } else {
                var readstream = gfs.createReadStream({ filename: db_filename });
                console.log(readstream);
                readstream.pipe(res);
            }
        });
    });

    // Delete a file from MongoDB
    app.get('/delete', function (req, res) {
        gfs.exist({ filename: db_filename }, function (err, file) {
            if (err || !file) {
                res.send('File Not Found');
            } else {
                gfs.remove({ filename: db_filename }, function (err) {
                    if (err) res.send(err);
                    res.send('File Deleted');
                });
            }
        });
    });

    // Get file information(File Meta Data) from MongoDB
    app.get('/meta', function (req, res) {
        gfs.exist({ filename: db_filename }, function (err, file) {
            if (err || !file) {
                res.send('File Not Found');
            } else {
                gfs.files.find({ filename: db_filename }).toArray(function (err, files) {
                    if (err) res.send(err);
                    res.send(files);
                });
            }
        });
    });
    app.listen(3000, () => console.log('Example app listening on port 3000!'))
});