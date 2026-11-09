'use strict';

const assert=require('node:assert/strict');
const {chooseUnderworldDoorRoot}=
  require('../agent31-underworld-door-owner-frontier.cjs');

const VERSION='agent6-owner-path-underworld-stadium-counter-v1';
const SUPPORTED=new Set(['Sky Field','Dimension Valley']);

/**
 * Enumerate owner-held, known-print Stadium plays that displace a face-up
 * Path to the Peak and thereby restore a *structurally available* Shadow
 * Rider VMAX Underworld Door proposal. This is a real two-action line:
 * play a replacement Stadium, then ask the native Store to permit the power.
 *
 * Only authenticated acting-owner hand, public boards, public trainer
 * printing catalog, native marker receipt, and turn quota are considered.
 * Caller must compare the Stadium use against other legal turn options;
 * this function does not certify native canPlay or expected strategic merit.
 *
 * @param {object} view Detached actorObservation during an owner root.
 * @param {object} pokemonCatalog Same public catalog as Underworld planner.
 * @param {Map<string,{name:string,type:string}>} trainerCatalog Public prints.
 * @param {{activeUnspent?:boolean,benchUnspent?:boolean[]}} markers
 * @returns {object|null} Owner-only feasible printed-Card plan alternatives.
 */
function planPathUnderworldStadiumCounter(
  view,pokemonCatalog,trainerCatalog,markers={}
){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(trainerCatalog instanceof Map);
  const own=view.ownPublic,opp=view.opponentPublic;
  const r=view.ownTurnResources;
  if(r?.stadiumPlayLocked!==false ||
      !Number.isSafeInteger(r.stadiumPlayedTurn) ||
      r.stadiumPlayedTurn>=view.globalTurn)return null;

  const current=[...(own?.stadium??[]),...(opp?.stadium??[])];
  if(current.length!==1 ||
     !current[0].startsWith('Path to the Peak '))return null;

  // Run the existing exact owner marker/Energy/recipient preflight against
  // the hypothetical post-displacement public Stadium geometry.
  const hypotheticView={
    ...view,
    ownPublic:{...own,stadium:[]},
    opponentPublic:{...opp,stadium:[]}
  };
  const door=chooseUnderworldDoorRoot(
    hypotheticView,pokemonCatalog,markers);
  if(door?.kind!=='use-underworld-door')return null;

  const options=[];
  for(let index=0;index<view.ownHand.length;index++){
    const printing=view.ownHand[index];
    const meta=trainerCatalog.get(printing);
    if(meta?.type==='Stadium'&&SUPPORTED.has(meta.name)){
      options.push({
        handIndex:index,printing,name:meta.name,
        publicReplacementName:'Path to the Peak',
        immediatePowerName:door.abilityName,
        sourcePosition:door.position,
        sourceBenchIndex:door.benchIndex,
        resultingNativeAbilityAndPaymentCertified:false
      });
    }
  }
  return options.length>0?{
    schema:VERSION,kind:'replace-path-then-underworld',
    actorSeat:view.actorSeat,globalTurn:view.globalTurn,
    ownerPublicOnly:true,options,
    preventedSourcePower:'Underworld Door',
    requiresFreshNativeStadiumAndAbilityAcceptance:true,
    competitiveQualified:false
  }:null;
}

module.exports={VERSION,planPathUnderworldStadiumCounter};
