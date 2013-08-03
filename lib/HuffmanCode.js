/**
 *
 *  HuffmanCode.js
 *
 *  copyright 2003, 2013 Kevin Lindsey
 *
 */

/**
 *  HuffmanCode
 *
 *  @returns {HuffmanCode}
 */
function HuffmanCode() {
    this.value = 0;
    this.totalBits = 0;
}


/**
 *  toString
 *
 *  @returns {String}
 */
HuffmanCode.prototype.toString = function() {
    var result = "n/a";

    if ( this.totalBits > 0 )
        result = [this.totalBits, this.value, this.value.toString(2)].join(":");

    return result;
};

if (typeof module !== "undefined") {
    module.exports = HuffmanCode;
}
