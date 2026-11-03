'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {RANK26_PROPAGATION_PROFILE,runWithResearchProfile}=
  require('./policy-profiles.cjs');
const {withDealFingerprint}=
  require('./rank26-natural-pre-koko-cologne-cohort.cjs');
const {withSourceCompressorRootProvenance}=
  require('./agent3-compressor-root-provenance-v3.cjs');
const {withRank26SourceSetup}=require('./agent3-rank26-energy-setup.cjs');
const {saveResult}=
  require('./agent3-rank26-compressor-settlement-prospective-v2.cjs');

const SEED_BASE=20261103;
const RANK=26;
const OPPONENT=6;
const REPEATS=Object.freeze(Array.from({length:12},(_,i)=>110+i));
const CAP=120;
const ENGINE='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const OUTPUT_NAME='agent3-rank26-paper-koko-one-lightning-native.json';

/**
 * Run the preregistered paper-one-Lightning/two-Egg policy on new original
 * physical dealt seeds, matching exact full deck fingerprints against the old
 * source-owned two-Lightning/one-Egg policy. No game is qualified for win rate.
 * @returns {object} Complete same-deal source receipt audit
 */
function run(){
  initializeCards();
  const field=planAichi(RANK,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const source=field.candidate.cards;
  const opponent=field.opponents.find(o=>o.rank===OPPONENT)?.cards;
  assert.equal(source.length,60);
  assert.equal(opponent?.length,60);
  const deals=[];
  const usedSeeds=new Set();
  for(const repeat of REPEATS){
    const seeds=deriveSlotSeeds(SEED_BASE,'pilot',RANK,repeat);
    for(const [slot,seat,seed] of [['A',0,seeds.A],['B',1,seeds.B]]){
      assert.ok(Number.isSafeInteger(seed)&&seed>0&&!usedSeeds.has(seed));
      usedSeeds.add(seed);
      const request={
        deckA:seat===0?source:opponent,
        deckB:seat===1?source:opponent,
        rank26SourceSeat:seat,seed,
        maxActions:CAP,strictPromptValidation:true,
        isolatePolicyRandomness:true,captureDecisionTrace:true,
        battleCompressorPositiveSelectionCorrection:true,
        forestSealSearchCorrection:true,
        leleEntryAbilityLockCorrection:true,
        entryDrawLockCorrection:true,
        label:'agent3-paper-koko-egg-'+repeat+'-'+slot
      };
      const arms=[];
      for(const variant of ['historical-two-lightning','paper-one-lightning-two-eggs']){
        const observed=withDealFingerprint(()=>
          withSourceCompressorRootProvenance(seat,()=>
            withRank26SourceSetup(seat,()=>
              runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE),
              {oneLightningTwoEggs:variant==='paper-one-lightning-two-eggs'})));
        const inner=observed.result?.result;
        const game=inner?.result??null;
        const audit=observed.result?.audit??null;
        const policy=inner?.policyAudit??null;
        const first=game?.firstTurnSlot===seat;
        const actions=(game?.decisionTrace??[]).filter(a=>
          a.playerSlot===seat&&a.turnBefore===1);
        const receiptItems=(audit?.receipts??[]).filter(r=>r.globalTurn===1)
          .flatMap(r=>r.physicallyMoved??[]);
        const uniqueIds=name=>[...new Set(receiptItems.filter(c=>c.name===name)
          .map(c=>c.id))];
        arms.push({
          variant,physicalRoot:observed.physicalRoot?.digestSha256??null,
          sourceFirst:first,liveRootIdentified:observed.liveRootIdentified,
          error:observed.error,policyVersion:policy?.version??null,
          nativeTerminal:game?.finished===true,
          firstTurnCompressorPlayCards:actions.filter(a=>
            a.action==='PlayCardAction'&&a.card==='Battle Compressor').length,
          firstTurnKokoAbilities:actions.filter(a=>
            a.action==='UseAbilityAction'&&a.ability==='Dance of the Ancients').length,
          firstTurnCrisisPunch:actions.filter(a=>
            a.action==='AttackAction'&&a.attack==='Crisis Punch').length,
          realRootCompressorSettlements:audit?.positiveLinkedSettlements??null,
          firstTurnSourceActionNames:actions.map(a=>a.card??a.ability??a.attack??a.action),
          distinctMovedLightningIds:uniqueIds('Lightning Energy'),
          distinctMovedExeggcuteIds:uniqueIds('Exeggcute'),
          paperOneLightningTwoEggsDiscarded:
            uniqueIds('Lightning Energy').length>=1&&
            uniqueIds('Exeggcute').length>=2,
          speculativeDispatchesIgnored:audit?.ignoredSpeculativeDispatches??null,
          settledCards:(audit?.receipts??[]).map(r=>({
            turn:r.globalTurn,sourceCard:r.sourceCard,
            moved:r.physicallyMoved
          })),
          policyEvents:policy?.events??[],
          competitivelyQualified:false
        });
      }
      deals.push({
        repeat,slot,seat,seed,
        physicalPair:arms[0].physicalRoot&&arms[0].physicalRoot===arms[1].physicalRoot?
          'EXACT_SOURCE_DEAL_MATCH':'UNVERIFIED_OR_DIFFERENT',
        arms
      });
    }
  }
  const sourceFirst=deals.filter(d=>d.arms.every(a=>a.sourceFirst));
  const armSum=(variant,key)=>sourceFirst.reduce((sum,d)=>
    sum+d.arms.filter(a=>a.variant===variant)
      .reduce((n,a)=>n+(a[key]===true?1:typeof a[key]==='number'?a[key]:0),0),0);
  const old='historical-two-lightning',newPolicy='paper-one-lightning-two-eggs';
  const summary={
    originalSourcePhysicalDeals:deals.length,nativeAttempts:deals.length*2,
    exactPhysicalPairs:deals.filter(d=>d.physicalPair==='EXACT_SOURCE_DEAL_MATCH').length,
    sourceFirstDeals:sourceFirst.length,
    errors:deals.flatMap(d=>d.arms).filter(a=>a.error).length,
    missingRoot:deals.flatMap(d=>d.arms).filter(a=>!a.liveRootIdentified).length,
    oldFirstTurnCompressor:armSum(old,'firstTurnCompressorPlayCards'),
    newFirstTurnCompressor:armSum(newPolicy,'firstTurnCompressorPlayCards'),
    oldRealSettlements:armSum(old,'realRootCompressorSettlements'),
    newRealSettlements:armSum(newPolicy,'realRootCompressorSettlements'),
    oldFullPackageDeals:armSum(old,'paperOneLightningTwoEggsDiscarded'),
    newFullPackageDeals:armSum(newPolicy,'paperOneLightningTwoEggsDiscarded'),
    oldFirstTurnKoko:armSum(old,'firstTurnKokoAbilities'),
    newFirstTurnKoko:armSum(newPolicy,'firstTurnKokoAbilities'),
    oldFirstTurnCrisisPunch:armSum(old,'firstTurnCrisisPunch'),
    newFirstTurnCrisisPunch:armSum(newPolicy,'firstTurnCrisisPunch'),
    competitivelyQualifiedGames:0
  };
  return {
    schema:'agent3-rank26-paper-one-lightning-two-eggs-original24-v1',
    preregistration:'results/aichi-2026/registrations/agent3-rank26-one-lightning-two-egg-paired-native-20261103.md',
    sourceRank:RANK,opponentRank:OPPONENT,
    fixedOriginal60s:[60,60],seedBase:SEED_BASE,
    repeats:[REPEATS[0],REPEATS.at(-1)],engineRevision:ENGINE,
    maxActions:CAP,sharedPolicy:RANK26_PROPAGATION_PROFILE,
    summary,deals
  };
}

module.exports={run,SEED_BASE,REPEATS};
if(require.main===module){
  const result=run();
  saveResult(path.resolve(process.cwd(),OUTPUT_NAME),result);
  process.stdout.write('PAPER_KOKO_ONE_LIGHTNING '+JSON.stringify(result.summary)+'\n');
  const s=result.summary;
  if(s.originalSourcePhysicalDeals!==24||s.nativeAttempts!==48||
     s.exactPhysicalPairs!==24||s.errors!==0||s.missingRoot!==0)
    process.exitCode=1;
}
