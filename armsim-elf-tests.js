QUnit.test( "elf loader test", function( assert ) {
   // load test data {"length":"00000313"},
   //                {"data":"7f 45 4c 46 01 01 01 00 00 00 00 00 00 00 00 00"},
   ELF.ElfData = [];
   ELF.ElfDataIdx = 0;
   ELF.RawElfData = [];
   ELF.RawElfDataIdx = 0;
   ELF.ElfProgLen = 0;
   ELF.curLine = -1; // nothing loaded/read yet or exhausted
   ELF.RawElfDataIdx = 0;
   ELF.ElfData = new Uint8Array(window.memory);
   var vdata = "7f 45 4c 46 01 01 01 00 00 00 00 00 00 00 00 11";
   ELF.RawElfData = '{"length":"00000313"},{"data":"' + vdata + '"},';
   assert.equal( ELF.readItemFrom(), "length", "Value" );
   assert.equal( ELF.readItemFrom(), "00000313", "Value" );
   assert.equal( ELF.readItemFrom(), "data", "Value" );
   assert.equal( ELF.readItemFrom(), vdata, "Value" );
   ELF.ElfData = [];
   ELF.ElfDataIdx = 0;
   ELF.RawElfData = [];
   ELF.RawElfDataIdx = 0;
   ELF.ElfProgLen = 0;
   ELF.curLine = -1; // nothing loaded/read yet or exhausted
   ELF.RawElfDataIdx = 0;
   ELF.ElfData = new Uint8Array(window.memory);
   ELF.RawElfData = '{"length":"00000313"},{"data":"' + vdata + '"},';
   ELF.readLineFrom();
   assert.equal( ELF.ElfData[0], 0x7f, "data");
   assert.equal( ELF.ElfData[15], 0x11, "data");
   // see if reading byte from end exits cleanly
   for (i=0; i<16; i++) {
      x = ELF.readByte(i);
      console.log("test exit - i:"+i+" x:"+x);
   }
   y = ELF.readByte(16);
   console.log("test exit - i:"+16+" x:"+y);
   y = ELF.readByte(17);
   console.log("test exit - i:"+17+" x:"+y);
   // now do the big file
});
