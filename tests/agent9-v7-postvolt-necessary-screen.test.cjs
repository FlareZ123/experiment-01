'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {screenPostVoltNecessaryRoutes}=require(
  '../simulation/evaluation/agent9-v7-postvolt-necessary-screen.cjs');

function fixture(){
  return {
    decisionKind:'owner-root',actorSeat:1,globalTurn:16,
    ownHand:['Double Colorless Energy FCO','Guzma BUS'],
    ownPublic:{
      active:{printing:'Iron Thorns ex TWM',
        energies:['Speed Lightning Energy RCL']},
      bench:[{printing:'Iron Thorns ex TWM',
        energies:['Double Colorless Energy NXD']}],
      stadium:['Thunder Mountain ◇ LOT'],discard:[],
      publicTurnRestrictions:{attackLockTurnsRemaining:0,
        energyPlayLocked:false,specialEnergyPlayLocked:false,
        supporterPlayLocked:false,itemPlayLocked:false}
    },
    opponentPublic:{active:{printing:'Tapu Lele-GX GRI'},
      bench:[{printing:'Mewtwo ex PAR',energies:[]}],stadium:[]},
    ownTurnResources:{supporterPlayedTurn:0,energyPlayedTurn:14,
      energyPlayLocked:false,specialEnergyPlayLocked:false,
      supporterPlayLocked:false,itemPlayLocked:false}
  };
}

test('a real v7 post-Volt Active retaining Speed Lightning can receive held DCE',()=>{
  const view=fixture();
  view.ownPublic.stadium=[];
  view.ownHand=['Double Colorless Energy FCO'];
  const x=screenPostVoltNecessaryRoutes(view);
  assert.equal(x.activeSpeedLightning,true);
  assert.equal(x.sourceActiveEnergies.length,1);
  assert.equal(x.possibleManualDceOntoActive,true);
  assert.equal(x.possibleDirectGuzmaBenchBaton,false);
  assert.equal(x.paperPaidAlternativeCertified,false);
});

test('a funded DCE Bench and Thunder may permit a direct Guzma on both players',()=>{
  const x=screenPostVoltNecessaryRoutes(fixture());
  assert.equal(x.thunderInPlay,true);
  assert.equal(x.fundedDceBench.length,1);
  assert.equal(x.possibleDirectGuzmaBenchBaton,true);
  assert.equal(x.possibleManualDceOntoActive,true);
  assert.equal(x.exhaustiveAlternativeSearch,false);
});

test('VS Seeker plus public discarded Guzma screens separately from held Guzma',()=>{
  const v=fixture();
  v.ownHand=['VS Seeker PHF'];
  v.ownPublic.discard=['Guzma BUS'];
  const x=screenPostVoltNecessaryRoutes(v);
  assert.equal(x.possibleDirectGuzmaBenchBaton,false);
  assert.equal(x.possibleVsSeekerGuzmaBenchBaton,true);
  v.ownPublic.publicTurnRestrictions.itemPlayLocked=true;
  assert.equal(screenPostVoltNecessaryRoutes(v)
    .possibleVsSeekerGuzmaBenchBaton,false);
});

test('used manual Energy quota forbids manual DCE screening without suppressing Guzma',()=>{
  const v=fixture();
  v.ownTurnResources.energyPlayedTurn=v.globalTurn;
  const x=screenPostVoltNecessaryRoutes(v);
  assert.equal(x.possibleManualDceOntoActive,false);
  assert.equal(x.possibleDirectGuzmaBenchBaton,true);
});

test('opponent empty Bench forbids Guzma line; active-energy line may remain',()=>{
  const v=fixture();
  v.opponentPublic.bench=[];
  const x=screenPostVoltNecessaryRoutes(v);
  assert.equal(x.possibleDirectGuzmaBenchBaton,false);
  assert.equal(x.possibleManualDceOntoActive,true);
});

test('source lock and supporter quota prevent false offerable lines',()=>{
  const v=fixture();
  v.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;
  const x=screenPostVoltNecessaryRoutes(v);
  assert.equal(x.possibleManualDceOntoActive,false);
  assert.equal(x.possibleDirectGuzmaBenchBaton,false);
  v.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=0;
  v.ownTurnResources.supporterPlayedTurn=1;
  assert.equal(screenPostVoltNecessaryRoutes(v)
    .possibleDirectGuzmaBenchBaton,false);
  assert.equal(screenPostVoltNecessaryRoutes(v)
    .possibleManualDceOntoActive,true);
});
