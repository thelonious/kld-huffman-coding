var BitWriterMSB = require('kld-bit-streams').BitWriterMSB,
    BitReaderMSB = require('kld-bit-streams').BitReaderMSB,
    Huffman = require('../lib/Huffman');

function createData() {
    var size = 64; //16384;
    var data = new Array(size);

    for ( var i = 0; i < size; i++ ) {
        var s = Math.sin( Math.random() * Math.PI );

        data[i] = Math.floor(s*128 + 64);
    }

    return data;
}

exports.compress = function(beforeExit, assert) {
    var writer = new BitWriterMSB();
    var huffman = new Huffman();
    var data = createData();

    huffman.compress(data, writer);
    writer.close();

    //console.log(writer.data);
    var before = data.length;
    var after = writer.data.length;
    var reduction = Math.round( after/before * 10000 ) / 100;
    var rating = Math.round( (1 - after/before) * 10000 ) / 100;

    console.log("Original data length: " + before);
    console.log("Compressed length: " + after);
    console.log("Percent original size: " + reduction + "%");
    console.log("Percent compression: " + rating + "%");
};

exports.decompress = function(beforeExit, assert) {
    var writer = new BitWriterMSB();
    var huffman = new Huffman();
    var data = createData();

    huffman.compress(data, writer);
    writer.close();

    var reader = new BitReaderMSB(writer.data);
    var data2 = huffman.decompress(reader);

    assert.eql(data2, data);
};
