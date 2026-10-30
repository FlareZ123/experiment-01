'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {buildPublicPokemonProfileIndex}=
  require('../simulation/twinleaf/agent10-original-printing-energy-flags.cjs');
const {potentialPrintedPrizeFinisher}=
  require('../simulation/twinleaf/agent42-visible-printed-prize-finisher.cjs');
const index=buildPublicPokemonProfileIndex(path.resolve(__dirname,'..'));
const catalog={publicPokemonProfileIndex:index};
const first={kind:'attack',attackName:'Photon Blaster'};

/** @returns {object} */
function view(){
  return {decisionKind:'owner-root',
    ownPublic:{prizeCount:3,active:{
      attacks:[{name:'Photon Blaster',damage:220,damageCalculation:null}]
    }},
    opponentPublic:{active:{printing:'Gengar & Mimikyu-GX TEU',
      hp:240,damage:30,energies:[],tools:[]}},
    opponentHidden:{hand:['unknown'],prizes:['unknown']}};
}

test('exact 3-Prize TAG TEAM attack is protected at 3 Prizes remaining',()=>{
  const result=potentialPrintedPrizeFinisher(view(),first,catalog);
  assert.deepEqual(result,{protect:true,
    reason:'potential-printed-prize-finishing-attack',award:3,
    opponentPrinting:'Gengar & Mimikyu-GX TEU',
    printedDamage:220,opponentRemainingHp:210});
});

test('exact 2-Prize GX and native GX alias protect with 2 Prizes remaining',()=>{
  const v=view();v.ownPublic.prizeCount=2;
  v.opponentPublic.active.printing='Dedenne GX UNB';
  v.opponentPublic.active.hp=160;
  v.opponentPublic.active.damage=0;
  assert.equal(potentialPrintedPrizeFinisher(v,first,catalog).award,2);
  assert.equal(potentialPrintedPrizeFinisher(v,first,catalog).protect,true);
});

test('exact single Prize target can also finish a single remaining Prize',()=>{
  const v=view();v.ownPublic.prizeCount=1;
  v.opponentPublic.active.printing='Klefki SVI';
  v.opponentPublic.active.hp=70;
  v.opponentPublic.active.damage=0;
  assert.equal(potentialPrintedPrizeFinisher(v,first,catalog).award,1);
  assert.equal(potentialPrintedPrizeFinisher(v,first,catalog).protect,true);
});

test('reject unknown, nonterminal, variable, insufficient damage and visible Prize reduction',()=>{
  const missing=view();missing.opponentPublic.active.printing='Fake GX BAD';
  assert.equal(potentialPrintedPrizeFinisher(missing,first,catalog).protect,false);
  const noIndex=view();
  assert.equal(potentialPrintedPrizeFinisher(noIndex,first,{}).protect,false);
  const noFinish=view();noFinish.ownPublic.prizeCount=4;
  assert.equal(potentialPrintedPrizeFinisher(noFinish,first,catalog).protect,false);
  const low=view();low.ownPublic.active.attacks[0].damage=200;
  assert.equal(potentialPrintedPrizeFinisher(low,first,catalog).protect,false);
  const variable=view();
  variable.ownPublic.active.attacks[0].damageCalculation='x';
  assert.equal(potentialPrintedPrizeFinisher(variable,first,catalog).protect,false);
  const legacy=view();
  legacy.opponentPublic.active.energies=['Legacy Energy TWM'];
  assert.equal(potentialPrintedPrizeFinisher(legacy,first,catalog).protect,false);
  const dew=view();dew.opponentPublic.active.tools=['Life Dew PLF'];
  assert.equal(potentialPrintedPrizeFinisher(dew,first,catalog).protect,false);
  assert.equal(potentialPrintedPrizeFinisher(view(),{kind:'pass'},catalog).protect,false);
});

test('changing opponents concealed cards cannot change public finisher warning',()=>{
  const a=view(),b=structuredClone(a);
  b.opponentHidden={hand:['different'],prizes:['different']};
  b.unseenDeckOrder=['changed'];
  assert.deepEqual(potentialPrintedPrizeFinisher(a,first,catalog),
    potentialPrintedPrizeFinisher(b,first,catalog));
});
