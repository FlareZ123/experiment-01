'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  chooseHeldGuzmaMobility,attackFunding,eligibleDamagingAttack
}=require('../simulation/twinleaf/agent2-held-guzma-mobility-frontier.cjs');

const COLORLESS=0, METAL=1;
const DCE='Double Colorless Energy SUM';
const METAL_BASIC='Metal Energy SVE';
const CATALOG={
  basicEnergies:new Set([METAL_BASIC]),
  basicEnergyTypes:{Metal:METAL},
  colorlessEnergyType:COLORLESS,
  specialConditions:{PARALYZED:'PARALYZED',ASLEEP:'ASLEEP'}
};

/**
 * Owner-visible synthetic T46 projection of authenticated original rank5
 * native New Moon physical source. Printed attacks are sourced from
 * Mew VMAX FST 114 and Genesect V FST 185. The simplified numeric card
 * enums and public actors are injected solely to isolate a pure selector.
 *
 * The real archived prompt did NOT record exact status. This fixture
 * explicitly covers Paralysis as the harder legal-switch scenario, without
 * claiming that the actual coin produced it.
 *
 * @returns {object} Detached owner actor observation subset.
 */
function sourceTurn46(){
  const genesect=()=>({
    printing:'Genesect V FST',name:'Genesect V',
    energies:[],specialConditions:[],
    publicRestrictions:{},
    attacks:[{name:'Techno Blast',cost:[METAL,METAL,COLORLESS],
      damage:210,gxAttack:false}]
  });
  return {
    decisionKind:'owner-root',globalTurn:46,ownHand:[
      'Guzma BUS','Float Stone BKT','Guzma BUS'
    ],
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false},
    ownPublic:{
      active:{...genesect(),specialConditions:['PARALYZED'],tools:[]},
      bench:[
        genesect(),
        {printing:'Mew VMAX FST',name:'Mew VMAX',
          energies:[DCE],specialConditions:[],publicRestrictions:{},
          attacks:[
            {name:'Cross Fusion Strike',cost:[COLORLESS,COLORLESS],
              damage:null,gxAttack:false},
            {name:'Max Miracle',cost:[2,2],damage:130,gxAttack:false}
          ]},
        {printing:'Crobat V DAA',name:'Crobat V',energies:[],
          specialConditions:[],publicRestrictions:{},attacks:[]},
        {printing:'Dedenne GX UNB',name:'Dedenne-GX',energies:[],
          specialConditions:[],publicRestrictions:{},attacks:[]},
        genesect()
      ],
      publicTurnRestrictions:{
        supporterPlayLocked:false,attackLockTurnsRemaining:0
      }
    },
    opponentPublic:{
      active:{printing:'Solrock CES',name:'Solrock'},
      bench:[{printing:'Unown AOR'}]
    }
  };
}

test('native analogue T46 Mew with DCE and copied attack cannot be proposed',()=>{
  const view=sourceTurn46();
  assert.equal(chooseHeldGuzmaMobility(view,CATALOG),null);
  assert.equal(attackFunding(view.ownPublic.bench[1],CATALOG),null);
});

test('fixing only the Special Energy blind spot leaves copy attack invisible',()=>{
  const view=sourceTurn46();
  view.ownPublic.bench[1].energies=[METAL_BASIC,METAL_BASIC];
  assert.equal(chooseHeldGuzmaMobility(view,CATALOG),null);
  assert.equal(attackFunding(view.ownPublic.bench[1],CATALOG),null);
});

test('fixing only the copying damage blind spot still rejects Special Energy',()=>{
  const view=sourceTurn46();
  view.ownPublic.bench[1].attacks[0].damage=210;
  assert.equal(chooseHeldGuzmaMobility(view,CATALOG),null);
  assert.equal(attackFunding(view.ownPublic.bench[1],CATALOG),null);
});

test('when both blind spots are removed, same owner state selects held Guzma',()=>{
  const view=sourceTurn46();
  view.ownPublic.bench[1].energies=[METAL_BASIC,METAL_BASIC];
  view.ownPublic.bench[1].attacks[0].damage=210;
  assert.deepEqual(chooseHeldGuzmaMobility(view,CATALOG),{
    kind:'play-held-guzma-mobility',handIndex:0,
    printing:'Guzma BUS',benchIndex:1,anticipatedMissing:0
  });
});

test('with the artificial direct attack, real global turn and player locks matter',()=>{
  const view=sourceTurn46();
  view.ownPublic.bench[1].energies=[METAL_BASIC,METAL_BASIC];
  view.ownPublic.bench[1].attacks[0].damage=210;
  view.ownTurnResources.supporterPlayedTurn=1;
  assert.equal(chooseHeldGuzmaMobility(view,CATALOG),null);
  view.ownTurnResources.supporterPlayedTurn=0;
  view.ownTurnResources.supporterPlayLocked=true;
  assert.equal(chooseHeldGuzmaMobility(view,CATALOG),null);
  view.ownTurnResources.supporterPlayLocked=false;
  view.opponentPublic.bench=[];
  assert.equal(chooseHeldGuzmaMobility(view,CATALOG),null);
});

test('printed Cross Fusion Strike is excluded from direct damage filter',()=>{
  const view=sourceTurn46(),mew=view.ownPublic.bench[1];
  const copy=mew.attacks[0],direct=mew.attacks[1];
  assert.equal(eligibleDamagingAttack(mew,copy,CATALOG),false);
  assert.equal(eligibleDamagingAttack(mew,direct,CATALOG),true);
});
