var CONST_ELF_TYPES = {
   ET_NONE:0,
   ET_REL:1,
   ET_EXEC:2,
   ET_DYN:3,
   ET_CORE:4,
   ET_LOPROC:0xff00,
   ET_HIPROC:0xffff,
   Elf32_Addr:4,
   Elf32_Half:2,
   Elf32_Off:4,
   Elf32_Sword:4,
   Elf32_Word:4
};

var CONST_ELF_CLASS = {
   E_CLASS32:1,
   E_CLASS64:2
};

var CONST_ELF_END = {
   ED_LTL:1,
   ED_BIG:2
};

var CONST_ELF_CLASS = {
   EI_OSABI_SYSV:0,
   EI_OSABI_HPUX:1,
   EI_OSABI_NETBSD:2,
   EI_OSABI_LINUX:3,
   EI_OSABI_SOLARIS:6,
   EI_OSABI_AIX:7,
   EI_OSABI_IRIX:8,
   EI_OSABI_FREEBSD:9,
   EI_OSABI_OPENBSD:12
};

var CONST_ELF_ARCH = {
   EM_SPARC:2,
   EM_X86:3,
   EM_MIPS:8,
   EM_POWERPC:20,
   EM_ARM:40,
   EM_SUPERH:42,
   EM_IA64:50,
   EM_X86_64:62,
   EM_ARCH64:183
};

var CONST_ELF_HDR = {
   SHT_NULL     : 0,
   SHT_PROGBITS : 1,
   SHT_SYMTAB   : 2,
   SHT_STRTAB   : 3,
   SHT_RELA     : 4,
   SHT_HASH     : 5,
   SHT_DYNAMIC  : 6,
   SHT_NOTE     : 7,
   SHT_NOBITS   : 8,
   SHT_REL      : 9,
   SHT_SHLIB    : 10,
   SHT_DYNSYM   : 11,
   SHT_LOPROC   : 0x70000000,
   SHT_HIPROC   : 0x7fffffff,
   SHT_LOUSER   : 0x80000000,
   SHT_HIUSER   : 0xffffffff
};

