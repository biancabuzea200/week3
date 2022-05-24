//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected
const chai = require('chai');
const { resolve } = require('path');
const F1Field = require('ffjavascript').F1Field;
const Scalar = require('ffjavascript').Scalar;
exports.p = Scalar.fromString(
  '21888242871839275222246405745257275088548364400416034343698204186575808495617',
);
const Fr = new F1Field(exports.p);

const wasm_tester = require('circom_tester').wasm;
const buildPoseidon = require('circomlibjs').buildPoseidon;

const assert = chai.assert;

describe('MastermindVariation test', function () {
  let Poseidon ;
  let GenHas;
  
  this.timeout(100000);

  before(async () => {
    
    Poseidon  = await buildPoseidon();
    GenHas = Poseidon .F;
    
  });
  

  it('Should pass and be correct', async () => {
    const circuit = await wasm_tester(resolve('./contracts/circuits/MastermindVariation.circom'),
    );

    const res = Poseidon ([78,7,4,5]);

    let witness;
    witness = await circuit.calculateWitness(
      {
        pubGuessA: 1,
        pubGuessB: 2,
        pubGuessC: 3,
        privSolnA: 7,
        privSolnB: 4,
        privSolnC: 5,
        pubNumHit: 0,
        pubNumBlow: 0,
        pubSolnHash: GenHas.toObject(res),
        privSalt: 78,
      },
      true,
    );

    assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    assert(GenHas.eq(GenHas.e(witness[1]), GenHas.e(res)));
    await circuit.assertOut(witness, { solnHashOut: GenHas.toObject(res) });
    await circuit.checkConstraints(witness);
  });
});