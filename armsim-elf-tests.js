QUnit.test( "elf loader test", function( assert ) {
   ELF.ElfDataIdx = 0;
   ELF.RawElfDataIdx = 0;
   ELF.ElfProgLen = 0;
   ELF.curLine = -1; // nothing loaded/read yet or exhausted
   ELF.RawElfDataIdx = 0;
   ELF.ElfData = new Uint8Array(window.memory);
   var testdata = "{\"0\":[127,69,76,70,1,1,1,0,0,0,0,0,0,0,0,0],\"16\":[2,0,40,0,1,0,0,0,116,128,0,0,52,0,0,0]}";
   // basic method test
   var pjson = JSON.parse(testdata);
   assert.equal(JSON.stringify(pjson), testdata, "basic method");
   // basic method in ELF 
   ELF.RawElfData = testdata;
   ELF.parseJSON();
   var odata = JSON.stringify(ELF.ElfData);
   assert.equal(odata, testdata, "basic method in ELF");

   // see what's objects are generated, get the array from addr 16
   var rdata = ELF.ElfData[16];
   assert.equal(rdata[2], 40, "pull addr 16's 3rd byte");

   // test individual elements
   var arr = ELF.ElfData[0]; // "address" - 0
   assert.equal( arr[0], 0x7f, "data check idx 0");
   assert.equal( arr[5], 0x01, "data check idx 5");
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
   ELF.init("http://localhost:3000/convert?file=/Users/jsymolon/arm/adc.elf&type=json"); // loads off of the URL
   console.log(ELF);
   assert.equal(ELF.e_type, "", "");
});
