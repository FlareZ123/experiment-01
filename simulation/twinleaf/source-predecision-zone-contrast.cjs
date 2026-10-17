'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {runMatch}=require('./headless.cjs');
const {selectTrajectory}=require('./detached-simulator-game-contrast.cjs');
const {installPinnedDecisionSourceZoneObserver}=
  require('./decision-source-zone-observer.cjs');
const {installPostSuperAliasRepairHook}=
  require('./post-super-alias-repair-hook.cjs');

/** @param {unknown} a @param {unknown} b @param {string} prefix */
function changedPath(a,b,prefix='root'){
  if(Object.is(a,b))return null;
  if(!a||!b||typeof a!=='object'||typeof b!=='object')return prefix;
  const keys=new Set([...Object.keys(a),...Object.keys(b)]);
  for(const key of [...keys].sort()){
    if(!Object.hasOwn(a,key)||!Object.hasOwn(b,key))return prefix+'.'+key;
    const nested=changedPath(a[key],b[key],prefix+'.'+key);
    if(nested!==null)return nested;
  }
  return null;
}

/** @param {object} request @param {boolean} corrected */
function withZoneObservation(request,corrected){
  const observer=installPinnedDecisionSourceZoneObserver();
  let undo=null;
  try{
    if(corrected)undo=installPostSuperAliasRepairHook();
    const game=selectTrajectory(runMatch(request));
    return {game,decisions:observer.report.decisions};
  }finally{
    if(undo)undo();
    observer.restore();
  }
}

/** @returns {object} Predecision source-state divergence, not gameplay qualification. */
function compareSourcePredecisionZones(){
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const ranks=new Map(field.decks.map(d=>[d.rank,d]));
  const request={deckA:ranks.get(1).cardIds,deckB:ranks.get(10).cardIds,
    seed:20261049,maxActions:350,strictPromptValidation:true,
    forestSealSearchCorrection:true,supporterDecisionCorrection:true,
    doubleDragonRecovery:true,isolatePolicyRandomness:true};
  const check=selectTrajectory(runMatch(request));
  const original=withZoneObservation(request,false);
  assert.deepEqual(original.game,check,
    'Predecision zone observer changed original game summary');
  const corrected=withZoneObservation(request,true);
  assert.deepEqual(original.game.deckHashes,corrected.game.deckHashes);
  assert.equal(original.game.actualFirstTurn,corrected.game.actualFirstTurn);
  let first=null;
  const count=Math.max(original.decisions.length,corrected.decisions.length);
  for(let i=0;i<count;i++){
    const a=original.decisions[i],b=corrected.decisions[i];
    if(a?.digest===b?.digest)continue;
    first={
      ordinal:i+1,
      baseline:a?{turn:a.turn,actorSeat:a.actorSeat,
        pending:a.pending,digest:a.digest}:null,
      corrected:b?{turn:b.turn,actorSeat:b.actorSeat,
        pending:b.pending,digest:b.digest}:null,
      firstDifferentZonePath:a&&b?
        changedPath(a.snapshot,b.snapshot):'one trajectory ended'
    };
    break;
  }
  return {
    experiment:'first-source-zone-predecision-divergence-v1',
    ranks:[1,10],seed:20261049,matchedUnobservedControl:true,
    baselineDecisions:original.decisions.length,
    correctedDecisions:corrected.decisions.length,
    first,
    gameSummary:{original:original.game.recordFingerprint,
      corrected:corrected.game.recordFingerprint},
    qualification:'unqualified-paired-weak-bot-diagnostic'
  };
}
if(require.main===module)process.stdout.write(
  JSON.stringify(compareSourcePredecisionZones(),null,2)+'\n');
module.exports={changedPath,compareSourcePredecisionZones};
