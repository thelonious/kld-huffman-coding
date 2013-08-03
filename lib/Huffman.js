/**
 *
 *  Huffman.js
 *
 *  copyright 2003, 2103 Kevin Lindsey
 *
 *  this code is based on HUFF.C as described in "The Data Compression Book",
 *  written by Mark Nelson
 *
 */

var HuffmanNode = require('./HuffmanNode'),
    HuffmanCode = require('./HuffmanCode');

/**
 *  enums
 */
Huffman.EOS = 256;


/**
 *  Huffman
 *
 *  @returns {Huffman}
 */
function Huffman() {
    // array to capture frequency for each uncompressed byte value
    this.counts = new Array(256);

    // build all HuffmanCodes used to map uncompressed byte values to their
    // associated Huffman code
    var codes = new Array(257);
    var length = codes.length;
    for ( var i = 0; i < length; i++ )
        codes[i] = new HuffmanCode();
    this.codes = codes;

    // build all HuffmanNodes for Huffman code tree
    var nodes = new Array(514);
    length = nodes.length;
    for ( var i = 0; i < length; i++ )
        nodes[i] = new HuffmanNode(i);
    this.nodes = nodes;

    // root node or Huffman code tree
    this.root = null;
}

/**
 *  compress
 *
 *  @param {Array<byte>} data
 *  @param {BitWriterMSB} writer
 */
Huffman.prototype.compress = function(data, writer) {
    this.setCounts(data);   // init counts and scale
    this.buildTree();       // build decode tree
    this.buildCodes();      // convert tree to lookup table

    var length = data.length;
    for (var i = 0; i < length; i++ ) {
        var code = this.codes[data[i]];

        writer.writeBits(code.value, code.totalBits);
    }

    var eos = this.codes[Huffman.EOS];
    writer.writeBits(eos.value, eos.totalBits);
};

/**
 *  decompress
 *
 *  for testing only...assumes encode tree has been built with compress
 *
 *  @param {BitReaderMSB} reader
 *  @results {Array<Byte>}
 */
Huffman.prototype.decompress = function(reader) {
    var result = [];
    var eos = this.nodes[Huffman.EOS];

    while ( true ) {
        var node = this.root;

        while ( node.value > Huffman.EOS ) {
            if ( reader.readBit() ) {
                node = node.childOne;
            } else {
                node = node.childZero;
            }
        }

        if ( node === eos ) {
            break;
        } else {
            result.push(node.value);
        }
    }

    return result;
};

/**
 *  setCounts
 *
 *  determines byte value frequencies and scales these to fit within a 16-bit
 *  int
 *
 *  @param {Array<Byte>} data
 */
Huffman.prototype.setCounts = function(data) {
    var counts = this.counts;
    var clength = counts.length;

    // clear count data
    for ( var i = 0; i < clength; i++ ) counts[i] = 0;

    // determine counts for each byte value in our data
    var dlength = data.length;
    for ( var i = 0; i < dlength; i++ ) counts[data[i]]++;

    // scale values to fit within a 16-bit int
    var maxCount = Math.max.apply(Math, counts);
    if ( maxCount == 0 ) {
        maxCount = 1;
        counts[0] = 1;
    }
    maxCount = Math.floor(maxCount / 255) + 1;

    var nodes = this.nodes;
    for ( var i = 0; i < Huffman.EOS; i++ ) {
        var count = counts[i];
        var node = nodes[i];

        node.count = Math.floor(count/maxCount);
        if ( node.count == 0 && count != 0 )
            node.count = 1;
    }
    nodes[Huffman.EOS].count = 1;
};

/**
 *  buildTree
 */
Huffman.prototype.buildTree = function() {
    var nextFreeIndex = Huffman.EOS + 1;
    var nodes = this.nodes;
    var lastNode = nodes[nodes.length-1];

    // make sure last node has the highest value
    lastNode.count = 0xFFFF;

    // find the two count nodes with the smallest counts
    while ( true ) {
        var min1 = lastNode;
        var min2 = lastNode;

        for ( var i = 0; i < nextFreeIndex; i++ ) {
            var node = nodes[i];

            // Skip byte values with a zero count which signifies that they
            // have either already been processed or that there are no byte
            // values in our data for the given value
            if ( node.count != 0 ) {
                if ( node.count < min1.count ) {
                    min2 = min1;
                    min1 = node;
                } else if ( node.count < min2.count) {
                    min2 = node;
                }
            }
        }

        // test if we are done
        if ( min2 !== lastNode ) {
            // update tree and advance to next free node index
            nodes[nextFreeIndex++].setChildren(min1, min2);
        } else {
            break;
        }
    }

    // get root node, save count, and return
    this.root = nodes[nextFreeIndex-1];
    this.root.saveCount = this.root.count;
};

/**
 *  buildCodes
 *
 *  @param {HuffmanNode} node
 *  @param {Integer} currentCode
 *  @param {Integer} bitCount
 */
Huffman.prototype.buildCodes = function(node, currentCode, bitCount) {
    if ( node == null && currentCode == null && bitCount == null ) {
        node = this.root;
        currentCode = 0;
        bitCount = 0;
    }

    if ( node.value <= Huffman.EOS ) {
        // found a leaf node, assign value and bit length to HuffmanCode
        var code = this.codes[node.value];

        code.value = currentCode;
        code.totalBits = bitCount;

        if ( node.savedValue == 0 )
            throw new Error("Huffman.buildCodes: node has zero count" + node.value);
    } else {
        // inner node, continue down the tree
        currentCode <<= 1;
        bitCount++;
        this.buildCodes(node.childZero, currentCode, bitCount);
        this.buildCodes(node.childOne, currentCode | 1, bitCount);
    }
};

if (typeof module !== "undefined") {
    module.exports = Huffman;
}
