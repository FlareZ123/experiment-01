'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseBlockSwitchFundedKo:choose,VERSION}=
  require('../../simulation/twinleaf/agent35-block-switch-ko-frontier.cjs');

const psychic='Psychic Energy MEE';
const catalog={
  basicEnergyTypes:{Psychic:5},colorlessEnergyType:9,
  basicEnergies:new Set([psychic]),specialEnergies:new Set(),
  specialConditions:{ASLEEP:1,PARALYZED:2},
  stages:{BASIC:0},dragonPokemonPrintings:new Set()
};
function fixture(){
  const ready={
    printing:'Shadow Rider Calyrex VMAX CRE',
    printed:{stage:3,types:[5],retreatCost:[9,9]},
    energies:[psychic,psychic,psychic,psychic,psychic],
    tools:[],specialConditions:[],publicRestrictions:{},
    attacks:[{name:'Max Geist',damage:10,cost:[9,9,9],
      text:'This attack does 30 more damage for each [P] Energy attached to all of your Pokémon.'}]
  };
  return {
    decisionKind:'owner-root',globalTurn:18,
    ownHand:['Switch SVI','Iono PAL'],
    ownTurnResources:{itemPlayLocked:false},
    ownPublic:{
      active:{printing:'Shadow Rider Calyrex V CRE',
        printed:{stage:0,types:[5],retreatCost:[9,9]},
        energies:[],tools:['Float Stone BKT'],attacks:[],
        specialConditions:[],publicRestrictions:{}},
      bench:[{...ready}],stadium:[],publicTurnRestrictions:{}
    },
    opponentPublic:{
      active:{printing:'Snorlax PGO',hp:150,damage:0,
        printed:{types:[9],resistance:[]},tools:[],
        abilityDetails:[{name:'Block',
          text:"As long as this Pokémon is in the Active Spot, your opponent's Active Pokémon can't retreat."}]},
      bench:[{printing:'Mimikyu PAL',hp:70,damage:0}],stadium:[]
    }
  };
}
test('under printed Block propose held Item Switch to funded Max Geist KO',()=>{
  const v=fixture();
  assert.deepEqual(choose(v,catalog),{
    benchIndex:0,printing:'Shadow Rider Calyrex VMAX CRE',
    targetAttackName:'Max Geist',projectedPrintedDamage:160,
    handIndex:0,kind:'play-opponent-block-switch',source:VERSION,
    paperQualified:false
  });
});
test('Blocked voluntary retreat is distinct from legal Item switch',()=>{
  const v=fixture();
  v.ownPublic.active.tools=[];
  assert.equal(choose(v,catalog)?.kind,'play-opponent-block-switch');
  v.opponentPublic.active.abilityDetails=[];
  assert.equal(choose(v,catalog),null);
});
test('no physical held Item, energy funding, opponent HP or item access declines',()=>{
  const transformations=[
    v=>{v.ownHand=['Iono PAL'];},
    v=>{v.ownPublic.bench[0].energies.pop();},
    v=>{v.ownPublic.publicTurnRestrictions.itemPlayLocked=true;},
    v=>{v.ownPublic.active.energies=[psychic];},
    v=>{v.opponentPublic.active.damage=150;},
    v=>{v.opponentPublic.active.tools=['Eviolite NVI'];},
    v=>{v.ownPublic.bench[0].publicRestrictions.cannotAttackNextTurn=true;}
  ];
  for(const mutate of transformations){
    const v=fixture();mutate(v);assert.equal(choose(v,catalog),null);
  }
});
test('natural owner prompt only, no reading unknown source private zones',()=>{
  const v=fixture(),nope=new Proxy({},{get(){
    throw Error('Hidden opponent data accessed');
  }});
  v.opponentPublic.hand=nope;
  v.opponentPublic.deck=nope;
  v.opponentPublic.prizes=nope;
  const oldHand=JSON.stringify(v.ownHand);
  assert.equal(choose(v,catalog)?.kind,'play-opponent-block-switch');
  assert.equal(JSON.stringify(v.ownHand),oldHand);
  v.decisionKind='owner-prompt';
  assert.throws(()=>choose(v,catalog));
});
