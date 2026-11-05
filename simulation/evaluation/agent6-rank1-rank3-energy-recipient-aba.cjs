'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {firstPhysicalTargetDifference}=
  require('../twinleaf/native-accepted-target-sidecar.cjs');

const VERSION='agent6-original-rank1-rank3-symmetric-basic-recipient-aba-v1';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const SEEDS=[3565472974,130758722,3792360798,1654918696];
const SOURCE_60='72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f';
const REFERENCE_60='de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311';
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const BASIC=/^(?:Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy /;

/**
 * Inspect a single Store-dispatched PlayCardAction's exact publicly observed
 * attachment. A returned Store call alone is never proof of card transfer.
 * @param {object} event Accepted native target-sidecar event.
 * @returns {object|null} Physical recipient with source owner and printing.
 */
function verifiedBasicRecipient(event){
  if(event?.storeAccepted!==true||
     event.action!=='PlayCardAction'||
     event.declared?.kind!=='play-card'||
     !BASIC.test(event.declared.ownerHandPrinting??'')||
     !Array.isArray(event.publicBoardChanges))return null;
  const printing=event.declared.ownerHandPrinting;
  for(const change of event.publicBoardChanges){
    const before=change.before,after=change.after;
    if(change.seat!==event.playerSlot||
       !['active','bench'].includes(change.position)||
       !before?.pokemon||before.pokemon!==after?.pokemon||
       !Array.isArray(before.energies)||!Array.isArray(after.energies)||
       after.energies.length!==before.energies.length+1)continue;
    const prior=before.energies.filter(e=>e===printing).length;
    const later=after.energies.filter(e=>e===printing).length;
    if(later!==prior+1)continue;
    return {
      actionOrdinal:event.rootActionOrdinal??null,
      actorSeat:event.playerSlot,ownerHandPrinting:printing,
      position:change.position,benchIndex:change.index,
      gameTurn:event.turnBefore,
      category:'publicly-observed-physical-basic-attachment'
    };
  }
  return null;
}

/**
 * A read-only summary of a real original source game. Terminal boards can
 * reflect KOs or later switching; do not extrapolate historic placement.
 * @param {object} arm Full genuine Store attempt.
 * @returns {object}
 */
function summarizeArm(arm){
  const seat=arm.rank1Seat;
  const board=arm.finalPublicBoard?.[seat]??null;
  const sidecar=arm.nativeAcceptedTargetSidecar??null;
  const attachments=(sidecar?.events??[])
    .map(verifiedBasicRecipient).filter(Boolean);
  return {
    id:arm.id,seed:arm.seed,rank3Seat:arm.rank3Seat,
    rank1Seat:seat,status:arm.status,
    initialPhysicalDeal:arm.fullDealSha256??null,
    originalRank3Deal:arm.rank3DealSha256??null,
    nativeRootSha:arm.rootLedgerSha256??null,
    nativeRootCount:arm.rootCount??null,
    rank1NativeAttacks:arm.rank1AttackCount??null,
    rank3NativeAttacks:arm.rank3AttackCount??null,
    winner:arm.winner??null,
    rank1TerminalActive:board?.active?.name??null,
    rank1TerminalActiveEnergy:board?.active?.energyCards?.length??null,
    rank1TerminalBenchEnergy:board?.bench?.reduce(
      (n,slot)=>n+(slot?.energyCards?.length??0),0)??null,
    rank1TerminalBenchPokemon:board?.bench?.length??null,
    sourceNativeBasicAttachments:attachments.filter(x=>
      x.actorSeat===arm.rank3Seat),
    rank1NativeBasicAttachments:attachments.filter(x=>
      x.actorSeat===arm.rank1Seat),
    nativeAcceptedTargetsLinked:sidecar?.rootOrdinalLinked===true,
    nativeAcceptedTargetsObserved:sidecar?.observedTargetActions??null,
    engineError:arm.error??null,
    qualifiedGame:false
  };
}

/**
 * Pair same-original-sixty source games with physical-deal equality and
 * repeat-control action-skeleton equality, even if treatment diverged.
 * @param {[object,object,object]} arms Original, treatment, original repeat.
 * @returns {object} Fail-closed group assessment.
 */
function pairGroup(arms){
  const [control,treatment,repeat]=arms;
  const first=summarizeArm(control),next=summarizeArm(treatment),
    last=summarizeArm(repeat);
  const matched=arms.every(a=>
    a.status!=='native-error'&&
    a.originalSource60Hash===SOURCE_60&&
    a.originalReference60Hash===REFERENCE_60&&
    a.seed===control.seed&&a.rank3Seat===control.rank3Seat&&
    a.rank1Seat===control.rank1Seat&&
    a.nativeVerifiedStartByDraw===true&&
    a.actualFirstSeat===control.actualFirstSeat&&
    a.fullDealSha256!=null&&a.fullDealSha256===control.fullDealSha256&&
    a.rank3DealSha256!=null&&a.rank3DealSha256===control.rank3DealSha256
  );
  const exactControlReplay=matched&&
    control.rootLedgerSha256===repeat.rootLedgerSha256&&
    control.status===repeat.status&&
    control.winner===repeat.winner&&
    control.globalTurns===repeat.globalTurns&&
    control.actions===repeat.actions&&
    digest(control.finalPublicBoard)===digest(repeat.finalPublicBoard);
  const target=firstPhysicalTargetDifference(
    control.nativeAcceptedTargetSidecar,
    treatment.nativeAcceptedTargetSidecar);
  return {
    seed:control.seed,rank3Seat:control.rank3Seat,
    matchedAuthenticInitialPhysicalDeal:matched,
    exactControlRepeat:exactControlReplay,
    selectivePhysicalTargetDifference:target,
    classification:matched&&exactControlReplay?
      'paired-development':'unverified-or-nonreproducible',
    control:first,treatment:next,controlRepeat:last
  };
}

/** @param {object[]} groups All preregistered groups. */
function summarizeGroups(groups){
  const rows=groups.flatMap(g=>[
    {group:g,kind:'control',arm:g.control},
    {group:g,kind:'treatment',arm:g.treatment}
  ]);
  const byPolicy={control:{},treatment:{}};
  for(const key of Object.keys(byPolicy)){
    const samples=rows.filter(x=>x.kind===key).map(x=>x.arm);
    byPolicy[key]={
      gameAttempts:samples.length,
      nativeTerminals:samples.filter(x=>x.status==='native-terminal').length,
      nativeErrors:samples.filter(x=>x.status==='native-error').length,
      rank1NativeAttacks:samples.reduce((n,a)=>
        n+(a.rank1NativeAttacks??0),0),
      rank3NativeAttacks:samples.reduce((n,a)=>
        n+(a.rank3NativeAttacks??0),0),
      rank1BenchedBasicAttachments:samples.reduce((n,a)=>
        n+a.rank1NativeBasicAttachments.filter(x=>
          x.position==='bench').length,0),
      rank3BenchedBasicAttachments:samples.reduce((n,a)=>
        n+a.sourceNativeBasicAttachments.filter(x=>
          x.position==='bench').length,0),
      rank1TerminalZeroBenchEnergy:samples.filter(a=>
        a.rank1TerminalBenchEnergy===0).length,
      rank1ZeroAttackNinePsychicDialga:samples.filter(a=>
        a.rank1TerminalActive==='Dialga-GX'&&
        a.rank1TerminalActiveEnergy===9&&
        a.rank1NativeAttacks===0&&
        a.rank1TerminalBenchEnergy===0).length
    };
  }
  return byPolicy;
}

/**
 * Executes 8 already known historical source seed/seat groups. One symmetric
 * default-off owner-recipient switch differentiates each A/B/A pair.
 * @returns {object} Failure-inclusive developmental receipt with raw arms.
 */
function run(){
  const {initializeCards}=require('../twinleaf/headless.cjs');
  const {originals}=require('./agent41-rank3-arbitration-original-store.cjs');
  const {runArm}=require('./agent2-fresh-rank1-rank3-multibasic-panel.cjs');
  initializeCards();
  const decks=originals();
  assert.equal(digest(decks.source),SOURCE_60);
  assert.equal(digest(decks.candidate),REFERENCE_60);
  const previous=new Map([
    ['AGENT8_ACTOR_QUICK_BALL_DEV',process.env.AGENT8_ACTOR_QUICK_BALL_DEV],
    ['AGENT41_OWNER_TERMINAL_ARBITRATION_DEV',
      process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV]
  ]);
  const groups=[];
  try{
    process.env.AGENT8_ACTOR_QUICK_BALL_DEV='false';
    process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV='false';
    for(const seed of SEEDS){
      for(const rank3Seat of [0,1]){
        const modes=[
          {label:'control',energyRecipient:false},
          {label:'treatment',energyRecipient:true},
          {label:'control-repeat',energyRecipient:false}
        ];
        const arms=modes.map(mode=>runArm({
          id:[seed,rank3Seat,mode.label].join(':'),
          seed,rank3Seat,mode:'control',
          energyRecipient:mode.energyRecipient,
          captureTargets:true
        },decks));
        groups.push({seed,rank3Seat,arms});
      }
    }
  }finally{
    for(const [key,value] of previous){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
  const pairs=groups.map(g=>pairGroup(g.arms));
  const actualArms=groups.flatMap(g=>g.arms);
  const paired=pairs.every(p=>p.classification==='paired-development');
  return {
    version:VERSION,pinnedNativeRevision:PIN,
    originalRank3Source60Sha256:SOURCE_60,
    originalRank1Reference60Sha256:REFERENCE_60,
    frozenHistoricalSeeds:SEEDS,
    ranks:[3,1],originalSeedSeatGroups:8,
    expectedArms:24,actualArms:actualArms.length,
    controlsMatched:paired,
    symmetricEnergyRecipientTreatment:true,
    onlyGamePolicyDifference:'actor owner-public Basic Energy recipient flag',
    retrospectiveReusedSeeds:true,newRandomSeedCount:0,
    experimentalNativeSummary:summarizeGroups(pairs),
    groups:pairs,rawArms:actualArms,
    competitivelyQualifiedGames:0,
    noCompetitiveWinRateClaim:true,
    limitations:[
      'Root-skeleton hashes omit PlayCardAction target information',
      'Native accepted target and immediate public delta do not prove complete legal gameplay',
      'Original two-rank historical seeds reused; no fresh independent opponent competence test',
      'Unresolved paper-rule, 25-minute clock and 32-original-field gaps'
    ]
  };
}
if(require.main===module){
  try{
    const result=run();
    process.stdout.write(JSON.stringify(result)+'\n');
    if(!result.controlsMatched||result.actualArms!==24)
      process.exitCode=1;
  }catch(error){
    process.stdout.write(JSON.stringify({
      version:VERSION,status:'runner-failure',
      error:String(error?.stack??error).slice(0,6000),
      competitivelyQualifiedGames:0
    })+'\n');
    process.exitCode=1;
  }
}
module.exports={VERSION,SEEDS,verifiedBasicRecipient,summarizeArm,
  pairGroup,summarizeGroups,run};
