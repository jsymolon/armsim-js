alert("Instructions:" & Instructions);
QUnit.test( "instructions test", function( assert ) {
  assert.ok( Instructions.getInstrBits(0) === 0x02000000, "Passed!" );
  assert.equal( Instructions.getInstrBits(0), 0x02000000, "Passed!" );
});
