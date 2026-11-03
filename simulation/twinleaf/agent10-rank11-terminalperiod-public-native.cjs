'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards,runMatch}=require('./headless.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('../evaluation/agent7-canonical-actor-composition.cjs');
const {withOwnerResourceTutorAfterPass}=
  require('./agent11-native-owner-resource-tutor-after-pass.cjs');
const {withNativeDeadFirstAttackAudit}=
  require('./agent1-native-dead-first-attack-audit.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {saveResult}=
  require('./agent3-rank26-compressor-settlement-prospective-v2.cjs');
const PIN='twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const DIGESTS={
  11312103:'fca89a227ebf6ab2a671372f646b6014634da9cbcbba839dfaecf9bf19bc011f',
  11312108:'b4128362adda3561d29dd4f3781aa3cdc6f1a1162bb2e0d4735df8e29f6124e7'
};

/** Read public Active damage and Prize counts at selected source attack roots. */
function run(){
  initializeCards();
  const original=planAichi(5,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true});
  const a=original.opponents.find(d=>d.rank===11)?.cards;
  const b=original.candidate.cards;
  assert.equal(a?.length,60);assert.equal(b.length,60);
  assert.equal(a.filter(x=>x==='Professors Letter BKT').length,4);
  const rows=[];
  for(const seed of [11312103,11312108]){
    for(const mode of ['control','resource-tutor']){
      const attackContexts=[];
      let tutorAudit=null;
      const request={deckA:a,deckB:b,seed,maxActions:90,
        strictPromptValidation:true,isolatePolicyRandomness:true,
        captureDecisionTrace:true,captureInitialFullPhysicalDeal:true,
        label:'agent10-public-tutor-'+seed+'-'+mode};
      const observed=withNativeDeadFirstAttackAudit(()=>{
        const selected=withCanonicalActorOnlyPolicy(()=>{
          if(mode==='control')return runMatch(request);
          const r=withOwnerResourceTutorAfterPass(()=>runMatch(request),[a,b]);
          tutorAudit=r.audit;return r.result;
        });
        return selected.result;
      },{
        observe(state,seat){
          const v=actorObservation(state,seat);
          if(seat===0&&v.ownPublic.active?.printing==='Mega Absol ex M1L'){
            attackContexts.push({turn:v.globalTurn,
              sourceSeat:seat,sourceActive:v.ownPublic.active.printing,
              attachedEnergy:[...v.ownPublic.active.energies],
              defendingActive:v.opponentPublic.active?.printing??null,
              defenderDamage:v.opponentPublic.active?.damage??null,
              ownPrizes:v.ownPublic.prizeCount,
              opponentPrizes:v.opponentPublic.prizeCount,
              terminalConditionMet:v.opponentPublic.active?.damage===60});
          }
          return v;
        }
      });
      const game=observed.result;
      assert.equal(game.engine,PIN);
      const digest=game.initialFullPhysicalDealFingerprint?.digestSha256;
      assert.equal(digest,DIGESTS[seed],
        'Historical original physical deal no longer reproducible');
      rows.push({seed,mode,digest,attackContexts,
        acceptedTutorItems:tutorAudit?.acceptedItems??0,
        settledTargets:tutorAudit?.physicalTargetsSettled??0,
        nativeAttackRootCount:observed.audit.realAttackRoots,
        nativeDeadAlternativeCount:observed.audit.eligibleDeadLeadingRoots,
        attackActions:(game.rootActionLedger??[]).filter(x=>
          x.action==='AttackAction').map(x=>({seat:x.playerSlot,
            turn:x.turnBefore,attack:x.attack})),
        gameFinished:game.finished===true,competitiveQualified:false});
    }
  }
  return {schema:'agent10-rank11-terminalperiod-public-native-v1',
    engine:PIN,sourceRanks:[11,5],historicalPairs:2,
    plannedOriginalV2:true,competitiveQualifiedGames:0,rows};
}
if(require.main===module){
  const result=run();
  saveResult(path.resolve(process.cwd(),
    'agent10-rank11-terminalperiod-public-native.json'),result);
  process.stdout.write('AGENT10_RANK11_TERMINAL_PUBLIC '+
    JSON.stringify(result.rows.map(x=>({seed:x.seed,mode:x.mode,
      damage:x.attackContexts.map(a=>a.defenderDamage),
      attacks:x.attackActions.length,tutorItems:x.acceptedTutorItems,
      settled:x.settledTargets})))+'\n');
}
module.exports={run};
