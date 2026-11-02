'use strict';

const assert=require('node:assert/strict');
const {runSeat}=require('./rank26-unown-starter-source-fixture.cjs');
const {oneLightningAfterFiveKOs}=
  require('./agent3-rank26-koko-one-lightning-native.cjs');

/** @returns {object} */
function run(){
  const cases=[0,1].map(seat=>runSeat(seat,f=>
    oneLightningAfterFiveKOs(f,{ownerColognePolicy:true})));
  for(const c of cases){
    const r=c.continuation;
    assert.equal(r.ownerColognePolicy,true);
    assert.equal(r.pinnedNativePromptAcceptedOneLightning,true);
    assert.equal(r.firstturnCrisisPunchNativeAttack,true);
    assert.equal(r.originalPhysical60ConservedBothSeats,true);
    assert.equal(r.competitiveGameQualified,false);
  }
  return {schema:'agent3-rank26-source-cologne-one-lightning-owner-native-v1',
    sourceRank:26,opponentRank:6,
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    cases,original60BothSeats:true,conditionalStaged:true,
    competitiveGameQualified:false};
}
module.exports={run};
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
