QUnit.test( "memory test", function( assert ) {
   for (i = 0; i < 258; i++) {
      Memory.setByte(i, i);
   }
  assert.equal( Memory.getByte(0), 0, "Zero" );
  assert.equal( Memory.getByte(1), 1, "One" );
  assert.equal( Memory.getByte(128), 128, "128" );
  assert.equal( Memory.getByte(255), 255, "255" );
  assert.equal( Memory.getByte(256), 0, "256" ); // Byte limits 0-255, wraps around
  assert.equal( Memory.getByte(257), 1, "257" );
  Memory.setWord(258, 0x100);
  assert.equal( Memory.getWord(258), 0x100, "0x100" );
  Memory.setWord(260, 0xFFFF);
  assert.equal( Memory.getWord(260), 0xFFFF, "0xFFFF" );
  Memory.setLong(270, 0x01FF0102);
  assert.equal( Memory.getLong(270), 0x01FF0102, "0x01FF0102" );
  assert.equal( Memory.getWord(270), 0x0102, "0x0102" );
  assert.equal( Memory.getWord(272), 0x01FF, "0x01FF" );
  Memory.setLong(264, 0x12345678);
  assert.equal( Memory.getByte(267), 0x12, "264 -  18" ); //18
  assert.equal( Memory.getByte(266), 0x34, "265 -  52" ); //52
  assert.equal( Memory.getByte(265), 0x56, "266 -  86" ); //86
  assert.equal( Memory.getByte(264), 0x78, "267 - 120" ); //120
  assert.equal( Memory.getLong(264), 0x12345678, "0x12345678" );
});
