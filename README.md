# Impurge

This tiny library converts imgur album and image urls into direct image links. It is based on [hortinstein](https://github.com/hortinstein)'s orginal [impurge](https://github.com/hortinstein/impurge) library. This has been remixed to work in both the browser and node.js environments.

## Usage

To install via npm:

	$ npm install impurge-remix

Otherwise, download this repo as a zip and include the `impurge.js` or `impurge.min.js` where ever you might need it.

## Example

```js
var impurge = require("impurge"); // Only necesary in node.js. In browsers, impurge is already available.

impurge.purge("http://imgur.com/ppFDF", function(err, images) {
	if (err) console.error(err);
	else console.log(images);
});
```