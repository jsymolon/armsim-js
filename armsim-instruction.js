var Instructions = (function () {
        var my = {};
		  var instructionTable = {
					 // name : coded inst, num fields, split field
					 'dp'    : ['cccc 001p pppS nnnn dddd 2222 2222 2222',  6, 0],  // data processing
					 'mult'  : ['cccc 0000 00AS dddd nnnn ssss 1001 mmmm',  7, 0],  // mult
					 'multl' : ['cccc 0000 1UAS DDDD dddd nnnn 1001 mmmm',  8, 0],  // mult DDDD = rd hi, dddd rd low
					 'sds'   : ['cccc 0001 0B00 nnnn dddd 0000 1001 mmmm',  5, 0],
					 'bx'    : ['cccc 0001 0010 1111 1111 1111 0001 nnnn',  2, 0],
					 'hwdx'  : ['cccc 000P U0WL nnnn dddd 0000 1SH1 mmmm', 10, 0],
					 'hwdxi' : ['cccc 000P U1WL nnnn dddd oooo 1SH1 oooo', 10, 1],
					 'sdx'   : ['cccc 011P UBWL nnnn dddd oooo oooo oooo',  8, 0],
					 'undef' : ['cccc 011x xxxx xxxx xxxx xxxx xxx1 xxxx',  2, 1],
					 'bdt'   : ['cccc 100P USWL nnnn rrrr rrrr rrrr rrrr',  8, 0],
					 'brh'   : ['cccc 101L oooo oooo oooo oooo oooo oooo',  3, 0],
					 'cdt'   : ['cccc 110P UNWL nnnn dddd #### oooo oooo', 10, 0],
					 'cdo'   : ['cccc 1110 pppp nnnn dddd #### yyy0 mmmm',  7, 0],
					 'crt'   : ['cccc 1110 pppL nnnn dddd #### yyy1 mmmm',  9, 0],
					 'si'    : ['cccc 1111 xxxx xxxx xxxx xxxx xxxx xxxx',  1, 0]
		  };
        var INST_BITS = [];
        var INST_ALL = [];
        var INST_MASK = [];
        my.getInstrBits = function (instr) {
            return INST_BITS[instr];
        };
		  (function () {
					 var cur;
					 for (var inst in instructionTable) {
								cur = instructionTable[inst][0];
								mask = 0;
								bits = 0;
                        var len = cur.length; // note spaces in instr format str
								for (var i = 0; i<len; i++ ) {
								   var c = cur.charAt(i);
                           if (c != ' ') { // skip space as a readability item
                              bit = 0;
									   if (c == '1') {
										  bit = 1;
									   }
									   bits = bits << 1;
									   bits |= bit;
                           }
								}
								INST_BITS.push(bits);
					 }
					 // build translators
					 INST_ALL = INST_ALL;
					 //instructions.INST_BITS = INST_BITS;
					 INST_MASK = INST_MASK;
		  })();
	return my;
}());