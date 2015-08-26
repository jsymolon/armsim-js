QUnit.test( "elf loader test", function( assert ) {
   ELF.ElfDataIdx = 0;
   ELF.RawElfDataIdx = 0;
   ELF.ElfProgLen = 0;
   ELF.curLine = -1; // nothing loaded/read yet or exhausted
   ELF.RawElfDataIdx = 0;
   ELF.ElfData = new Uint8Array(window.memory);
   var testdata = "{\"0\":[127,69,76,70,1,1,1,0,0,0,0,0,0,0,0,0],\"16\":[]}";
   ELF.RawElfData = testdata;
   //ELF.readLineFrom();
   ELF.parseJSON();
   var odata = JSON.stringify(ELF.ElfData);
   assert.equal(odata, testdata, "hash");
   
   // test individual elements
   var arr = ELF.ElfData[0]; // "address" - 0
   assert.equal( arr[0], 0x7f, "data");
   assert.equal( arr[5], 0x01, "data");
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
   my elf = new ELF();
});
