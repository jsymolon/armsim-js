/*! ARMSim.js
	----------------------------------------------
	ARM architecture in a browser
*/
	var ARMSim = (function (undefined) {
	var exports = {};
	// check support
	if (!Uint32Array || !Array.prototype.indexOf) {
		console.log('unsupported browser'); exports.unsupported = true; return;
	}
	// event bus
	var EventBus = (function () {

		function EventBus() {
			this._bus = {}
		}
		methods(EventBus, {
			// register an event handler
			register : function (ename, handler) {
				if (!this._bus[ename]) {
					this._bus[ename] = [handler];
				} else {
					this._bus[ename].push(handler);
				}
			},
			// remove an event handler
			remove : function (ename, handler) {
				var list = this._bus[ename]; if (list) {
					list.splice(list.indexOf(handler), 1);
				}
			},
			// post an event, following arguments will be passed to handlers
			post : function (ename) {
				var args = Array.prototype.slice.call(arguments, 1),
					list = this._bus[ename];
				if (list) {
					for (var i = 0, n = list.length;i < n;i++) {
						list[i].apply(null, args);
					}
				}
			}
		});

		return EventBus;
	})(); exports.EventBus = EventBus;

	var Memory = (function () {
		var CHUNKSIZE = 65536; 
			this.chunks = [];
			this.latencyCtr = 0; this.latency = 1; this.busy = false;
		};

		// memory methods
		methods(Memory, {
			// alignment check should be done in CPU big-endian 0x11223344 -> LAddr 11 22 33 44 HAddr
			getChunk : function (addr) {
				var chunk = this.chunks[addr >>> CHUNKWIDTH]; if (!chunk) {
					chunk = new Uint8Array(CHUNKSIZE); this.chunks[addr >>> CHUNKWIDTH] = chunk;
				}
				// assert busy flag here as all other operations need to call this function first no need to care about this during
				// functional simulation
				this.busy = true; return chunk;
			}, getWord : function (addr) {
				var chunk = this.getChunk(addr); addr &= MASK;
				// big-endian, low address = high bits
				var tmp = (chunk[addr] << 24) |
						  (chunk[addr+1] << 16) | (chunk[addr+2] << 8) | (chunk[addr+3]);
				return (tmp < 0 ? 4294967296 + tmp : tmp);
			}, getHalfword : function (addr) {
				var chunk = this.getChunk(addr); addr &= MASK; return ((chunk[addr] << 8) |
						(chunk[addr+1]));
			}, getByte : function (addr) {
				return (this.getChunk(addr)[(addr & MASK)]);
			}, setWord : function (addr, val) {
				var chunk = this.getChunk(addr); addr &= MASK; chunk[addr] = (val & 0xff000000) >>> 24; chunk[addr+1] = (val &
				0x00ff0000) >>> 16; chunk[addr+2] = (val & 0x0000ff00) >>> 8; chunk[addr+3] = (val & 0x000000ff);
			}, setHalfword : function (addr, val) {
				var chunk = this.getChunk(addr); addr &= MASK; val &= 0xffff; chunk[addr] = (val & 0xff00) >>> 8; chunk[addr+1] =
				(val & 0x00ff);
			}, setByte : function (addr, val) {
				this.getChunk(addr)[addr & MASK] = (val & 0xff);
			},
			// cycle-accurate simulation related methods called every clock cycle cpu should check busy flag before read/write
			step : function () {
				if (this.busy) {
					this.latencyCtr++; if (this.latencyCtr >= this.latency) {
						this.latencyCtr = 0; this.busy = false;
					}
				}
			},
			// debug methods
			dump : function (start, nrow, ncol) {
				var n = nrow * ncol, i, offset,
					result = '';
				for (i = 0;i < n;i++) {
					offset = start + (i << 1); if (i%ncol == 0) {
						result += '0x' + padLeft(offset.toString(16), '0', 8) + ' :';
					} result += ' ' + padLeft(this.getByte(offset).toString(16), '0', 2)
								  + padLeft(this.getByte(offset+1).toString(16), '0', 2);
					if (i%ncol == (ncol - 1)) {
						result += '\n';
					}
				} return result;
			},
			// dump to array, length in bytes unpacked dump
			dumpToBuffer : function (start, length, buffer) {
				var si = start,
					ei = si + length, j = 0;
				for (;si < ei;si++,j++) {
					buffer[j] = this.getByte(si);
				}
			}, importAsm : function (asmResult) {
				var i, j, n, si, ei; si = asmResult.dataStart; ei = si + asmResult.dataSize; for (i = si, j = 0;i < ei;i+=4,j++) {
					this.setWord(i, asmResult.dataMem[j]);
				} si = asmResult.textStart; ei = si + asmResult.textSize; for (i = si, j = 0;i < ei;i+=4,j++) {
					this.setWord(i, asmResult.textMem[j]);
				}
			}
		});

		return Memory;
	})(); exports.Memory = Memory;


})();