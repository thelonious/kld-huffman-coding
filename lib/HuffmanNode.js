/**
 *
 *  HuffmanNode.js
 *
 *  copyright 2003, 2013 Kevin Lindsey
 *
 */

/**
 *  HuffmanNode
 *
 *  @param {Integer} value
 *  @returns {HuffmanNode}
 */
function HuffmanNode(value) {
    this.value = value;
    this.count = 0;
    this.savedCount = 0;
    this.childZero = null;
    this.childOne = null;
}


/**
 *  setChildren
 *
 *  @param {HuffmanNode} childZero
 *  @param {HuffmanNode} childOne
 */
HuffmanNode.prototype.setChildren = function(childZero, childOne) {
    this.count = childZero.count + childOne.count;
    this.childZero = childZero;
    this.childOne = childOne;

    // mark child counts to zero to inactivate them in the node list
    childZero.savedCount = childZero.count;
    childZero.count = 0;
    childOne.savedCount = childOne.count;
    childOne.count = 0;
};

if (typeof module !== "undefined") {
    module.exports = HuffmanNode;
}
