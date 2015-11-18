// Follows basic module pattern
// http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html

// HDR Identification Indexes 
var CONST_ELF_HDR_IDX = {
    EI_MAG0: 0,
    EI_MAG1: 1,
    EI_MAG2: 2,
    EI_MAG3: 3,
    EI_CLASS: 4,
    EI_DATA: 5,
    EI_VERSION: 6,
    EI_PAD: 7,
    EI_NIDENT: 16
};

var CONST_ELF_TYPES = {
    ET_NONE: 0,
    ET_REL: 1,
    ET_EXEC: 2,
    ET_DYN: 3,
    ET_CORE: 4,
    ET_LOPROC: 0xff00,
    ET_HIPROC: 0xffff,
    PT_NULL: 0,
    PT_LOAD: 1,
    PT_DYNAMIC: 2,
    PT_INTERP: 3,
    PT_NOTE: 4,
    PT_SHLIB: 5,
    PT_PHDR: 6,
    PT_LOPROC: 0x70000000,
    PT_HIPROC: 0x7fffffff,
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

var CONST_ELF_SEC_HDR = {
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
   my.ElfData = [],
   my.RawElfData = "",
   my.loaded = false, // nothing loaded/read yet or exhausted
   my.littleEndian = 0;
   my.lastAddress = 0;
   my.sections = [];   // array of section objects
   my.psections = [];   // array of section objects
   my.numSections = 0; // number of sections loaded

   // ------------------------------------------------------------
   my.derefSecType = function(stype) {
    if (stype === CONST_ELF_SEC_HDR.SHT_NULL) {
      return "NULL  ";
    }
    if (stype === CONST_ELF_SEC_HDR.SHT_PROGBITS) {
      return "PRGBTS";
    }
    if (stype === CONST_ELF_SEC_HDR.SHT_SYMTAB) {
      return "SYMTAB";
    }
    if (stype === CONST_ELF_SEC_HDR.SHT_STRTAB) {
      return "STRTAB";
    }
    if (stype === CONST_ELF_SEC_HDR.SHT_RELA) {
      return "RELA  ";
    }
    if (stype === CONST_ELF_SEC_HDR.SHT_HASH) {
      return "HASH  ";
    }
    if (stype === CONST_ELF_SEC_HDR.SHT_DYNAMIC) {
      return "DYNA  ";
    }
    if (stype === CONST_ELF_SEC_HDR.SHT_NOTE) {
      return "NOTE  ";
    }
    if (stype === CONST_ELF_SEC_HDR.SHT_NOBITS) {
      return "NOBITS ";
    }
    if (stype === CONST_ELF_SEC_HDR.SHT_REL) {
      return "REL   ";
    }
    if (stype === CONST_ELF_SEC_HDR.SHT_SHLIB) {
      return "SHLIB   ";
    }
    if (stype === CONST_ELF_SEC_HDR.SHT_DYNSYM) {
      return "DYNSYM";
    }
    if (stype === CONST_ELF_SEC_HDR.SHT_LOPROC) {
      return "LOPROC";
    }
    if (stype === CONST_ELF_SEC_HDR.SHT_HIPROC) {
      return "HIPROC";
    }
    if (stype === CONST_ELF_SEC_HDR.SHT_LOUSER) {
      return "LOUSER";
    }
    if (stype === CONST_ELF_SEC_HDR.SHT_HIUSER) {
      return "HIUSER";
    }
  };

   // ------------------------------------------------------------
   my.parseJSON = function() {
    console.log("parseJSON");
    jsonData = JSON.parse(my.RawElfData);
    var addr = 0;
    var dArray = 0;
    do {
      elfData = jsonData[addr];
      //console.log("parseJSON addr:" + addr + " data:" + elfData);
      if (elfData !== undefined) {
        // import
        var baseAddr = addr;
        var idx = 0;
        do {
          var byteVal = elfData[idx]
          if (byteVal === undefined) {
            byteVal = 0;
          }
          my.ElfData[baseAddr + idx] = elfData[idx];
          idx = idx + 1;
        } while (idx < 16);
      }
      addr = addr + 16;
    } while (elfData !== undefined);
   };

   // ------------------------------------------------------------
   my.readByte = function(idx) {
      var item = my.ElfData[idx];
      //console.log("i:"+idx+" b:"+item);
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

   // ------------------------------------------------------------
   my.parseSection32 = function (i, index) {
     var sec = {};
     sec.sh_name = my.readLong(index);
     index += CONST_ELF_TYPES.Elf32_Word;
     sec.sh_type = my.readLong(index);
     index += CONST_ELF_TYPES.Elf32_Word;
     sec.sh_flags = my.readLong(index);
     index += CONST_ELF_TYPES.Elf32_Word;
     sec.sh_addr = my.readLong(index);
     index += CONST_ELF_TYPES.Elf32_Addr;
     sec.sh_offset = my.readLong(index);
     index += CONST_ELF_TYPES.Elf32_Off;
     sec.sh_size = my.readLong(index);
     index += CONST_ELF_TYPES.Elf32_Word;
     sec.sh_link = my.readLong(index);
     index += CONST_ELF_TYPES.Elf32_Word;
     sec.sh_info = my.readLong(index);
     index += CONST_ELF_TYPES.Elf32_Word;
     sec.sh_addralign = my.readLong(index);
     index += CONST_ELF_TYPES.Elf32_Word;
     sec.sh_entsize = my.readLong(index);
     index += CONST_ELF_TYPES.Elf32_Word;
     var stype = my.derefSecType(sec.sh_type);
     console.log("["+i+"] "+sec.sh_name+" "+stype+" "+sec.sh_addr+" "+sec.sh_offset+" "+sec.sh_size+" "+sec.sh_entsize+" "+sec.sh_flags+" "+sec.sh_link+" "+sec.sh_info+" "+sec.sh_addralign);
     return sec;
   };

   // ------------------------------------------------------------
   my.parseSections = function () {
     // read the section header
     var index = my.e_shoff;
     var nSec = my.e_shnum;
     var secSize = my.e_shentsize;
     console.log("Sections shoff:" + index + " num:" + nSec + " sz:" + secSize);
     console.log("Section Headers");
     console.log("[nr] Name   Type   Addr  Off  Size  ES  Flg Lk Inf Al");
     for (i=0; i<nSec; i += 1) {
       var sec = my.parseSection32(i, index);
       my.sections.push(sec);
       index = index + secSize;
     }
   };

   // ------------------------------------------------------------
   // symbol table
   // st_name = word
   // st_value = addr
   // st_size = word
   // st_info = char
   // st_other = char
   // st_shndx = half

   // ------------------------------------------------------------
   my.loadSymbols = function (sym_dict) {
    // 1st index [0] is null, null termination strings
    var numSec = my.sections.length;
    for (var i = 0; i < numSec; i++) {
      if (my.sections[i].e_type === CONST_ELF_SEC_HDR.SHT_STRTAB) {
        // deref the name and if === ".strtab"
        //
        return {};
      }
    }
   };

   // ------------------------------------------------------------
   my.loadProgHdr = function (i, index) {
    var hdr = {};
    hdr.p_type = my.readLong(index);
    index += CONST_ELF_TYPES.Elf32_Word;
    hdr.p_offset = my.readLong(index);
    index += CONST_ELF_TYPES.Elf32_Off;
    hdr.p_vaddr = my.readLong(index);
    index += CONST_ELF_TYPES.Elf32_Addr;
    hdr.p_paddr = my.readLong(index);
    index += CONST_ELF_TYPES.Elf32_Addr;
    hdr.p_filesz = my.readLong(index);
    index += CONST_ELF_TYPES.Elf32_Word;
    hdr.p_memsz = my.readLong(index);
    index += CONST_ELF_TYPES.Elf32_Word;
    hdr.p_flags = my.readLong(index);
    index += CONST_ELF_TYPES.Elf32_Word;
    hdr.p_align = my.readLong(index);
    index += CONST_ELF_TYPES.Elf32_Word;
    console.log("["+i+"] "+hdr.p_type+" "+hdr.p_offset+" "+hdr.p_vaddr+" "+hdr.p_paddr+" "+hdr.p_filesz+" "+hdr.p_memsz+" "+hdr.p_flags+" "+hdr.p_align);
    return hdr;
   };

   // ------------------------------------------------------------
   my.parseProgHdrs = function () {
     // read the section header
     var index = my.e_phoff;
     var nHdr = my.e_phnum;
     var pSize = my.e_phentsize;
     console.log("Program Headers");
     console.log("Type Offset VirtAddr PhyAddr FileSz MemSz F Align");
     for (i=0; i<nHdr; i += 1) {
       var hdr = my.loadProgHdr(i, index);
       my.psections.push(hdr);
       index = index + pSize;
     }
   };

   // ------------------------------------------------------------
   // called after parseElf and from parent w/ ptr to memory
   my.loadProgBits = function (memory_arr) {
    // load the section w/ progbits data
    var numSec = my.sections.length;
    var elfindx = 0;
    var len = 0;
    for (var i = 0; i < numSec; i++) {
      if (my.sections[i].sh_type === CONST_ELF_SEC_HDR.SHT_PROGBITS) {
        var ssec = my.sections[i];
        elfindx = ssec.sh_offset;
        len = ssec.sh_size;
      }
    }
    // load the program section for data
    numSec = my.psections.length;
    for (var i = 0; i < numSec; i++) {
      if (my.sections[i].e_type === CONST_ELF_SEC_HDR.PT_LOAD) {
        var hdrsec = my.psections[i];
        var prog_addr = hdrsec.p_paddr;
        //console.log("PT_LOAD e ix:"+elfindx+" l:"+len+" paddr:"+prog_addr);
        for (var j = prog_addr; j < prog_addr+len; j++) {
          var b = my.ElfData[elfindx]; //my.readByte[elfindx];
          memory_arr[j] = b;
          //console.log("elfindx:"+elfindx+" j:"+j+" "+" = "+b);
          elfindx = elfindx + 1;
        }
      }
    }
   };

   // ------------------------------------------------------------
   my.parseElfHdr32 = function (index) {
     my.e_phoff = my.readLong(index);
     index += CONST_ELF_TYPES.Elf32_Off;
     my.e_shoff = my.readLong(index);
     index += CONST_ELF_TYPES.Elf32_Off;
     my.e_flags = my.readLong(index);
     index += CONST_ELF_TYPES.Elf32_Word;
     my.e_ehsize = my.readWord(index);
     index += CONST_ELF_TYPES.Elf32_Half;
     my.e_phentsize = my.readWord(index);
     index += CONST_ELF_TYPES.Elf32_Half;
     my.e_phnum = my.readWord(index);
     index += CONST_ELF_TYPES.Elf32_Half;
     my.e_shentsize = my.readWord(index);
     index += CONST_ELF_TYPES.Elf32_Half;
     my.e_shnum = my.readWord(index);
     index += CONST_ELF_TYPES.Elf32_Half;
     my.e_shstrndx = my.readWord(index);
     index += CONST_ELF_TYPES.Elf32_Half;
     return index;
   };

   my.parseElfHdr64 = function (index) {
      console.log("No ELF HDR 64 done");
      alert("No ELF HDR 64 done");
      return index;
   };

   my.parseElfHeader = function () {
     // 16 for eident
     var hdrStr = "";
     var i = 0;
     for (i=1; i<4; i += 1) {
        hdrStr += String.fromCharCode(my.readByte(i));
     }
     if (hdrStr !== "ELF") {
        return false;
     }
     // header before 32/64 split
     my.ei_class = my.readByte(CONST_ELF_HDR_IDX.EI_CLASS);
     my.ei_data = my.readByte(CONST_ELF_HDR_IDX.EI_DATA);
     my.ei_version = my.readByte(CONST_ELF_HDR_IDX.EI_VERSION);
     var index = 16;
     my.e_type = my.readWord(index);
     index += CONST_ELF_TYPES.Elf32_Half;
     my.e_machine = my.readWord(index);
     index += CONST_ELF_TYPES.Elf32_Half;
     my.e_version = my.readLong(index);
     index += CONST_ELF_TYPES.Elf32_Word;
     my.e_entry = my.readLong(index);
     index += CONST_ELF_TYPES.Elf32_Addr;
     if (my.ei_data === CONST_ELF_CLASS.E_CLASS32) {
       console.log("HDR ei_data is 32 bit");
       index = my.parseElfHdr32(index);
     } else {
       console.log("HDR ei_data is 64 bit");
       index = my.parseElfHdr64(index);
     }
     if (my.e_phoff != 0) {
       my.parseProgHdrs();
     }
     my.parseSections();
     return true;
   };

   // ------------------------------------------------------------
   my.parseElf = function () {
      console.log("parseElf called");
      var ElfOK = my.parseElfHeader(0);  // idx = 0 for start of file
      if (!ElfOK) {
         return false;
      }
      return true;
   };

   // ------------------------------------------------------------
   my.dumpSections = function () {
      console.log("dumpSections called");
    };

   // ------------------------------------------------------------
   my.init = function (url) {
      my.ElfData = [];
      my.RawElfData = [];
      my.loaded = false; // nothing loaded/read yet or exhausted
      my.littleEndian = 0;
      my.lastAddress = 0;
      my.ElfData = new Uint8Array(window.memory);
      //$("#source").load("adc.lst");
      //$("#elf").load("adc.json", function() { var parse = my.parseElf(); if (!parse) { console.log("not a good elf file"); } });
      console.log("ELF init URL:" + url);
      $.getJSON(url, function( data ) {
        my.RawElfData = JSON.stringify(data);
        console.log("ELF init data:"+my.RawElfData);
        my.parseJSON();
        var parse = my.parseElf(); 
        if (!parse) { console.log("not a good elf file"); }
      });
   }
   return my;
}());