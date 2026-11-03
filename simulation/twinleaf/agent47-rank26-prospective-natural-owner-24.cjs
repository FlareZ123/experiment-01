'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');
const {initializeCards} = require('./headless.cjs');
const {withDealFingerprint} =
  require('./rank26-natural-pre-koko-cologne-cohort.cjs');
const {runWithResearchProfile,RANK26_PROPAGATION_PROFILE} =
  require('./policy-profiles.cjs');
const {withRank26SourceSetup} =
  require('./agent3-rank26-energy-setup.cjs');
const {withRank26CologneOpener} =
  require('./rank26-cologne-opener.cjs');
const {withRank26ExeggcutePump} =
  require('./rank26-exeggcute-pump-policy.cjs');
const {withEggDonorRecovery} =
  require('./agent47-rank26-egg-donor-recovery-optin.cjs');
const {saveResult} =
  require('./agent3-rank26-compressor-settlement-prospective-v2.cjs');

const PIN = 'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const BASE=20261110;
const REPEATS=Object.freeze(Array.from({length:12},(_,i)=>20+i));
const CAP=120;
const digest=cards=>crypto.createHash('sha256')
  .update(JSON.stringify(cards)).digest('hex');

/**
 * Synchronous source-only opt-ins over the unchanged rank26 native profile.
 * Each wrapper restores its own prototype on exit, including engine errors.
 * @param {object} request
 * @param {0|1} seat
 */
function treatment(request,seat) {
  const r=withRank26SourceSetup(seat,()=>
    withRank26CologneOpener(seat,()=>
      withRank26ExeggcutePump(seat,()=>
        withEggDonorRecovery(seat,()=>
          runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE)),
        {allowEggToEggFifthKo:true,requireOpponentSoloActive:true}),
      {unlockBenchedKoko:true,minimumDiscardLightning:1}),
    {oneLightningTwoEggs:true});
  return {
    game:r.result.result.result.result,
    policyAudit:{
      earlyCompressor:r.policyAudit,
      oneLightningCologne:r.result.policyAudit,
      eggDonorPump:r.result.result.policyAudit,
      finalRecovery:r.result.result.result.policyAudit
    }
  };
}

/**
 * Read native actual accepted owner actions, with original initial deal
 * provenance and every native exception preserved.
 * @param {object} observation
 * @param {0|1} seat
 * @param {number} seed
 * @param {string[]} a
 * @param {string[]} b
 * @param {boolean} opted
 */
function describe(observation,seat,seed,a,b,opted) {
  const payload=observation.result;
  const game=opted?payload?.game:payload;
  const out={
    actualLiveStore:observation.liveRootIdentified,
    initialFullPhysicalDigest:observation.physicalRoot?.digestSha256??null,
    error:observation.error,
    actualSourceFirst:null,
    sourceFirstAcceptedActions:[],
    sourceFirstCompressorPlays:0,
    sourceFirstPumpPlays:0,
    sourceFirstCrisisPunch:0,
    sourceFirstKokoAbility:0,
    sourceFirstColognePlays:0,
    sourceFirstOpponentPrizes:null,
    nativeTerminal:false,nativeWinner:null,actionCap:false,
    policyAudit:opted?payload?.policyAudit??null:null
  };
  if(!game)return out;
  assert.equal(game.engine,PIN);
  assert.equal(game.seed,seed);
  assert.deepEqual(game.deckHashes,[digest(a),digest(b)]);
  assert.equal(game.verifiedByDrawLog,true);
  assert.equal(game.researchPolicyProfile,RANK26_PROPAGATION_PROFILE);
  out.actualSourceFirst=game.firstTurnSlot===seat;
  out.nativeTerminal=game.finished===true;
  out.nativeWinner=game.finished===true?game.winner:null;
  out.actionCap=game.finished!==true;
  const rows=(game.decisionTrace||[]).filter(e=>
    e.playerSlot===seat&&e.turnBefore===1);
  out.sourceFirstAcceptedActions=rows.map(e=>({
    ordinal:e.actionOrdinal,action:e.action,
    card:e.card??null,ability:e.ability??null,
    attack:e.attack??null,
    opponentPrizesAfter:e.prizesAfter?.[1-seat]??null
  }));
  out.sourceFirstCompressorPlays=rows.filter(e=>
    e.action==='PlayCardAction'&&e.card==='Battle Compressor').length;
  out.sourceFirstPumpPlays=rows.filter(e=>
    e.action==='PlayCardAction'&&e.card==='Damage Pump').length;
  out.sourceFirstCrisisPunch=rows.filter(e=>
    e.action==='AttackAction'&&e.attack==='Crisis Punch').length;
  out.sourceFirstKokoAbility=rows.filter(e=>
    e.action==='UseAbilityAction'&&e.ability==='Dance of the Ancients').length;
  out.sourceFirstColognePlays=rows.filter(e=>
    e.action==='PlayCardAction'&&e.card==='Canceling Cologne').length;
  out.sourceFirstOpponentPrizes=rows.at(-1)?.prizesAfter?.[1-seat]??null;
  return out;
}

