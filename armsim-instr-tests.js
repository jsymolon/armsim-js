QUnit.test( "disassembly test", function( assert ) {
  assert.equal(Instructions.INST_BITS['misc1'], 16777216, "check decode");
  assert.equal(Instructions.getInstrBits('misc1'), 16777216, "check decode");
  Instructions.getCondCode(4026531840);
});

// don't set cond codes
// set cond codes
// imm
// imm w/ shift
// reg
// reg w/ shift
//          cond 00  oooo S nnnn dddd            rrrr
//          3322 222 2222 2 1111 1111 11000000   0000
//          1098 765 4321 0 9876 5432 10987654   3210
//        0b1110 000 0101 0 0010 0011 00001 00 0 0001 #8130A2E0
// code = 0b1110 000 0101 0 0011 0011 00001 00 0 0010 #8230A3E0 ADCAL R3, R2, LSL #1
// code = 0b1110 000 0101 0 0011 0011 00010 00 0 0010 #0231A3E0 ADCAL R3, R2, LSL #2
// code = 0b1110 000 0101 0 0011 0011 00011 00 0 0010 #8231A3E0 ADCAL R3, R2, LSL #3
// code = 0b1110 000 0101 0 0101 0110 00000 00 0 0100 #0460A5E0 ADCAL R6, R5, R4         @ dp imm shift
// code = 0b1110 000 0101 0 0110 0110 0100 0001  0101 #1564A6E0 ADCAL R6, R5, LSL R4  @ dp imm reg shift
// code = 0b1110 001 0101 0 1001 1010 0000 0000  1111 #0FA0A9E2 ADCAL R10, R9, #15        @ dp imm
//        0b1110 001 0101 0 0001 0000 1010 00000001   #010AA1E2 ADCAL R0, R1, #4096
// data processing - immediate shift
// data processing - register shift
// data processing - immediate - rotate
QUnit.test( "adc test", function( assert ) {
  //Instructions.decodeExecInstruction(0xE0A33082, 0);
  assert.equal(Instructions.getDisassemblyText(), "e0a33082 ANDALS R3, R3, LSL #1", "ADC test 1");
  Instructions.decodeExecInstruction(0x0460A5E0, 0);
  assert.equal(Instructions.getDisassemblyText(), " ADCAL R6, R5, R4", "ADC test 2");
  Instructions.decodeExecInstruction(0x1564A6E0, 0);
  assert.equal(Instructions.getDisassemblyText(), " ADCAL R6, R5, LSL R4", "ADC test 3");
  Instructions.decodeExecInstruction(0x0FA0A9E2, 0);
  assert.equal(Instructions.getDisassemblyText(), " ADCAL R10, R9, #15", "ADC test 4");
  Instructions.decodeExecInstruction(0x010AA1E2, 0);
  assert.equal(Instructions.getDisassemblyText(), " ADCAL R0, R1, #4096", "ADC test 5");
});
