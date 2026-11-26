include "llvm/Target/Target.td"

def ToyInstrInfo : InstrInfo;
def Toy : Target {
  let InstructionSet = ToyInstrInfo;
}

def R0 : Register<"r0">;
def R1 : Register<"r1">;
def GPR64 : RegisterClass<"Toy", [i64], 64, (add R0, R1)>;

def SUBrr : Instruction {
  let OutOperandList = (outs GPR64:$dst);
  let InOperandList = (ins GPR64:$lhs, GPR64:$rhs);
  let AsmString = "sub $dst, $lhs, $rhs";
}

def : Pat<(sub GPR64:$lhs, GPR64:$rhs),
          (SUBrr GPR64:$lhs, GPR64:$rhs)>;
