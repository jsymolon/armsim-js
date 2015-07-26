// memory
var Memory = (function () {
   var my = {};
   my.setByte = function (address, bytev) {
      var uint8s = new Uint8Array(window.memory);
      uint8s[address] = bytev;
   };
   my.getByte = function (address) {
      var uint8s = new Uint8Array(window.memory);
      return uint8s[address];
   };
   my.setWord = function (address, wordv) {
      var uint8s = new Uint8Array(window.memory);
      var wlo = wordv & 0xFF;
      uint8s[address] = wlo;
      var whi = (wordv & 0xFF00) >> 8;
      uint8s[address + 1] = whi;
   };
   my.getWord = function (address) {
      var uint8s = new Uint8Array(window.memory);
      var wordv = uint8s[address] | (uint8s[address + 1] << 8);
      return wordv;
   };
   my.setLong = function (address, longv) {
      var uint8s = new Uint8Array(window.memory);
      var wlo = longv & 0xFFFF;
      my.setWord(address, wlo);
      var whi = (longv & 0xFFFF0000) >> 16;
      my.setWord(address + 2, whi);
   };
   my.getLong = function (address) {
      var uint8s = new Uint8Array(window.memory);
      var longv = my.getWord(address + 2);
      longv = longv << 16;
      longv = longv | my.getWord(address);
      return longv;
   };
   (function () {
      window.memory = new ArrayBuffer(1048576);
   })();
   return my;
}());