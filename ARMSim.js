/*! ARMSim.js
	----------------------------------------------
	ARM architecture in a browser
*/
var ARMSim = (function (undefined) {
	var my = {};
	// check support
	if (!Uint32Array || !Array.prototype.indexOf) {
		console.log('unsupported browser'); my.unsupported = true; return;
	}

 	// ------------------------------------------------------------
   	my.load_list = function() {
   		console.log("load list");
   	}

 	// ------------------------------------------------------------
   	my.load_file = function(file) {
   		console.log("load file:"+file);
   	}
    return my;
})();