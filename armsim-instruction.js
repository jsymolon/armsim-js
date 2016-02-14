var Instructions = (function () {
    var my = {};
    my.INST_CLASS = [];
    my.INST_BITS = [];
   	my.INST_ALL = [];
   	my.INST_MASK = [];
   	my.condcode = 0;
   	my.opcode = 0;    // dp opcodes
   	my.scode = 0;
   	my.icode = 0;
   	my.pcode = 0;
   	my.ucode = 0;
   	my.rcode = 0;
   	my.bcode = 0;
   	my.ncode = 0;
   	my.wcode = 0;
   	my.lcode = 0;
   	my.reg_n = 0;
   	my.reg_d = 0;
   	my.reg_s = 0;
   	my.reg_m = 0;
   	my.shift_amt = 0;
   	my.shift = 0;
   	my.rotate = 0;
   	my.imm8 = 0;
   	my.instr_class = '';  // dpis, misc1 etc
   	my.disassemblyText = '';

	my.instructionTable = {
		// DDi01001.pdf
		// cond = c,  opcode = 0, s = s, rn,rd,rm,rs = n,d,m,i
		// shift = h, shift amount = a, t = rotate
		// r,p,u,b,w,l (same)
		// swi # = #
		// x = don't care, 2 - opcode1, 3 = opcode 2
		// 0,1 actual
		'dpis'  : ['cccc000oooosnnnnddddaaaaahh0mmmm'], // data proc immd shift
		'misc1' : ['cccc00010xx0xxxxxxxxxxxxxxx0xxxx'], // misc 1
		'dpr'   : ['cccc000oooosnnnnddddiiii0hhimmmm'], // data proc register shift
		'misc2' : ['cccc00010xx0xxxxxxxxxxxx0xx1xxxx'], // misc 2
		'mult'  : ['cccc000xxxxxxxxxxxxxxxxx1xx1xxxx'], // multiplies - load/stores
		'dpi'   : ['cccc001oooosnnnnddddtttt########'], // data processing immd
		'undef' : ['cccc00110x00xxxxxxxxxxxxxxxxxxxx'], // undefined
		'misr'  : ['cccc00110r10kkkk----tttt########'], // move imm to status reg
		'lsio'  : ['cccc010pubwlnnnndddd############'], // load store immed off
		'lsro'  : ['cccc011pubwlnnnnddddaaaaahh0mmmm'], // load store reg off
		'media' : ['cccc011xxxxxxxxxxxxxxxxxxxx1xxxx'], // media instr
		'aundf' : ['cccc01111111xxxxxxxxxxxx1111xxxx'], // arch undef
		'lsm'   : ['cccc100puswlnnnn################'], // load store multiple
		'bblk'  : ['cccc101l########################'], // branch and branch and link
		'cols'  : ['cccc110puNwlnnnnddddeeee########'], // coprocessor load store
		'codp'  : ['cccc11102222nnnnddddeeee3330mmmm'], // coprocessor data
		'cort'  : ['cccc1110222lnnnnddddeeee3331mmmm'], // coprocessor register transfer
		'swi'   : ['cccc1111########################'], // software interrupt
		'unci'  : ['1111xxxxxxxxxxxxxxxxxxxxxxxxxxxx']  // unconditional instr
	};
	my.instructionMnemonic = {
		// array idx is opcode; 0 = 0000, 1 = 0001 ...
		'dpis'  : [ 'AND', 'EOR', 'SUB', 'RSB', 'ADD', 'ADC', 'SBC', 'RSC', 'TST', 'TEQ', 'CMP', 'CMN', 'ORR', 'MOV', 'BIC', 'MVN' ],
		'misc1' : [ ],
		'dpr'   : [ 'AND', 'EOR', 'SUB', 'RSB', 'ADD', 'ADC', 'SBC', 'RSC', 'TST', 'TEQ', 'CMP', 'CMN', 'ORR', 'MOV', 'BIC', 'MVN' ],
		'misc2' : [ ],
		'mult'  : [ 'MUL', 'MLA' ],
		'dpi'   : [ 'AND', 'EOR', 'SUB', 'RSB', 'ADD', 'ADC', 'SBC', 'RSC', 'TST', 'TEQ', 'CMP', 'CMN', 'ORR', 'MOV', 'BIC', 'MVN' ],
		'undef' : [ ],
		'misr'  : [ ],
		'lsio'  : [ ],
		'lsro'  : [ ],
		'media' : [ ],
		'aundf' : [ ],
		'lsm'   : [ ],
		'bblk'  : [ ],
		'cols'  : [ ],
		'codp'  : [ ],
		'cort'  : [ ],
		'swi'   : [ ],
		'unci'  : [ '' ],

	};
	my.condCodeMnemonic = {
		0  : 'EQ',
		1  : 'NE',
		2  : 'CS',
		3  : 'CC',
		4  : 'MI',
		5  : 'PL',
		6  : 'VS',
		7  : 'VC',
		8  : 'HI',
		9  : 'LS',
		10 : 'GE',
		11 : 'LT',
		12 : 'GT',
		13 : 'LE',
		14 : 'AL',
		15 : '--'
	};

	// Function jump tables / function pointers
	my.instructionJump = {};

  	// ------------------------------------------------------------
  	// extracts the condition code from the instruction
    my.getCondCode = function (code) {
        my.condcode = code >>> 28;
    };

  	// ------------------------------------------------------------
  	// decodes the DP opcode from the instruction
    my.getDPOpCode = function (code) {
        my.opcode = (code >>> 21) & 15;
    };

  	// ------------------------------------------------------------
  	// decodes the DP S from the instruction
    my.getDPSCode = function (code) {
        my.scode = (code >> 20) & 1;
    };

  	// ------------------------------------------------------------
  	// decodes the DP I from the instruction
    my.getDPICode = function (code) {
        my.icode = (code >> 25) & 1;
    };

  	// ------------------------------------------------------------
  	// decodes the DP Rn from the instruction
    my.getDPRn = function (code) {
        my.reg_n = (code >> 16) & 15;
    };

  	// ------------------------------------------------------------
  	// decodes the DP Rn from the instruction
    my.getDPRd = function (code) {
        my.reg_d = (code >> 12) & 15;
    };

  	// ------------------------------------------------------------
  	// decodes the DP Rn from the instruction
    my.getDPRs = function (code) {
        my.reg_s = (code >> 8) & 15;
    };

  	// ------------------------------------------------------------
  	// decodes the DP Rn from the instruction
    my.getDPRm = function (code) {
        my.reg_m = code & 15;
    };

  	// ------------------------------------------------------------
  	// decodes the shift amount from the instruction
    my.getShiftAmount = function (code) {
        my.shift_amt = (code >> 7) & 31;
    };

  	// ------------------------------------------------------------
  	// decodes the shift from the instruction
    my.getShift = function (code) {
        my.shift = (code >> 5) & 3;
    };

  	// ------------------------------------------------------------
  	// decodes the rotate from the instruction
	my.getRotate = function (code) {
		my.rotate = (code >> 8) & 15;
	};

   	// ------------------------------------------------------------
  	// decodes the immdiate 8-bits from the instruction
    my.getImm8 = function (code) {
    	my.imm8 = code & 0xff;
    };

   	// ------------------------------------------------------------
  	// 
    my.getShiftText = function () {
    	var shftxt = '';
    	if (my.shift === 0) {
    		shftxt = 'LSL';
    	}
    	if (my.shift === 1) {
    		shftxt = 'LSR';
    	}
    	if (my.shift === 2) {
    		shftxt = 'ASR';
    	}
    	if (my.shift === 3) {
    		shftxt = 'ROR';
    		if (my.shift_amt === 0) {
	    		shftxt = 'RRX';
    		}
    	}
    	return shftxt;
    };

    // ------------------------------------------------------------
   	// DEBUG - returns the static bits as decoded
    my.getInstrBits = function (instr) {
        return my.INST_BITS[instr];
    };

    // ------------------------------------------------------------
    // decodes the static bits in the instruction, uses the mask
    //    to pull the static bits and then matches the 0/1 bits as
    //    set against the instruction list to create the index
    //    into the hash (DP Bits 27-26 = 0 or =1(DP imm))
    my.decodeInstrClass = function(code) {
    	console.log("-----------------------------------------------------------");
    	console.log("decodeInstrClass code:" + code.toString(16));
    	my.instr_class = '';
    	for (var inst in my.INST_MASK) {
    		var base = code  & my.INST_MASK[inst]; // strips out everything but significant bits
    		console.log("i:"+inst+" base:"+base.toString(16)+" bits:"+my.INST_BITS[inst].toString(16)+" mask:"+my.INST_MASK[inst].toString(16));
    		if (base == my.INST_BITS[inst]) {
    			// found instr class
    			console.log(" ----> decodeInstrClass " + inst);
    			my.instr_class = my.INST_CLASS[inst];
    		}
    	}
    	console.log("-----------------------------------------------------------");
    };

   	// ------------------------------------------------------------
   	// decode DP instructions ( from jump table )
    my.decodeDPIS = function (code, exec) {
    	console.log("decodeDPIS c:"+code.toString(16)+" e:"+exec);
    	my.getDPSCode(code);
    	my.getDPRn(code);
    	my.getDPRd(code);
    	my.getShiftAmount(code);
    	my.getShift(code);
    	my.getDPRm(code);
    	if (exec === 0) {
    		my.disassemblyText = code.toString(16) + " ";
    		var instr_list = my.instructionMnemonic[my.instr_class];
    		my.disassemblyText += instr_list[my.opcode];
    		my.disassemblyText += my.condCodeMnemonic[my.condcode];
    		if (my.scode === 0) {
    			my.disassemblyText += 'S ';
    		} else {
    			my.disassemblyText += '  ';
    		}
    		my.disassemblyText += 'R' + my.reg_d.toString(16) + ", ";
    		my.disassemblyText += 'R' + my.reg_n.toString(16) + ", ";
    		my.disassemblyText += my.getShiftText() + " #" + my.shift_amt.toString(16);
    	} else {
    		// exec instruction
    	}
    };

   	// ------------------------------------------------------------
   	// decode DP instructions ( from jump table )
    my.decodeDPR = function (code, exec) {
    	my.getDPSCode(code);
    	my.getDPRn(code);
    	my.getDPRd(code);
    	my.getDPRs(code);
    	my.getShift(code);
    	my.getDPRm(code);
    	if (exec === 0) {

    	} else {
    		
    	}
    };

   	// ------------------------------------------------------------
   	// decode DP instructions ( from jump table )
    my.decodeDPI = function (code, exec) {
    	my.getDPSCode(code);
    	my.getDPRn(code);
    	my.getDPRd(code);
    	my.getRotate(code);
    	my.getImm8(code);
    	if (exec === 0) {

    	} else {
    		
    	}
    };

    // ------------------------------------------------------------
   	// decode the instruction (fill in class vars) for use w/ other functions
   	// MAIN entrance point for instuctions
    my.decodeExecInstruction = function(code, exec) {
    	my.decodeInstrClass(code);
    	my.getCondCode(code);
    	if (typeof my.instructionJump[my.instr_class] === 'function') {
    		console.log("decodeInstruction: class:"+my.instr_class+" is defined in jump table");
    		// defined instruction class hander in jump table
    		my.instructionJump[my.instr_class](code, exec);
    	}
    };

  	// ------------------------------------------------------------
   	// return the string from the disassembly
    my.getDisassemblyText = function() {
    	return my.disassemblyText;
    };

   	// ------------------------------------------------------------
   	// DEBUG function - size of hash
    my.getSize = function(obj) {
		var length = 0;
	  	for (var property in obj) {
    		if (obj.hasOwnProperty(property)) {
      			length += 1;
    		}
  		};
  		return length;
  	};

   	// ------------------------------------------------------------
    // on "load" - build tables and masks
	(function () {
		var cur;
		for (var inst in my.instructionTable) {
			cur = my.instructionTable[inst][0];
			mask = 0;
			bits = 0;
			my.INST_CLASS[inst] = inst; // reverse map
	        var len = cur.length; // note spaces in instr format str
			for (var i = 0; i<len; i++ ) {
				var c = cur.charAt(i);
	        	if (c != ' ') { // skip space as a readability item
	            	var bit = 0;
	            	var mbit = 0;
					if (c == '1') {
						bit = 1;
						mbit = 1;
					}
					if (c == '0') { // mask bits used to strip constants out
						mbit = 1;
					}
					bits = bits * 2;
					bits |= bit;
					mask = mask * 2;
					mask |= mbit;
					//console.log('i:'+i+' c:'+c+' bits:'+bits.toString(16)+" m:"+mask.toString(16));
				}
			}
			console.log('instr:'+inst+' bits:'+bits.toString(16)+" m:"+mask.toString(16));
			my.INST_BITS[inst] = bits;
			my.INST_MASK[inst] = mask;
		}
		console.log(" ... L:"+my.getSize(my.INST_BITS)+" m:"+my.getSize(my.INST_MASK));

		// load jump tables
		my.instructionJump['dpis'] = function(code, exec) {
			my.decodeDPIS(code, exec);
		};
		my.instructionJump['misc1'] = function(code, exec) {};
		my.instructionJump['dpr'] = function(code, exec) {
			my.decodeDPR(code, exec);
		};
		my.instructionJump['misc2'] = function(code, exec) {};
		my.instructionJump['mult'] = function(code, exec) {};
		my.instructionJump['dpi'] = function(code, exec) {
			my.decodeDPI(code, exec);
		};
		my.instructionJump['undef'] = function(code, exec) {};
		my.instructionJump['misr'] = function(code, exec) {};
		my.instructionJump['lsio'] = function(code, exec) {};
		my.instructionJump['lsro'] = function(code, exec) {};
		my.instructionJump['media'] = function(code, exec) {};
		my.instructionJump['aundf'] = function(code, exec) {};
		my.instructionJump['lsm'] = function(code, exec) {};
		my.instructionJump['bblk'] = function(code, exec) {};
		my.instructionJump['cols'] = function(code, exec) {};
		my.instructionJump['codp'] = function(code, exec) {};
		my.instructionJump['cort'] = function(code, exec) {};
		my.instructionJump['swi'] = function(code, exec) {};
		my.instructionJump['unci'] = function(code, exec) {};
	})();
	return my;
}());