'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {actorObservation}=
  require('../simulation/twinleaf/actor-observation-contract.cjs');
const {removalTargetCertificate}=
  require('../simulation/twinleaf/agent6-public-removal-target-certificate.cjs');

/** @param {string} fullName @returns {object} */
const card=fullName=>({fullName});

/** @param {string} fullName @param {string[]} [toolNames] @returns {object} */
function occupied(fullName,toolNames=[]){
  const pokemon={
    fullName,name:fullName.split(' ').slice(0,-1).join(' '),
    hp:200,stage:'BASIC',cardType:['COLORLESS'],retreat:[],
    weakness:[],resistance:[],attacks:[],powers:[]
  };
  return {
    cards:[pokemon],energies:{cards:[]},
    tools:toolNames.map(card),damage:0,pokemonPlayedTurn:1,
    specialConditions:[],getPokemonCard(){return pokemon;}
  };
}

/** @returns {object} */
const empty=()=>({cards:[],energies:{cards:[]},tools:[],
  getPokemonCard(){return null;}});

/** @param {string} id @returns {object} */
function player(id){
  return {id,active:empty(),bench:[empty(),empty(),empty(),empty(),empty()],
    stadium:{cards:[]},discard:{cards:[]},lostzone:{cards:[]},
    supporter:{cards:[]},hand:{cards:[]},deck:{cards:[]},
    prizes:Array.from({length:6},()=>({cards:[card('Hidden X')]})),
    supporterTurn:0,retreatedTurn:-1,energyPlayedTurn:-1,
    stadiumPlayedTurn:-1,stadiumUsedTurn:-1,
    cannotPlayItemCards:false};
}

/** @param {0|1} actorSeat @returns {object} */
function source(actorSeat){
  const owner=player('source'),opponent=player('opponent');
  owner.active=occupied('Latias ex SSP',['Float Stone BKT']);
  owner.bench[0]=occupied("Lillie's Clefairy ex JTG");
  owner.hand.cards=[card('Field Blower GRI'),card('Psychic Energy MEE')];
  opponent.active=occupied('Iron Thorns ex TWM',['Tool Jammer BST']);
  opponent.bench[0]=occupied('Pidgey MEW');
  opponent.hand.cards=[card('Top Secret Unknown'),card('Other Hidden')];
  const players=actorSeat===0?[owner,opponent]:[opponent,owner];
  return {state:{players,activePlayer:actorSeat,turn:5,phase:2,prompts:[]},
    owner,opponent};
}

test('real detached owner observation exposes physical printed public Tool targets in both seats',()=>{
  for(const seat of [0,1]){
    const setup=source(seat);
    const view=actorObservation(setup.state,seat);
    assert.equal(view.decisionKind,'owner-root');
    assert.equal(Object.isFrozen(view),true);
    assert.equal(Object.isFrozen(view.ownPublic.active),true);
    assert.equal(view.ownHand[0],'Field Blower GRI');
    assert.equal(view.opponentPublic.active.tools[0],'Tool Jammer BST');
    assert.equal(view.opponentPublic.hand,undefined);
    const proof=removalTargetCertificate(view,0);
    assert.equal(proof.status,
      'public-target-and-physical-cost-present-unresolved');
    assert.deepEqual(proof.targets.map(x=>[
      x.side,x.zone,x.printing,x.targetClass
    ]),[
      ['own','active','Float Stone BKT','tool'],
      ['opponent','active','Tool Jammer BST','tool']
    ]);
    assert.equal(proof.opponentConcealedInformationRead,false);
    assert.equal(proof.paperPlayableCertified,false);
  }
});

test('real actor observation public Item-lock accurately vetoes removal',()=>{
  const setup=source(0);
  setup.owner.cannotPlayItemCards=true;
  const proof=removalTargetCertificate(actorObservation(setup.state,0),0);
  assert.equal(proof.publicItemLocked,true);
  assert.equal(proof.eligibleTargetCount,2);
  assert.ok(proof.blockers.includes('observed-public-item-lock'));
  assert.equal(proof.status,'necessary-condition-failed');
});

test('opponent hand and face-down Prize identities do not affect detached certificate',()=>{
  const a=source(0),b=source(0);
  b.opponent.hand.cards=[card('Entirely Different Concealed')];
  b.opponent.prizes[0].cards=[card('Another Hidden Prize')];
  b.opponent.deck.cards=[card('Concealed Deck Order')];
  const x=removalTargetCertificate(actorObservation(a.state,0),0);
  const y=removalTargetCertificate(actorObservation(b.state,0),0);
  assert.deepEqual(x,y);
});
