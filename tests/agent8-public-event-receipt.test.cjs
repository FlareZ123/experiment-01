'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {publicEventReceipt,VERSION}=
  require('../simulation/twinleaf/agent8-public-event-receipt.cjs');

/** @param {string} fullName @param {number} id */
function card(fullName,id){return {fullName,id};}
/** @param {object|null} top @param {object[]} [stack] */
function slot(top,stack=[]){return {
  cards:[...stack,...(top?[top]:[])],
  getPokemonCard(){return top;}
};}
/** @param {object} active @param {object[]} bench @param {number[]} moved @param {object[]} markers */
function player(active,bench,moved,markers){
  return {
    active,bench,movedToActiveThisTurn:moved,
    marker:{hasMarker:(name,source)=>markers.some(
      m=>m.name===name&&(source===undefined||m.source===source))},
    hand:{cards:[{fullName:'SECRET_OWNER_HAND'}]},
    deck:{cards:[{fullName:'SECRET_OWNER_DECK'}]},
    prizes:[{cards:[{fullName:'SECRET_OWNER_PRIZE'}]}]
  };
}

for(const seat of [0,1])test('receipt respects actual acting seat '+seat,()=>{
  const vmaxA=card('Shadow Rider Calyrex VMAX CRE',100+seat);
  const vmaxB=card('Shadow Rider Calyrex VMAX CRE',200+seat);
  const pidgeot=card('Pidgeot ex OBF',300+seat);
  const genesect=card('Genesect V FST',400+seat);
  const owner=player(slot(vmaxA),[slot(vmaxB),slot(pidgeot),slot(genesect)],
    [vmaxA.id,pidgeot.id],[
      {name:'UNDERWORLD_DOOR_MARKER',source:vmaxA},
      {name:'QUICK_SEARCH_MARKER',source:pidgeot},
      {name:'FUSION_STRIKE_SYSTEM_MARKER',source:genesect}
    ]);
  owner.pokemonKnockedOutDuringOpponentsLastTurn=true;
  owner.pokemonKnockedOutByAttackDuringOpponentsLastTurn=false;
  const opponent=player(slot(card('UNKNOWN_OPPONENT_ACTIVE',1)),[],[],[]);
  opponent.hand={cards:[{fullName:'SECRET_OPPONENT_HAND'}]};
  const state={players:seat===0?[owner,opponent]:[opponent,owner],
    activePlayer:seat,turn:14,
    playerLastAttack:{[opponent.id]:{attack:{name:'STALE_ATTACK_SECRET'}}}};
  const r=publicEventReceipt(state,seat);
  assert.equal(r.version,VERSION);
  assert.equal(r.actorSeat,seat);
  assert.equal(r.turn,14);
  assert.equal(r.ownerActive.movedFromBenchToActiveThisTurn,true);
  assert.deepEqual(r.ownerActive.knownAbilityUse,
    [{name:'Underworld Door',usedThisTurn:true}]);
  assert.equal(r.ownerBench[0].movedFromBenchToActiveThisTurn,false);
  assert.deepEqual(r.ownerBench[0].knownAbilityUse,
    [{name:'Underworld Door',usedThisTurn:false}]);
  assert.deepEqual(r.ownerBench[1].knownAbilityUse,
    [{name:'Quick Search',usedThisTurn:true}]);
  assert.deepEqual(r.ownerBench[2].knownAbilityUse,
    [{name:'Fusion Strike System',usedThisTurn:true}]);
  assert.equal(r.opponentLastTurnAttack,null);
  assert.deepEqual(r.priorOpponentTurnKO,{any:true,byAttack:false});
  assert.ok(Object.isFrozen(r.priorOpponentTurnKO));
  const json=JSON.stringify(r);
  for(const text of ['SECRET_OWNER_HAND','SECRET_OWNER_DECK',
    'SECRET_OWNER_PRIZE','SECRET_OPPONENT_HAND','STALE_ATTACK_SECRET']){
    assert.equal(json.includes(text),false);
  }
  assert.ok(Object.isFrozen(r));
  assert.ok(Object.isFrozen(r.ownerBench));
  assert.ok(Object.isFrozen(r.ownerActive.knownAbilityUse));
});

test('evolving after movement does not fabricate top-card movement',()=>{
  const underlying=card('Buneary M2',100);
  const mega=card('Mega Lopunny ex M2',101);
  const owner=player(slot(mega,[underlying]),[],[underlying.id],[]);
  const opponent=player(slot(card('Pidgey MEW',900)),[],[],[]);
  const result=publicEventReceipt({players:[owner,opponent],
    activePlayer:0,turn:8},0);
  assert.equal(result.ownerActive.movedFromBenchToActiveThisTurn,false);
});

test('missing native movement or marker state is unknown',()=>{
  const owner=player(slot(card('Pidgeot ex OBF',901)),[],[],[]);
  delete owner.movedToActiveThisTurn;
  delete owner.marker;
  const opponent=player(slot(null),[],[],[]);
  const result=publicEventReceipt({players:[owner,opponent],
    activePlayer:0,turn:6},0);
  assert.equal(result.ownerActive.movedFromBenchToActiveThisTurn,null);
  assert.deepEqual(result.priorOpponentTurnKO,{any:null,byAttack:null});
  assert.deepEqual(result.ownerActive.knownAbilityUse,
    [{name:'Quick Search',usedThisTurn:null}]);
});

test('rejects a receipt for a non-acting seat',()=>{
  const p=player(slot(null),[],[],[]);
  assert.throws(()=>publicEventReceipt({players:[p,p],activePlayer:0},1));
});
