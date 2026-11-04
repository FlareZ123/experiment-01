'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,PRINTING,hasRegisteredSourceLine,
  chooseGhCaptureRoot,chooseGhCapturePrompt
}=require('../simulation/twinleaf/agent40-gh-capture-owner-sequencer.cjs');

/** @returns {string[]} */
function ownerSixty(){
  const copies=[
    [PRINTING.bunnelby,2],[PRINTING.gh,4],[PRINTING.tag,4],
    [PRINTING.stadium,2],[PRINTING.capture,2],[PRINTING.tool,2],
    [PRINTING.oddish,2],[PRINTING.pidgey,2]
  ].flatMap(([printing,n])=>Array(n).fill(printing));
  return [...copies,...Array(60-copies.length).fill('Other rank2 source')];
}

/** @returns {object} */
function view(){
  return {
    decisionKind:'owner-root',globalTurn:2,
    ownHand:[PRINTING.gh,PRINTING.gh,PRINTING.tag,
      'Stealthy Hood UNB','Plumeria BUS','Faba LOT',
      'Gladion CIN','Karen XYP'],
    ownPublic:{
      active:{
        printing:PRINTING.bunnelby,energies:[],tools:[],
        specialConditions:[],publicRestrictions:{}
      },
      bench:[null,null,null,null,null],stadium:[],
      publicTurnRestrictions:{attackLockTurnsRemaining:0}
    },
    opponentPublic:{stadium:[]},
    ownTurnResources:{
      supporterPlayedTurn:0,stadiumPlayedTurn:0,
      stadiumUsedTurn:0,energyPlayedTurn:0,
      supporterPlayLocked:false,stadiumPlayLocked:false,
      energyPlayLocked:false,specialEnergyPlayLocked:false,
      toolPlayLocked:false
    }
  };
}

test('source 60 and first-eight owner visible GH plus two connectors required',()=>{
  assert.equal(VERSION,'agent40-gh-capture-owner-visible-two-spare-connectors-v1');
  const known=ownerSixty();
  assert.equal(hasRegisteredSourceLine(known),true);
  assert.equal(hasRegisteredSourceLine(known.slice(1)),false);
  const x=view();
  assert.deepEqual(chooseGhCaptureRoot(x,known),{
    kind:'play-gh',handIndex:0,printing:PRINTING.gh,spareConnectors:2
  });
  x.ownHand.splice(1,1);
  assert.equal(chooseGhCaptureRoot(x,known),null,
    'One spare G&H plus no second spare cannot certify two-card payment');
  x.ownHand.splice(1,0,PRINTING.gh);
  x.ownTurnResources.supporterPlayedTurn=2;
  assert.equal(chooseGhCaptureRoot(x,known),null);
  x.ownTurnResources.supporterPlayedTurn=0;
  x.ownTurnResources.supporterPlayLocked=true;
  assert.equal(chooseGhCaptureRoot(x,known),null);
  x.ownTurnResources.supporterPlayLocked=false;
  x.globalTurn=1;
  assert.equal(chooseGhCaptureRoot(x,known),null);
});

test('owner-only six root intents follow public effects and hand custody',()=>{
  const x=view(),known=ownerSixty();
  assert.equal(chooseGhCaptureRoot(x,known).kind,'play-gh');
  x.ownHand=[PRINTING.stadium,PRINTING.capture,PRINTING.tool,'Karen XYP'];
  x.ownTurnResources.supporterPlayedTurn=2;
  assert.equal(chooseGhCaptureRoot(x,known).kind,'play-artazon');
  x.ownHand.splice(0,1);
  x.ownPublic.stadium=[PRINTING.stadium];
  assert.equal(chooseGhCaptureRoot(x,known).kind,'use-artazon');
  x.ownPublic.bench[0]={printing:PRINTING.oddish};
  x.ownTurnResources.stadiumUsedTurn=2;
  assert.equal(chooseGhCaptureRoot(x,known).kind,'attach-capture');
  x.ownHand.splice(0,1);
  x.ownPublic.active.energies=[PRINTING.capture];
  x.ownPublic.bench[1]={printing:PRINTING.pidgey};
  assert.equal(chooseGhCaptureRoot(x,known).kind,'equip-tm');
  x.ownHand.splice(0,1);
  x.ownPublic.active.tools=[PRINTING.tool];
  assert.equal(chooseGhCaptureRoot(x,known).kind,'attack-evolution');
  x.ownPublic.active.publicRestrictions.cannotAttackNextTurn=true;
  assert.equal(chooseGhCaptureRoot(x,known),null);
});

