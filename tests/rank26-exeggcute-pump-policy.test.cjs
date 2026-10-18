'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {exeggcutePumpMoves,eligiblePumpTurn}=
  require('../simulation/twinleaf/rank26-exeggcute-pump-policy.cjs');

/** @param {string|null} name @param {number} damage */
function slot(name,damage){
  return {damage,getPokemonCard(){return name?{name}:null;}};
}

/** @returns {object} */
function sourceBoard(){
  const own={
    id:101,
    bench:[
      slot('Unown',20),
      slot('Squawkabilly ex',20),
      slot('Dedenne-GX',20),
      slot('Exeggcute',20),
      slot('Exeggcute',20)
    ]
  };
  Object.defineProperty(own,'deck',{
    get(){throw new Error('K0 deck access forbidden');}
  });
  Object.defineProperty(own,'prizes',{
    get(){throw new Error('Face-down Prize access forbidden');}
  });
  return own;
}

test('single damaged donor supports exact two-Egg KO of visible source board',()=>{
  const own=sourceBoard();
  const result=exeggcutePumpMoves(own,3,5,6);
  assert.equal(result.length,2);
  assert.deepEqual(result,[
    {from:{player:3,slot:5,index:0},to:{player:3,slot:5,index:3}},
    {from:{player:3,slot:5,index:0},to:{player:3,slot:5,index:4}}
  ]);
});

test('two one-counter donors cannot be combined; one Egg KO is still legal',()=>{
  const own=sourceBoard();
  own.bench[0].damage=10;
  own.bench[1].damage=10;
  own.bench[2].damage=0;
  assert.deepEqual(exeggcutePumpMoves(own,3,5,6),[
    {from:{player:3,slot:5,index:0},to:{player:3,slot:5,index:3}}
  ]);
});

test('single damaged egg permits a single-counter KO from one donor',()=>{
  const own=sourceBoard();
  own.bench[0].damage=10;
  own.bench[1].damage=0;
  own.bench[2].damage=0;
  own.bench[4].damage=0;
  const moves=exeggcutePumpMoves(own,3,5,6);
  assert.equal(moves.length,1);
  assert.deepEqual(moves[0],{
    from:{player:3,slot:5,index:0},to:{player:3,slot:5,index:3}
  });
});

test('normal opponent and missing printed damaged egg fail closed',()=>{
  const own=sourceBoard();
  own.bench[3]=slot('Regidrago V',20);
  own.bench[4]=slot(null,0);
  assert.equal(exeggcutePumpMoves(own,3,5,6),null);
  assert.equal(eligiblePumpTurn({turn:1,activePlayer:0,phase:7,players:[own]},own,0,7),true);
  assert.equal(eligiblePumpTurn({turn:2,activePlayer:0,phase:7,players:[own]},own,0,7),false);
});

test('two Eggs and one donor counter select only the available single KO',()=>{
  const own=sourceBoard();
  own.bench[0].damage=10;
  own.bench[1].damage=0;
  own.bench[2].damage=0;
  assert.deepEqual(exeggcutePumpMoves(own,3,5,6),[
    {from:{player:3,slot:5,index:0},to:{player:3,slot:5,index:3}}
  ]);
});

test('prefer a two-counter donor later on Bench to score both legal Egg KOs',()=>{
  const own=sourceBoard();
  own.bench[0].damage=10;
  assert.deepEqual(exeggcutePumpMoves(own,3,5,6),[
    {from:{player:3,slot:5,index:1},to:{player:3,slot:5,index:3}},
    {from:{player:3,slot:5,index:1},to:{player:3,slot:5,index:4}}
  ]);
});

test('stop at one opponent Prize and limit the fifth self-KO to one',()=>{
  const own=sourceBoard();
  assert.equal(exeggcutePumpMoves(own,3,5,1),null);
  assert.deepEqual(exeggcutePumpMoves(own,3,5,2),[
    {from:{player:3,slot:5,index:0},to:{player:3,slot:5,index:3}}
  ]);
  assert.equal(exeggcutePumpMoves(own,3,5,0),null);
});

test('damaged eggs alone cannot pay for this conservative donor policy',()=>{
  const own=sourceBoard();
  own.bench[0].damage=0;
  own.bench[1].damage=0;
  own.bench[2].damage=0;
  assert.equal(exeggcutePumpMoves(own,3,5,6),null);
});
