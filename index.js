/**
 * @copyright Kristian Lyngbaek
 * @author Kristian Lyngbaek
 * @module stream-chunker
 */
var through2 = require('through2');

/**
 * Returns a transform stream which chunks incoming data into chunkSize byte
 * chunks.
 * @param  {integer}    chunkSize   Size of chunks in bytes
 * @param  {boolean}    [flush]     Flush incomplete chunk data on stream end
 *                                  Default is false
 * @return {Stream.Transform}       A transform stream
 */
module.exports = function (chunkSize, flush) {

    // buffer to store the last few bytes of incoming data
    // if it does not divide evenly into chunkSize
    var buffer = new Buffer(0);

    var opts = {
        halfOpen: false,
        objectMode: false
    };

    var transformFunction = function (data, enc, next) {
        var allData = Buffer.concat([buffer, data]);
        var totalLength = allData.length;
        var remainder = totalLength % chunkSize;
        var cutoff = totalLength - remainder;
        for (var i=0 ; i<cutoff ; i+=chunkSize) {
            var chunk = allData.slice(i, i+chunkSize);
            this.push(chunk);
        }
        buffer = allData.slice(cutoff, totalLength);
        next();
    };

    var flushFunction;
    if (flush) {
        flushFunction = function (next) {
            this.push(buffer);
            next();
        };
    }

    return through2(opts, transformFunction, flushFunction);

};