test('native-style owner prompts choose real physical connectors and tutor targets',()=>{
  const card=fullName=>({fullName});
  const owner={
    id:12,
    hand:{cards:[card(PRINTING.gh),card(PRINTING.tag),card('Other')]},
    supporter:{cards:[card(PRINTING.gh)]},
    stadium:{cards:[]},
    active:{energies:{cards:[]}},
    bench:Array.from({length:5},()=>({getPokemonCard:()=>null}))
  };
  const state={players:[{id:99},owner]};
  class SelectOptionPrompt{constructor(){this.playerId=12;this.result=undefined;this.options={};}
    validate(v){return v===1;}}
  class ChooseCardsPrompt{
    constructor(cards,max){this.playerId=12;this.result=undefined;this.cards=cards;this.options={max};}
    validate(cards){return Array.isArray(cards)&&cards.length<=this.options.max&&
      cards.every(c=>this.cards.cards.includes(c));}
  }
  assert.deepEqual(chooseGhCapturePrompt(state,1,new SelectOptionPrompt()),{
    kind:'gh-three-channel-mode',selected:1
  });
  const payment=chooseGhCapturePrompt(state,1,
    new ChooseCardsPrompt(owner.hand,2));
  assert.equal(payment.kind,'gh-discard-two-spare-connectors');
  assert.deepEqual(payment.selected.map(c=>c.fullName),[PRINTING.gh,PRINTING.tag]);
  const pool=[PRINTING.stadium,PRINTING.capture,PRINTING.tool,
    PRINTING.oddish,PRINTING.pidgey].map(card);
  owner.deck={cards:pool};
  const search=chooseGhCapturePrompt(state,1,
    new ChooseCardsPrompt(owner.deck,3));
  assert.equal(search.kind,'gh-three-channel-deck-search');
  assert.deepEqual(search.selected.map(c=>c.fullName),
    [PRINTING.stadium,PRINTING.tool,PRINTING.capture]);
  owner.supporter.cards=[];
  owner.stadium.cards=[card(PRINTING.stadium)];
  const oddish=chooseGhCapturePrompt(state,1,
    new ChooseCardsPrompt(owner.deck,1));
  assert.equal(oddish.kind,'artazon-oddish');
  owner.bench[0].getPokemonCard=()=>card(PRINTING.oddish);
  owner.active.energies.cards.push(card(PRINTING.capture));
  const pidgey=chooseGhCapturePrompt(state,1,
    new ChooseCardsPrompt(owner.deck,1));
  assert.equal(pidgey.kind,'capture-pidgey');
  assert.equal(pidgey.selected[0].fullName,PRINTING.pidgey);
  const foreignPrompt=new ChooseCardsPrompt(owner.deck,1);
  foreignPrompt.playerId=99;
  assert.equal(chooseGhCapturePrompt(state,1,foreignPrompt),null);
});

test('root decisions have no hidden-deck or opponent-hand access',()=>{
  const x=view(),known=ownerSixty();
  Object.defineProperty(x,'ownDeck',{get(){throw Error('Hidden own deck');}});
  Object.defineProperty(x.opponentPublic,'hand',{get(){
    throw Error('Opposing concealed hand');}});
  assert.equal(chooseGhCaptureRoot(Object.freeze(x),known).kind,'play-gh');
});
