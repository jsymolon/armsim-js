// Follows basic module pattern
// http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html
var CONST_ELF_TYPES = {
    ET_NONE: 0,
    ET_REL: 1,
    ET_EXEC: 2,
    ET_DYN: 3,
    ET_CORE: 4,
    ET_LOPROC: 0xff00,
    ET_HIPROC: 0xffff,
    Elf32_Addr: 4,
    Elf32_Half: 2,
    Elf32_Off: 4,
    Elf32_Sword: 4,
    Elf32_Word: 4
};

var CONST_ELF_CLASS = {
    E_CLASS32: 1,
    E_CLASS64: 2
};

var CONST_ELF_END = {
    ED_LTL: 1,
    ED_BIG: 2
};

var CONST_ELF_SYSTEM = {
    EI_OSABI_SYSV: 0,
    EI_OSABI_HPUX: 1,
    EI_OSABI_NETBSD: 2,
    EI_OSABI_LINUX: 3,
    EI_OSABI_SOLARIS: 6,
    EI_OSABI_AIX: 7,
    EI_OSABI_IRIX: 8,
    EI_OSABI_FREEBSD: 9,
    EI_OSABI_OPENBSD: 12
};

var CONST_ELF_ARCH = {
    EM_SPARC: 2,
    EM_X86: 3,
    EM_MIPS: 8,
    EM_POWERPC: 20,
    EM_ARM: 40,
    EM_SUPERH: 42,
    EM_IA64: 50,
    EM_X86_64: 62,
    EM_ARCH64: 183
};

var CONST_ELF_HDR = {
    SHT_NULL: 0,
    SHT_PROGBITS: 1,
    SHT_SYMTAB: 2,
    SHT_STRTAB: 3,
    SHT_RELA: 4,
    SHT_HASH: 5,
    SHT_DYNAMIC: 6,
    SHT_NOTE: 7,
    SHT_NOBITS: 8,
    SHT_REL: 9,
    SHT_SHLIB: 10,
    SHT_DYNSYM: 11,
    SHT_LOPROC: 0x70000000,
    SHT_HIPROC: 0x7fffffff,
    SHT_LOUSER: 0x80000000,
    SHT_HIUSER: 0xffffffff
};

var ELF = (function() {
   var my = {};
   my.ElfData = "",
   my.RawElfData = "",
   my.loaded = false, // nothing loaded/read yet or exhausted
   my.littleEndian = 0;
   my.lastAddress = 0;

   my.parseJSON = function() {
      my.ElfData = JSON.parse(my.RawElfData);
   };

   my.readByte = function(idx) {
      var item = my.ElfData[idx];
      console.log("i:"+idx+" b:"+item);
      return item;
   };

   my.readWord = function(idx) {
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

   my.parseElfHeader = function () {
     // 16 for eident
     var hdrStr = "";
     var i = 0;
     for (i=1; i<4; i += 1) {
        hdrStr += String.fromCharCode(my.readByte(i));
     }
     console.log(hdrStr);
     if (hdrStr !== "ELF") {
        return false;
     }
     var index = 16;
     my.e_type = my.readWord(index);
     index += CONST_ELF_TYPES.Elf32_Half;
     console.log("e_type:" + e_type);

     my.e_machine = my.readWord(index);
     index += CONST_ELF_TYPES.Elf32_Half;
     console.log("e_machine:" + e_machine);

     my.e_version = my.readLong(index);
     index += CONST_ELF_TYPES.Elf32_Word;
     console.log("e_version:" + e_version);

     my.e_entry = my.readLong(index);
     index += CONST_ELF_TYPES.Elf32_Addr;
     console.log("e_entry:" + e_entry);

     my.e_phoff = my.readLong(index);
     index += CONST_ELF_TYPES.Elf32_Off;
     console.log("e_phoff:" + e_phoff);

     my.e_shoff = my.readLong(index);
     index += CONST_ELF_TYPES.Elf32_Off;
     console.log("e_shoff:" + e_shoff);

     my.e_flags = my.readLong(index);
     index += CONST_ELF_TYPES.Elf32_Word;
     console.log("e_flags:" + e_flags);

     my.e_ehsize = my.readWord(index);
     index += CONST_ELF_TYPES.Elf32_Half;
     console.log("e_ehsize:" + e_ehsize);

     my.e_phentsize = my.readWord(index);
     index += CONST_ELF_TYPES.Elf32_Half;
     console.log("e_phentsize:" + e_phentsize);

     my.e_phnum = my.readWord(index);
     index += CONST_ELF_TYPES.Elf32_Half;
     console.log("e_phnum:" + e_phnum);

     my.e_shentsize = my.readWord(index);
     index += CONST_ELF_TYPES.Elf32_Half;
     console.log("e_shentsize:" + e_shentsize);

     my.e_shnum = my.readWord(index);
     index += CONST_ELF_TYPES.Elf32_Half;
     console.log("e_shnum:" + e_shnum);

     my.e_shstrndx = my.readWord(index);
     index += CONST_ELF_TYPES.Elf32_Half;
     console.log("e_shstrndx:" + e_shstrndx);

     return true;
   };

   my.parseElf = function () {
      console.log("parseElf called");
      var ElfOK = my.parseElfHeader(0);  // idx = 0 for start of file
      if (!ElfOK) {
         return false;
      }
      return true;
   };

   my.init = function (url) {
      my.ElfData = [];
      my.RawElfData = [];
      my.loaded = false; // nothing loaded/read yet or exhausted
      my.littleEndian = 0;
      my.lastAddress = 0;
      my.ElfData = new Uint8Array(window.memory);
      //$("#source").load("adc.lst");
      //$("#elf").load("adc.json", function() { var parse = my.parseElf(); if (!parse) { console.log("not a good elf file"); } });
      $.get(url, function( data ) {
        console.log(data);
        my.RawElfData = data;
        my.parseJSON();
        var parse = my.parseElf(); 
        if (!parse) { console.log("not a good elf file"); }
        alert( "Load was performed." );
      });
   }
   return my;
}());