/** Registered full denominator, no source or outcome selection. */
function run() {
  initializeCards();
  const planned=planAichi(26,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const source=planned.candidate.cards;
  const opponent=planned.opponents.find(d=>d.rank===6)?.cards;
  assert.equal(source.length,60);
  assert.equal(opponent?.length,60);
  const cases=[],seedsSeen=new Set();
  for(const repeat of REPEATS){
    const seeds=deriveSlotSeeds(BASE,'pilot',26,repeat);
    for(const [slot,seat,seed] of [['A',0,seeds.A],['B',1,seeds.B]]){
      assert.ok(Number.isSafeInteger(seed)&&seed>0&&!seedsSeen.has(seed));
      seedsSeen.add(seed);
      const a=seat===0?source:opponent;
      const b=seat===1?source:opponent;
      const request={
        deckA:a,deckB:b,rank26SourceSeat:seat,
        seed,maxActions:CAP,strictPromptValidation:true,
        isolatePolicyRandomness:true,captureDecisionTrace:true,
        battleCompressorPositiveSelectionCorrection:true,
        forestSealSearchCorrection:true,
        leleEntryAbilityLockCorrection:true,
        entryDrawLockCorrection:true,
        label:'agent47-rank26-natural-owner-'+repeat+'-'+slot
      };
      const rawControl=withDealFingerprint(()=>
        runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE));
      const rawSelected=withDealFingerprint(()=>treatment(request,seat));
      const control=describe(rawControl,seat,seed,a,b,false);
      const selected=describe(rawSelected,seat,seed,a,b,true);
      const physicalParity=control.initialFullPhysicalDigest &&
        selected.initialFullPhysicalDigest?
        control.initialFullPhysicalDigest===selected.initialFullPhysicalDigest?
          'EXACT_FULL_INITIAL_PHYSICAL_MATCH':'PHYSICAL_MISMATCH':
          'UNVERIFIED';
      cases.push({
        repeat,slot,seed,sourceSeat:seat,
        physicalParity,
        control,selected,
        competitiveGameQualified:false
      });
    }
  }
  const allErrors=cases.flatMap(c=>[
    c.control.error?{repeat:c.repeat,slot:c.slot,arm:'control',
      error:c.control.error}:null,
    c.selected.error?{repeat:c.repeat,slot:c.slot,arm:'selected',
      error:c.selected.error}:null
  ]).filter(Boolean);
  const first=cases.filter(c=>c.control.actualSourceFirst===true);
  return {
    schema:'agent47-rank26-preregistered-natural-owner-24-paired-v1',
    registration:'results/aichi-2026/registrations/agent47-rank26-natural-unownless-owner-24-paired-20261103.md',
    engine:PIN,sourceRank:26,opponentRank:6,
    sourceDigest:digest(source),opponentDigest:digest(opponent),
    seedBase:BASE,repeats:[20,31],seats:[0,1],cap:CAP,
    nativeAttempts:48,originalPhysicalPairs:24,
    controlPolicy:RANK26_PROPAGATION_PROFILE,
    treatmentPolicy:'rank26-owner-early-compressor-one-L-two-Eggs + one-L Cologne + fifth Egg donor + Egg recovery over unchanged rank26 propagation-v3',
    summary:{
      pairs:cases.length,
      nativeAttempts:cases.length*2,
      physicalMatched:cases.filter(c=>
        c.physicalParity==='EXACT_FULL_INITIAL_PHYSICAL_MATCH').length,
      physicalMismatched:cases.filter(c=>
        c.physicalParity==='PHYSICAL_MISMATCH').length,
      physicalUnverified:cases.filter(c=>
        c.physicalParity==='UNVERIFIED').length,
      firstSourceDeals:first.length,
      firstControlCompressor:first.filter(c=>
        c.control.sourceFirstCompressorPlays>0).length,
      firstSelectedCompressor:first.filter(c=>
        c.selected.sourceFirstCompressorPlays>0).length,
      firstSelectedCompressorProposals:first.filter(c=>
        c.selected.policyAudit?.earlyCompressor?.events.some(e=>
          e.kind==='native-held-item-proposal')).length,
      firstSelectedCompressorPromptSelections:first.filter(c=>
        c.selected.policyAudit?.earlyCompressor?.events.some(e=>
          e.kind==='native-own-deck-selection')).length,
      firstControlPump:first.filter(c=>
        c.control.sourceFirstPumpPlays>0).length,
      firstSelectedPump:first.filter(c=>
        c.selected.sourceFirstPumpPlays>0).length,
      firstSelectedEggDonorChoices:first.filter(c=>
        c.selected.policyAudit?.eggDonorPump?.actions.some(a=>
          a.kind==='egg-to-egg-fifth-KO')).length,
      firstSelectedEggRecoveryChoices:first.filter(c=>
        c.selected.policyAudit?.finalRecovery?.actions.length>0).length,
      firstControlCrisis:first.filter(c=>
        c.control.sourceFirstCrisisPunch>0).length,
      firstSelectedCrisis:first.filter(c=>
        c.selected.sourceFirstCrisisPunch>0).length,
      firstSelectedFiveKoState:first.filter(c=>
        c.selected.sourceFirstOpponentPrizes===1).length,
      nativeErrors:allErrors,
      controlTerminals:cases.filter(c=>c.control.nativeTerminal).length,
      selectedTerminals:cases.filter(c=>c.selected.nativeTerminal).length,
      competitiveQualifiedGames:0
    },
    cases
  };
}

if(require.main===module) {
  const result=run();
  const target=path.resolve(process.cwd(),
    'agent47-rank26-natural-owner-24-paired.json');
  saveResult(target,result);
  process.stdout.write('AGENT47_RANK26_NATURAL_OWNER_24 '+
    JSON.stringify(result.summary)+'\n');
  if(result.summary.pairs!==24||result.summary.nativeAttempts!==48||
     result.summary.physicalMatched!==24||
     result.summary.physicalMismatched!==0||
     result.summary.physicalUnverified!==0||
     result.summary.nativeErrors.length)
    process.exitCode=1;
}
module.exports={run,treatment,describe,BASE,REPEATS};