var ELF = (function () {
   var my = {};
   var ElfData;
   var ElfDataIdx;
   var RawElfData ;
   var RawElfDataIdx;
   var ElfProgLen;
   var curLine ; // nothing loaded/read yet or exhausted
   var littleEndian;
   
   my.readItemFrom = function() { // read " to "
      var istr = "";
      var i = this.RawElfDataIdx;
      var c = this.RawElfData[i];
      var l = this.RawElfData.length;
      do {
         //console.log("readItemFrom1: i:"+i+" c:"+c);
         i++;
         c = this.RawElfData[i];
      } while (c !== '"' && i <= l);
      i++;
      c = this.RawElfData[i];
      // read till end
      while (c !== '"' && i <= l) {
         //console.log("readItemFrom2: i:"+i+" c:"+c+" istr:"+istr);
         istr += c;
         i++;
         c = this.RawElfData[i];
      }
      this.RawElfDataIdx = i;
      //console.log("RawElfDataIdx:"+this.RawElfDataIdx);
      console.log("readItemFrom:"+istr+" L:"+l);
      return istr;
   }

   my.loadElfDataFromRaw = function(rdata) {
      curLine = 1;
      var i = 0;
      var rdLen = rdata.length;
      while (i<rdLen) {
         var c = rdata[i];
         var ival = 0;
         do {
            if (c >= '0' && c <= '9') {
               ival *= 16;
               ival += c - '0';
            }
            if (c >= 'a' && c <= 'f') {
               ival *= 16;
               ival += (c.charCodeAt(0) - 'a'.charCodeAt(0)) + 10;
            }
            if (c >= 'A' && c <= 'F') {
               ival *= 16;
               ival += (c.charCodeAt(0) - 'a'.charCodeAt(0)) + 10;
            }
            i++;
            c = rdata[i];
         } while (c !== ' ' && i<rdLen);
         this.ElfData[this.ElfDataIdx] = ival;
         this.ElfDataIdx++;
         console.log("ElfDataIdx:"+this.ElfDataIdx+" ival:"+ival);
         i++;
      }
   }

   my.readLineFrom = function() {
      // RawElfData should be loaded w/ JSON data,
      var itemVar = my.readItemFrom();
      if (itemVar === "length") {
        this.ElfProgLen = my.readItemFrom();
        itemVar = my.readItemFrom();
      }
      if (itemVar === "data") {
        itemVar = my.readItemFrom();
      }
      my.loadElfDataFromRaw(itemVar);
   };

   my.readByte = function (idx) {
      if (curLine === -1 || idx >= this.ElfDataIdx) {
         my.readLineFrom();
      }
      var item = this.ElfData[idx];
      console.log("i:"+idx+" b:"+item);
      return item;
   };
   my.readWord = function (idx) {
      var wordv = my.readByte(idx + 1);
      wordv = wordv << 8;
      wordv = wordv | my.readByte(idx);
      return wordv;
   };
   my.readLong = function (idx) {
      var longv = my.readWord(idx + 2);
      longv = longv << 16;
      longv = longv | my.readWord(idx);
      return longv;
   };

   my.parseElfHeader = function (idx) {
     // 16 for eident
     var hdrStr = "";
     for (i=1; i<4; i++) {
        hdrStr += String.fromCharCode(my.readByte(i));
     }
     console.log(hdrStr);
     if (hdrStr !== "ELF") {
        return false;
     }
     var index = 16;
     var e_type = my.readWord(index);
     index += CONST_ELF_TYPES.Elf32_Half;
     console.log("e_type:" + e_type);

     var e_machine = my.readWord(index);
     index += CONST_ELF_TYPES.Elf32_Half;
     console.log("e_machine:" + e_machine);

     var e_version = my.readLong(index);
     index += CONST_ELF_TYPES.Elf32_Word;
     console.log("e_version:" + e_version);

     var e_entry = my.readLong(index);
     index += CONST_ELF_TYPES.Elf32_Addr;
     console.log("e_entry:" + e_entry);

     var e_phoff = my.readLong(index);
     index += CONST_ELF_TYPES.Elf32_Off;
     console.log("e_phoff:" + e_phoff);

     var e_shoff = my.readLong(index);
     index += CONST_ELF_TYPES.Elf32_Off;
     console.log("e_shoff:" + e_shoff);

     var e_flags = my.readLong(index);
     index += CONST_ELF_TYPES.Elf32_Word;
     console.log("e_flags:" + e_flags);

     var e_ehsize = my.readWord(index);
     index += CONST_ELF_TYPES.Elf32_Half;
     console.log("e_ehsize:" + e_ehsize);

     var e_phentsize = my.readWord(index);
     index += CONST_ELF_TYPES.Elf32_Half;
     console.log("e_phentsize:" + e_phentsize);

     var e_phnum = my.readWord(index);
     index += CONST_ELF_TYPES.Elf32_Half;
     console.log("e_phnum:" + e_phnum);

     var e_shentsize = my.readWord(index);
     index += CONST_ELF_TYPES.Elf32_Half;
     console.log("e_shentsize:" + e_shentsize);

     var e_shnum = my.readWord(index);
     index += CONST_ELF_TYPES.Elf32_Half;
     console.log("e_shnum:" + e_shnum);

     var e_shstrndx = my.readWord(index);
     index += CONST_ELF_TYPES.Elf32_Half;
     console.log("e_shstrndx:" + e_shstrndx);

     return true;
   };
   my.parseElfSection = function (idx) {};
   my.parseElfStrings = function (idx) {};
   my.parseElfSymbols  = function (idx) {};
   my.parseElf = function () {
      this.ElfData = new Uint8Array(window.memory);
      console.log("parseElf called");
      RawElfData = $("#elf").text();
      //console.log(RawElfData);
      var ElfOK = my.parseElfHeader(0);  // idx = 0 for start of file
      if (!ElfOK) {
         return false;
      }
      return true;
   };
   (function () {
      this.ElfData = [];
      this.ElfDataIdx = 0;
      this.RawElfData = [];
      this.RawElfDataIdx = 0;
      this.ElfProgLen = 0;
      this.curLine = -1; // nothing loaded/read yet or exhausted
      this.littleEndian = 0;
      $("#source").load("adc.lst");
      $("#elf").load("adc.json", function() { var parse = my.parseElf(); if (!parse) { console.log("not a good elf file"); } });
   })();
   return my;
}());