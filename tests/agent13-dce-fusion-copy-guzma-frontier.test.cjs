'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,chooseDceFusionCopyGuzma
}=require('../simulation/twinleaf/agent13-dce-fusion-copy-guzma-frontier.cjs');

const C=9, DCE='Double Colorless Energy SUM';
const CATALOG={
  colorlessEnergyType:C,
  specialEnergies:new Set([DCE])
};

/** Source-owner visible Turn46 analogue, not a replayed native Store. */
function state(){
  const genesect=()=>({
    name:'Genesect V',printing:'Genesect V FST',
    energies:[],specialConditions:[],publicRestrictions:{},
    attacks:[{name:'Techno Blast',cost:[8,8,C],damage:210}]
  });
  return {
    decisionKind:'owner-root',globalTurn:46,
    ownHand:['Float Stone BKT','Guzma BUS','Guzma BUS'],
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false},
    ownPublic:{
      active:{
        ...genesect(),specialConditions:['PARALYZED'],tools:[]
      },
      bench:[
        genesect(),{
          name:'Mew VMAX',printing:'Mew VMAX FST',
          energies:[DCE],specialConditions:[],publicRestrictions:{},
          attacks:[
            {name:'Cross Fusion Strike',cost:[C,C],damage:null},
            {name:'Max Miracle',cost:[5,5],damage:130}
          ]
        },
        {name:'Crobat V',energies:[],attacks:[]},
        {name:'Dedenne-GX',energies:[],attacks:[]},
        genesect()
      ],
      stadium:[],
      publicTurnRestrictions:{
        supporterPlayLocked:false,attackLockTurnsRemaining:0
      }
    },
    opponentPublic:{
      active:{name:'Solrock'},
      bench:[{name:'Klefki'},{name:'Dusclops'}],
      stadium:[]
    }
  };
}

test('source T46 analogue proposes Guzma to the actual funded Benched Mew',()=>{
  const proposed=chooseDceFusionCopyGuzma(state(),CATALOG);
  assert.equal(VERSION,
    'agent13-bounded-dce-fusion-copy-guzma-mobility-proposal-v1');
  assert.deepEqual(proposed,{
    kind:'play-held-guzma-mobility',handIndex:1,
    printing:'Guzma BUS',benchIndex:1,anticipatedMissing:0,
    planFamily:'dce-fusion-copy-benched-genesect',
    nominalCopiedDamage:210,
    paperAttackAndGustLegalityCertified:false
  });
});

test('active Paralysis can be bypassed by switching; proposer is not a retreat',()=>{
  assert.ok(state().ownPublic.active.specialConditions.includes('PARALYZED'));
  assert.equal(chooseDceFusionCopyGuzma(state(),CATALOG)?.benchIndex,1);
});

test('spent Supporter or owner/board Supporter lock suppresses the proposal',()=>{
  const v=state();
  v.ownTurnResources.supporterPlayedTurn=1;
  assert.equal(chooseDceFusionCopyGuzma(v,CATALOG),null);
  v.ownTurnResources.supporterPlayedTurn=0;
  v.ownTurnResources.supporterPlayLocked=true;
  assert.equal(chooseDceFusionCopyGuzma(v,CATALOG),null);
  v.ownTurnResources.supporterPlayLocked=false;
  v.ownPublic.publicTurnRestrictions.supporterPlayLocked=true;
  assert.equal(chooseDceFusionCopyGuzma(v,CATALOG),null);
});

test('opponent needs a Bench; first turn, attack lock and empty Guzma exclude',()=>{
  const v=state();
  v.opponentPublic.bench=[];
  assert.equal(chooseDceFusionCopyGuzma(v,CATALOG),null);
  v.opponentPublic.bench=[{name:'Klefki'}];
  v.globalTurn=1;
  assert.equal(chooseDceFusionCopyGuzma(v,CATALOG),null);
  v.globalTurn=46;
  v.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;
  assert.equal(chooseDceFusionCopyGuzma(v,CATALOG),null);
  v.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=0;
  v.ownHand=['Float Stone BKT'];
  assert.equal(chooseDceFusionCopyGuzma(v,CATALOG),null);
});

test('missing DCE, unrecognized Special Energy or Temple veto funded copy',()=>{
  const v=state();
  v.ownPublic.bench[1].energies=[];
  assert.equal(chooseDceFusionCopyGuzma(v,CATALOG),null);
  v.ownPublic.bench[1].energies=[DCE];
  assert.equal(chooseDceFusionCopyGuzma(v,{
    ...CATALOG,specialEnergies:new Set()
  }),null);
  v.ownPublic.stadium=['Temple of Sinnoh ASR'];
  assert.equal(chooseDceFusionCopyGuzma(v,CATALOG),null);
});

test('printed attack identity, donor and exact DCE count all remain necessary',()=>{
  const v=state();
  v.ownPublic.bench[0].attacks=[];
  v.ownPublic.bench[4].attacks=[];
  assert.equal(chooseDceFusionCopyGuzma(v,CATALOG),null);
  v.ownPublic.bench[0].attacks=[{
    name:'Techno Blast',cost:[8,8,C],damage:210
  }];
  v.ownPublic.bench[1].attacks[0].cost=[C,C,C];
  assert.equal(chooseDceFusionCopyGuzma(v,CATALOG),null);
  v.ownPublic.bench[1].attacks[0].cost=[C,C];
  v.ownPublic.bench[1].publicRestrictions
    .blockedAttackNameNextTurn='Cross Fusion Strike';
  assert.equal(chooseDceFusionCopyGuzma(v,CATALOG),null);
});

test('energetic Active or printed free attack prevents a needless Guzma',()=>{
  const v=state();
  v.ownPublic.active.energies=['Metal Energy SVE'];
  assert.equal(chooseDceFusionCopyGuzma(v,CATALOG),null);
  v.ownPublic.active.energies=[];
  v.ownPublic.active.attacks.push({name:'Free',cost:[],damage:20});
  assert.equal(chooseDceFusionCopyGuzma(v,CATALOG),null);
});

test('nonmatching owner observation is rejected explicitly',()=>{
  const v=state();
  v.decisionKind='owner-prompt';
  assert.throws(()=>chooseDceFusionCopyGuzma(v,CATALOG));
});
