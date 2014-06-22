var fs = require('fs');
var util = require('util');

var Transform = require('stream').Transform;

/*
* Creates a correctly formatted BMP transform stream from a reversed list of RGB values
* @constructor
* @param {integer} options.width - The width of the image
* @param {integer} options.height - The height of the image
*/

function ToBmp(options) {
  if (!(this instanceof ToBmp)) {
    return new ToBmp(options);
  }

  Transform.call(this, options);

	var width = Number(options.width);
	var height = Number(options.height);

	var bytesPerLine = width * 4;
	var dataOffset = 54;
	var imgDataSize = bytesPerLine * height;


  this.push('B');											                   // Type Header char 1 
  this.push('M');                                        // Type Header char 2
                            
	this.push(this.pad(dataOffset + imgDataSize, 4));      // Size of the entire BMP file in bytes
	this.push(this.pad(0, 4));                             // Reserved for non speciifc application
	this.push(this.pad(dataOffset, 4));                    // Offset of the byte where the bitmap image data starts
	this.push(this.pad(40, 4));                            // Size of this header (40 bytes)
	this.push(this.pad(width, 4));                         // Bitmap width in pixels
	this.push(this.pad(height, 4));                        // Bitmap height in pixels
	this.push(this.pad(1, 2));                             // Number of color planes - must be 1
	this.push(this.pad(32, 2));                            // Bits per pixel - color depth of the image: 1, 4, 8, 16, 24 or 32
	this.push(this.pad(0, 4));                             // Compression method
	this.push(this.pad(imgDataSize, 4));                   // Image data size in bytes 
	this.push(this.pad(0, 4));                             // Horizontal resolution of the image
	this.push(this.pad(0, 4));                             // Vertical resolution of the image
	this.push(this.pad(0, 4));                             // No. of colors in the color palette
	this.push(this.pad(0, 4));                             // No. of important colors used - 0 when every color is important
}

util.inherits(ToBmp, Transform);

ToBmp.prototype._transform = function (chunk, enc, cb) {
	var c = chunk.toString().split(',');

	this.push(this.pad(c[2], 1)); //B
	this.push(this.pad(c[1], 1)); //G
	this.push(this.pad(c[0], 1)); //R
	this.push(this.pad(1, 1)); //Pad - or alpha

  cb();
};

ToBmp.prototype.pad = function (elm, size) {
	var buf = new Buffer(Array(size+1).join('\0'));
	buf.write(this.toHex(elm), 0, 'hex');

	return buf;
};

ToBmp.prototype.toHex = function (d) {
	var s = (Number(d)>>>0).toString(16);
  return  s.length > 1 ? s : '0' + s;
};

module.exports = ToBmp;