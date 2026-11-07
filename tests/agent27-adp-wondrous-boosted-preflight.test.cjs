'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {observeAdpBoostedGxResourceWindow,chooseAdpGxFromPayable}=
  require('../simulation/twinleaf/agent28-adp-post-retreat-gx-window.cjs');

const ADP='Arceus & Dialga & Palkia GX CEC';
const DDE='Double Dragon Energy ROS';
const WONDROUS='Wondrous Labyrinth Prism Star TEU';

/**
 * All inputs visible in actor-only public game observation.
 * @param {object} options
 * @returns {object}
 */
function ownerView({stadium=null,energies=[DDE],gxUsed=false}={}){
  return {
    decisionKind:'owner-root',globalTurn:2,
    ownPublic:{
      active:{
        printing:ADP,name:'Arceus & Dialga & Palkia-GX',
        attacks:[{name:'Altered Creation-GX',cost:[8],gxAttack:false}],
        energies:[...energies],publicRestrictions:{}
      },
      stadium:stadium?[stadium]:[],
      publicTurnRestrictions:{gxUsed,cannotUseGXAttacks:false}
    },
    opponentPublic:{stadium:[]}
  };
}

test('No Wondrous + single DDE remains a nominal enhanced GX opportunity',()=>{
  const r=observeAdpBoostedGxResourceWindow(ownerView());
  assert.equal(r.nominalBoostedResourceWindow,true);
  assert.equal(chooseAdpGxFromPayable(ownerView(),
    [{name:'Altered Creation-GX'}]).attackName,'Altered Creation-GX');
});

test('Wondrous + one DDE can announce base GX but cannot satisfy extra Water',()=>{
  const view=ownerView({stadium:WONDROUS});
  const r=observeAdpBoostedGxResourceWindow(view);
  assert.equal(r.wondrousLabyrinth,true);
  assert.equal(r.energyUnitsForEnhancedGX,3);
  assert.equal(r.knownAvailableEnergyUnits,2);
  assert.equal(r.nominalBoostedResourceWindow,false);
  assert.equal(chooseAdpGxFromPayable(view,[{name:'Altered Creation-GX'}]),null);
});

test('Two attached DDEs can fund enhanced GX through Wondrous',()=>{
  const r=observeAdpBoostedGxResourceWindow(
    ownerView({stadium:WONDROUS,energies:[DDE,DDE]}));
  assert.equal(r.knownAvailableEnergyUnits,4);
  assert.equal(r.nominalBoostedResourceWindow,true);
});

test('An additional attached basic Energy provides third required unit',()=>{
  const r=observeAdpBoostedGxResourceWindow(ownerView({
    stadium:WONDROUS,energies:[DDE,'Grass Energy SVE']}));
  assert.equal(r.knownAvailableEnergyUnits,3);
  assert.equal(r.nominalBoostedResourceWindow,true);
});

test('Other unknown Special Energy does not supply confidently known third unit',()=>{
  const r=observeAdpBoostedGxResourceWindow(ownerView({
    stadium:WONDROUS,energies:[DDE,'Unknown Special Energy TEST']}));
  assert.equal(r.knownAvailableEnergyUnits,2);
  assert.equal(r.nominalBoostedResourceWindow,false);
});

test('Opponent public Stadium, GX usage and Temple prevent false boosted flags',()=>{
  const enemy=ownerView();
  enemy.opponentPublic.stadium=[WONDROUS];
  assert.equal(observeAdpBoostedGxResourceWindow(enemy).nominalBoostedResourceWindow,false);
  assert.equal(observeAdpBoostedGxResourceWindow(ownerView({gxUsed:true})).nominalBoostedResourceWindow,false);
  const temple=ownerView({stadium:'Temple of Sinnoh ASR'});
  assert.equal(observeAdpBoostedGxResourceWindow(temple).nominalBoostedResourceWindow,false);
});

test('Actor observation correction cannot itself qualify a competitive game',()=>{
  const r=observeAdpBoostedGxResourceWindow(ownerView({stadium:WONDROUS}));
  assert.equal(r.nativePlayableCertified,false);
  assert.equal(r.opponentResponseCertified,false);
});

module.exports={ownerView};
