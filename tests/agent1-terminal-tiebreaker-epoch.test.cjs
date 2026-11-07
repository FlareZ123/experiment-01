'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {publicSnapshot}=require('../simulation/twinleaf/terminal-transition.cjs');
const {classifyTerminalCause,summarizeTerminalCauses}=
  require('../simulation/evaluation/terminal-cause-evidence.cjs');

/**
 * An artificial detached aggregate, not an executable tiebreaker game.
 * @param {0|1} winner Claimed native winner seat.
 * @param {{suddenBefore?:boolean,suddenAfter?:boolean,
 *   omitBefore?:boolean,omitAfter?:boolean,prizes?:number[]}} [opts]
 * @returns {object}
 */
function ending(winner,opts={}){
  const before={
    phase:3,turn:12,activePlayer:1,winner:-1,
    suddenDeath:opts.suddenBefore??false,
    players:[
      {deckRemaining:20,prizesRemaining:6,inPlayPokemon:2},
      {deckRemaining:23,prizesRemaining:6,inPlayPokemon:2}
    ]
  };
  const after={
    phase:7,turn:12,activePlayer:1,winner,
    suddenDeath:opts.suddenAfter??false,
    players:before.players.map((player,seat)=>({
      ...player,prizesRemaining:opts.prizes?.[seat]??(seat===winner?0:6)
    }))
  };
  if(opts.omitBefore)delete before.suddenDeath;
  if(opts.omitAfter)delete after.suddenDeath;
  return {status:'engine-terminal',engineWinner:winner,
    terminalTransition:{evidenceType:'observed-engine-terminal-transition-v1',
      before,after}};
}

test('public Store snapshot captures tiebreaker state without hidden cards',()=>{
  const player=()=>({
    deck:{cards:[{},{}]},hand:{cards:[{}]},
    prizes:[{cards:[{}]},{cards:[]}],
    active:{getPokemonCard:()=>({name:'Basic'})},
    bench:[{getPokemonCard:()=>null}]
  });
  const s=publicSnapshot({
    phase:7,turn:24,activePlayer:0,winner:0,isSuddenDeath:true,
    players:[player(),player()]
  });
  assert.equal(s.suddenDeath,true);
  assert.equal(s.players[0].prizesRemaining,1);
  assert.equal(s.players[0].inPlayPokemon,1);
  assert.equal(s.players[1].deckRemaining,2);
  assert.equal('cards' in s.players[0],false);
  assert.equal(JSON.stringify(s).includes('Basic'),false);
  assert.equal(publicSnapshot({...{
    phase:3,turn:1,activePlayer:1,winner:-1,isSuddenDeath:false,
    players:[player(),player()]
  }}).suddenDeath,false);
});

test('tiebreaker native reported winner is quarantined regardless of seat',()=>{
  for(const seat of [0,1]){
    const row=ending(seat,{suddenBefore:true,suddenAfter:true});
    assert.deepEqual(classifyTerminalCause(row),{
      status:'tiebreaker-batch-adjudication-unresolved',
      conditions:[],engineWinner:seat
    });
  }
});

test('tie and opposite pending-Prize lead cannot be certified as winner',()=>{
  for(const seat of [0,1]){
    const tied=ending(seat,{suddenBefore:true,
      prizes:[6,6]});
    assert.equal(classifyTerminalCause(tied).status,
      'tiebreaker-batch-adjudication-unresolved');
    const wrong=ending(seat,{suddenAfter:true,
      prizes:seat===0?[6,5]:[5,6]});
    assert.equal(classifyTerminalCause(wrong).status,
      'tiebreaker-batch-adjudication-unresolved');
  }
});

test('transition entering or leaving tiebreaker still refuses ordinary cause',()=>{
  for(const opts of [{suddenBefore:true,suddenAfter:false},
    {suddenBefore:false,suddenAfter:true}]){
    const result=classifyTerminalCause(ending(0,opts));
    assert.equal(result.status,'tiebreaker-batch-adjudication-unresolved');
    assert.deepEqual(result.conditions,[]);
  }
});

test('archived snapshots missing tiebreaker flag fail closed',()=>{
  for(const opts of [{omitBefore:true},{omitAfter:true},
    {omitBefore:true,omitAfter:true}]){
    const result=classifyTerminalCause(ending(0,opts));
    assert.equal(result.status,'terminal-epoch-unverified');
    assert.deepEqual(result.conditions,[]);
  }
});

test('ordinary complete snapshots retain ordinary sufficient-rule tags',()=>{
  const result=classifyTerminalCause(ending(1));
  assert.deepEqual(result,{
    status:'observed-sufficient-conditions',
    conditions:['winner-took-final-prize'],engineWinner:1
  });
});

test('summary separates known tiebreakers from unknown legacy epochs',()=>{
  const rows=[
    {id:'ordinary',...ending(1)},
    {id:'tiebreaker',...ending(0,{suddenBefore:true,prizes:[6,6]})},
    {id:'legacy',...ending(1,{omitBefore:true})},
    {id:'censored',status:'action-cap-or-incomplete'}
  ];
  const x=summarizeTerminalCauses(rows);
  assert.equal(x.trials,4);
  assert.equal(x.engineTerminals,3);
  assert.equal(x.observedTerminals,1);
  assert.equal(x.unresolvedTerminals,2);
  assert.equal(x.epochUnverified,1);
  assert.equal(x.tiebreakerUnresolved,1);
  assert.equal(x.capped,1);
  assert.equal(x.competitiveGamesQualified,0);
});
