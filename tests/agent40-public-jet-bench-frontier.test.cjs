'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {choosePublicJetBenchSwitch}=require(
  '../simulation/twinleaf/agent40-public-jet-bench-frontier.cjs');

const jet='Jet Energy PAL';
const card={specialEnergies:new Set([jet]),
  specialConditions:{ASLEEP:2,PARALYZED:3}};
const attack=(name,damage,charged=false)=>({name,damage,cost:[1],charged});
const pokemon=(name,attacks,energies=[])=>({name,printing:name+' TEST',
  attacks,energies,specialConditions:[],publicRestrictions:{}});
const ready=(_view,_catalog,p,a)=>a.charged===true||
  p.energies.includes(jet);
function view(options={}){
  return {
    decisionKind:'owner-root',globalTurn:options.turn??4,
    ownHand:options.hand??[jet],
    ownTurnResources:{energyPlayedTurn:options.playedTurn??-1,
      energyPlayLocked:false,specialEnergyPlayLocked:false},
    ownPublic:{active:pokemon('Stranded',[attack('weak',40)]),
      bench:[pokemon('BenchAttacker',[attack('strong',100)]),null,null,null,null],
      stadium:[],publicTurnRestrictions:{}},
    opponentPublic:{stadium:[]}
  };
}
const choose=v=>choosePublicJetBenchSwitch(v,card,{payable:ready});

test('proposes actual bench Jet as one typed energy action',()=>{
  const selected=choose(view());
  assert.deepEqual(selected,{kind:'attach-special-energy',printing:jet,
    handIndex:0,slot:'bench',index:0,
    reason:'jet-switch-to-public-payable-printed-damage',
    plannedAttackName:'strong'});
});
test('declines to replace a currently payable printed Active attack',()=>{
  const v=view();v.ownPublic.active.attacks[0].charged=true;
  assert.equal(choose(v),null);
});
test('respects used energy attachment, playing locks and first turn',()=>{
  assert.equal(choose(view({playedTurn:4})),null);
  const v=view();v.ownPublic.publicTurnRestrictions.specialEnergyPlayLocked=true;
  assert.equal(choose(v),null);
  assert.equal(choose(view({turn:1})),null);
});
test('declines mandatory switch when Temple suppresses special effects',()=>{
  const v=view();v.opponentPublic.stadium=['Temple of Sinnoh ASR'];
  assert.equal(choose(v),null);
});
test('requires a real positive-damage printed attack on the Bench',()=>{
  const v=view();v.ownPublic.bench[0].attacks[0].damage=0;
  assert.equal(choose(v),null);
});
test('respects blocked and GX-only Bench attacks',()=>{
  const v=view();v.ownPublic.bench[0].publicRestrictions.cannotAttackNextTurn=true;
  assert.equal(choose(v),null);
  v.ownPublic.bench[0].publicRestrictions.cannotAttackNextTurn=false;
  v.ownPublic.bench[0].attacks[0].gxAttack=true;
  assert.equal(choose(v),null);
});
test('works with displaced hand index and selected actual Bench index',()=>{
  const v=view({hand:['Other FLI',jet]});
  v.ownPublic.bench[0]=null;
  v.ownPublic.bench[2]=pokemon('Ready',[attack('zap',80)]);
  const x=choose(v);
  assert.equal(x.handIndex,1);assert.equal(x.index,2);
});
test('same decision under changes to opponent private hidden information',()=>{
  const a=view(),b=view();
  a.opponentHiddenHand=['mystery1'];b.opponentHiddenHand=['mystery2'];
  a.ownerUnknownDeck=['one'];b.ownerUnknownDeck=['two'];
  assert.deepEqual(choose(a),choose(b));
});
