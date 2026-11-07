'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {initializeCards,runMatch}=require('../twinleaf/headless.cjs');
const {originals}=require('./agent41-rank3-arbitration-original-store.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withActorOnlyRootPolicy}=
  require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {withNativePaperSupporterDiscipline}=
  require('../twinleaf/agent41-paper-supporter-discipline.cjs');
const {withSameTargetAttachEnergySelection}=
  require('../twinleaf/same-target-attach-energy-hook.cjs');
const {withReadOnlyFssFloatRootCensus}=
  require('./agent2-rank3-original-fss-float-census.cjs');
const {withOwnerZoneAudit}=
  require('../twinleaf/agent1-owner-zone-observer.cjs');

const VERSION='agent1-rank3-owner-zone-reachability-scan-v1';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const ROOT_LIMIT=260;
const SEEDS=Object.freeze(Array.from({length:16},(_,i)=>290130+i));
const ROOT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(ROOT,name));
const sha=value=>createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');
const SOURCE_DECK_SHA='72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f';
const CANDIDATE_DECK_SHA='de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311';

const EXPECTED=Object.freeze([
  {seed:290130,status:'native-terminal',winner:1,actions:44,
    full:'7e9f28a7d60428e1656428f75532dc28321986b24d4117601c3e1b6779f57b6f',
    source:'4f197f971ae175167abe21eb444b30fcd5ff77ea6bb56ecd593899c1e581eb54'},
  {seed:290131,status:'native-terminal',winner:1,actions:48,
    full:'20f575af5192c0dc5c27bc8df5d000bd9ee00e5908d8688fab1d92e34231ee29',
    source:'0d856c97d9c45f1318a69c0e22aff27902cb2737c8efe932ce356cd920c13678'},
  {seed:290132,status:'action-cap',winner:-1,actions:260,
    full:'27091f14c337a16b7b370a262bb7d0178a6947dfd88d40699c3ff3a4ea101ef3',
    source:'e1abb824823bcf43ff74bf645385e27bf7157c1f056d951fd744b3d8da732646'},
  {seed:290133,status:'action-cap',winner:-1,actions:260,
    full:'ea362f186745c60635c06bc9e89b2f88f305f020b2ee16507d16dd4ad00d1e68',
    source:'4894d8dc50de006cd530691a5e78deaca192a3441234dfbe999411e9d945dc09'},
  {seed:290134,status:'native-terminal',winner:0,actions:133,
    full:'e7304d2a152496945cb9513e50a5e5680a6405ada4cc8ceb1e447f6ade7dddeb',
    source:'ed055a7d1db05b794eea2c63661593e21961dac77e850674ef2dbab57bfa787a'},
  {seed:290135,status:'action-cap',winner:-1,actions:260,
    full:'8be7348a8b07a434595351e3c9d2003a648443c7d50af469997f385e0fd0dac9',
    source:'6269f134689aabe7b56fe0c991279c75e7ea01aa5e1868ee0d3782ee1c05d74c'},
  {seed:290136,status:'native-terminal',winner:1,actions:42,
    full:'f7478a732e0bc8ecdd861385360185c788a5e498b5c081cac78ced8437d87770',
    source:'bf82eb03b6867265385f0a9b30730ea40ad78cddbb02bad991777cb5628cff73'},
  {seed:290137,status:'action-cap',winner:-1,actions:260,
    full:'117b4afba865e32e796a91d7aae4fb431f9b2631f45b1bce5cf9f461ad1c1144',
    source:'59e960b13d46212fa47ee98da382f23f89dad9d4f0896cae7b61dcd0aa4f1ba5'},
  {seed:290138,status:'native-terminal',winner:0,actions:209,
    full:'e1c3a672fd79c6f80f116f4e3de8b3f59b36c606818e08da05a4336e739bd7f5',
    source:'c34ceb8378b0766437cee466c53ab2b696eed403ee88259ef469985dfd21a4b4'},
  {seed:290139,status:'native-terminal',winner:1,actions:233,
    full:'1f8a233b6a06d2bbdcf75cbcdd0599b6f365bb1383285d08f45c00b7bc663d5c',
    source:'68a4f73e6d147c4f14503b0058aa0ecd74b5e02901209bc07b4caa6798a71a79'},
  {seed:290140,status:'native-terminal',winner:1,actions:169,
    full:'2af3324110380e246e299ebc886dbab26167ba79886ec2ae30f536751338d90c',
    source:'acd846977b7ce0cd75da4385acf5473d142304241634efff019161d4d5cce953'},
  {seed:290141,status:'action-cap',winner:-1,actions:260,
    full:'d89e25289a0121f6f3583c7440ef5c22d9007a05b1b776ea523b2e94abd5ca34',
    source:'577c0ed4384477be8ccb4068493054e74786202be63da9a37a0c6822cadb1d7b'},
  {seed:290142,status:'native-terminal',winner:1,actions:175,
    full:'cc3864dbb77ec0a7d8c6a56be75c93beda878f5cd65d93c15ba44528accc2d10',
    source:'28fb07f49d54a8990ec59ec2af59d425601fcd82193286af703033fc288e82ae'},
  {seed:290143,status:'action-cap',winner:-1,actions:260,
    full:'4daf490b454a6064e35452047cdc00fdcf2b34d80302af83613ba19ea2010a46',
    source:'2ed96839b4285864d9ac35b5fa4daf59b68457798d0dfb768790e0839ffd4fba'},
  {seed:290144,status:'action-cap',winner:-1,actions:260,
    full:'b96f75c6658d9e301a37eb79e15b1bbfb5e3f4aab7d85c224793d17b5a625e99',
    source:'c389e9e38c73c7fdc8c1dd52cce641fa8b0b50d9c5304cf691c9b8a3774d67b7'},
  {seed:290145,status:'action-cap',winner:-1,actions:260,
    full:'e23f12bb8716132873187dcbb771e107f2e36ee84d43974d48b451c755d79bc8',
    source:'ffe853f8799da783d9a2b2e53fb82e8286066350c1ac85fcc567f568d64f6a9c'}
]);

const PREFIXES=Object.freeze({
  handiwork:"Team Rocket's Handiwork",
  trainersMail:"Trainers' Mail",
  forestSealStone:'Forest Seal Stone',
  arven:'Arven',
  teammates:'Teammates',
  vsSeeker:'VS Seeker',
  lusamine:'Lusamine',
  lilliesDetermination:"Lillie's Determination",
  playersCeremony:"Player's Ceremony",
  tropicalBeach:'Tropical Beach',
  rotomV:'Rotom V',
  bunnelby:'Bunnelby'
});

/** @param {string[]} cards @returns {object} Relevant physical-printing counts. */
function relevantCounts(cards){
  return Object.fromEntries(Object.entries(PREFIXES).map(([key,prefix])=>[
    key,cards.filter(name=>name.startsWith(prefix)).length
  ]));
}

/** @param {object[]} snapshots @returns {object[]} Compact, reproducible rows. */
function summarizeSnapshots(snapshots){
  return snapshots.map(row=>{
    const snapshot=row.snapshot;
    const owner=snapshot.owner;
    const locations=owner.handiworkLocations;
    const location=locations.length===1?locations[0]:
      locations.length===0?'unseen':'multiple';
    const keepFullZones=location==='hand'||location==='discard'||
      owner.structuralRototillerCandidate;
    const zones=owner.zones;
    const prizeCount=zones.prizes.reduce((sum,prize)=>sum+prize.length,0);
    return {
      dispatchOrdinal:row.dispatchOrdinal,
      actionClass:row.actionClass,
      actionName:row.actionName,
      digest:row.digest,
      turn:snapshot.turn,
      decisionKind:snapshot.decisionKind,
      pendingPrompt:snapshot.pendingPrompt,
      handiworkLocation:location,
      bunnelbyActive:owner.bunnelbyActive,
      bunnelbyAttachedEnergyCount:owner.bunnelbyAttachedEnergyCount,
      bunnelbyAttacksThisTurn:owner.bunnelbyAttacksThisTurn,
      ownerSupporterTurn:owner.supporterTurn,
      ownerEnergyPlayedTurn:owner.energyPlayedTurn,
      ownerUsedGX:owner.usedGX,
      ownerUsedVSTAR:owner.usedVSTAR,
      ownerCannotPlaySupporterCards:owner.cannotPlaySupporterCards,
      ownerActivePrinting:zones.activePublic?.printing??null,
      ownerActiveEnergyPrintings:zones.active.energies,
      ownerSupporterZonePrintings:zones.supporter,
      hasRototiller:owner.hasRototiller,
      structuralRototillerCandidate:owner.structuralRototillerCandidate,
      ownerDeckCount:zones.deck.length,
      ownerHandCount:zones.hand.length,
      ownerDiscardCount:zones.discard.length,
      ownerPrizeCount:prizeCount,
      opponentPublicDeckCount:snapshot.opponentPublic.deckCount,
      relevantDeckCounts:relevantCounts(zones.deck),
      relevantHandCounts:relevantCounts(zones.hand),
      relevantDiscardCounts:relevantCounts(zones.discard),
      ...(keepFullZones?{ownerZones:zones}:{}),
      opponentHiddenZonesInspected:false
    };
  });
}

/** @param {object} c Frozen physical-deal slot @param {object} cards Original 60s. */
function runOne(c,cards){
  try{
  const {Store}=native('game/store/store');
  const {GamePhase}=native('game/store/state/state');
  const deckA=c.candidateSeat===0?cards.candidate:cards.source;
  const deckB=c.candidateSeat===1?cards.candidate:cards.source;
  const request={
    deckA,
    deckB,
    seed:c.seed,
    maxActions:ROOT_LIMIT,
    label:'agent2-original-rank3-passive-fss-float-'+c.id,
    strictPromptValidation:true,
    mandatoryOptionFallback:true,
    enforceSelectOptionLegality:true,
    enforceVisiblePlayLockBothSeats:true,
    captureInitialFullPhysicalDeal:true,
    captureDecisionTrace:true,
    captureInitialSourceDealFingerprintSeat:c.sourceSeat
  };
  const guarded=withNativePaperSupporterDiscipline(()=>
    withCanonicalActorOnlyPolicy(()=>
      withOwnerZoneAudit(Store,c.sourceSeat,()=>
        withReadOnlyFssFloatRootCensus(c.sourceSeat,()=>
          withSameTargetAttachEnergySelection(()=>runMatch(request)).result
        ),
        {playerTurnPhase:GamePhase.PLAYER_TURN}
      ),
      {
        root:work=>withActorOnlyRootPolicy(work,{
          publicContextSpecialEnergy:true,specialEnergyRoot:true
        })
      },
      {ownerSingleSearch:true,genericFallbackAttribution:true}
    )
  );
  const ownerObserved=guarded.result.result;
  const fssObserved=ownerObserved.result;
  const game=fssObserved.result;
  const expected=EXPECTED.find(row=>row.seed===c.seed);
  const full=game.initialFullPhysicalDealFingerprint?.digestSha256??null;
  const source=game.initialSourceDealFingerprint?.digestSha256??null;
  const status=game.finished?'native-terminal':'action-cap';
  const rootLedger=sha(game.rootActionLedger??[]);
  const parity={
    expectedRowFound:Boolean(expected),
    fullPhysicalDealMatches:full===expected?.full,
    sourcePhysicalDealMatches:source===expected?.source,
    statusMatches:status===expected?.status,
    winnerMatches:(game.winner??null)===expected?.winner,
    actionCountMatches:(game.actions??null)===expected?.actions,
    sourceDeckMatches:sha(cards.source)===SOURCE_DECK_SHA,
    candidateDeckMatches:sha(cards.candidate)===CANDIDATE_DECK_SHA,
    seatDeckMappingMatches:
      sha(deckA)===(c.candidateSeat===0?CANDIDATE_DECK_SHA:SOURCE_DECK_SHA)&&
      sha(deckB)===(c.candidateSeat===1?CANDIDATE_DECK_SHA:SOURCE_DECK_SHA)
  };
  const ownerSnapshots=summarizeSnapshots(ownerObserved.snapshots);
  const ownerZoneAudit=ownerObserved.audit;
  const fssAudit=fssObserved.audit;
  return {
    case:c,
    status,
    nativeWinner:game.winner??null,
    nativeActions:game.actions??null,
    turns:game.turns??null,
    fullInitialDealSha256:full,
    sourceInitialDealSha256:source,
    rootLedgerSha256:rootLedger,
    parity,
    parityPass:Object.values(parity).every(Boolean),
    fssAudit,
    ownerZoneAudit,
    ownerSnapshots,
    sourceDeckSha256:sha(cards.source),
    candidateDeckSha256:sha(cards.candidate),
    competitivelyQualified:false
  };
  }catch(error){
    return {
      case:c,status:'native-error',error:error?.stack??String(error),
      parityPass:false,competitivelyQualified:false
    };
  }
}

/** @returns {object[]} Frozen, one-seat scan schedule. */
function schedule(){
  return SEEDS.map(seed=>({
    candidateSeat:1,sourceSeat:0,seed,
    id:'rank3-fresh-1-'+seed
  }));
}

function writeReceipt(receipt){
  const directory=process.env.AGENT1_RANK3_OWNER_ZONE_SCAN_DIR;
  if(!directory)return null;
  const fs=require('node:fs');
  fs.mkdirSync(directory,{recursive:true});
  const target=path.join(directory,'agent1-rank3-owner-zone-scan.json');
  const temporary=target+'.tmp-'+process.pid;
  const fd=fs.openSync(temporary,'wx');
  try{
    fs.writeFileSync(fd,JSON.stringify(receipt,null,2)+'\n');
    fs.fsyncSync(fd);
  }finally{
    fs.closeSync(fd);
  }
  fs.renameSync(temporary,target);
  return target;
}

function run(){
  const old=new Map([
    ['AGENT8_ACTOR_QUICK_BALL_DEV',process.env.AGENT8_ACTOR_QUICK_BALL_DEV],
    ['AGENT41_OWNER_TERMINAL_ARBITRATION_DEV',
      process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV]
  ]);
  try{
    process.env.AGENT8_ACTOR_QUICK_BALL_DEV='false';
    process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV='false';
    initializeCards();
    const cards=originals();
    const rows=schedule().map(c=>runOne(c,cards));
    const summary={
      attempted:rows.length,
      errors:rows.filter(row=>row.status==='native-error').length,
      parityFailures:rows.filter(row=>!row.parityPass).length,
      nativeTerminals:rows.filter(row=>row.status==='native-terminal').length,
      actionCapped:rows.filter(row=>row.status==='action-cap').length,
      ownerDecisionSnapshots:rows.reduce((sum,row)=>
        sum+(row.ownerZoneAudit?.capturedOwnerDecisions??0),0),
      ownerRootSnapshots:rows.reduce((sum,row)=>
        sum+(row.ownerZoneAudit?.ownerRootDecisions??0),0),
      ownerPromptSnapshots:rows.reduce((sum,row)=>
        sum+(row.ownerZoneAudit?.ownerPromptDecisions??0),0),
      handiworkInHandSnapshots:rows.reduce((sum,row)=>
        sum+(row.ownerZoneAudit?.handiworkInHand??0),0),
      handiworkInDiscardSnapshots:rows.reduce((sum,row)=>
        sum+(row.ownerZoneAudit?.handiworkInDiscard??0),0),
      structuralRototillerCandidateSnapshots:rows.reduce((sum,row)=>
        sum+(row.ownerZoneAudit?.structuralRototillerCandidates??0),0),
      gamesWithHandiworkInHand:rows.filter(row=>
        row.ownerSnapshots.some(snapshot=>snapshot.handiworkLocation==='hand')).length,
      gamesWithHandiworkInDiscard:rows.filter(row=>
        row.ownerSnapshots.some(snapshot=>snapshot.handiworkLocation==='discard')).length,
      gamesWithStructuralRototillerCandidate:rows.filter(row=>
        row.ownerSnapshots.some(snapshot=>snapshot.structuralRototillerCandidate)).length,
      competitivelyQualifiedGames:0
    };
    const result={
      version:VERSION,
      prospectiveScheduleCommittedBeforeExecution:true,
      sourceDeckSha256:sha(cards.source),
      candidateDeckSha256:sha(cards.candidate),
      nativePin:PIN,
      actionLimit:ROOT_LIMIT,
      sourceSeat:0,
      candidateSeat:1,
      seeds:[...SEEDS],
      expectedSourceDeckSha256:SOURCE_DECK_SHA,
      expectedCandidateDeckSha256:CANDIDATE_DECK_SHA,
      expectedBaselineArtifact:13364048992,
      summary,rows,
      caveat:'Sixteen source-seat-0 original-deal diagnostic replays under the existing weak common policy. Owner deck and Prize identities are retrospective observer data and never policy input. Opponent hidden identities are not read. Structural Rototiller candidates are not validated native attack prompts. This is not a paper-competitive matchup or win-rate estimate.'
    };
    result.controlsPass=summary.errors===0&&summary.parityFailures===0&&
      rows.every(row=>row.ownerZoneAudit?.liveStoreFound===true&&
        row.ownerZoneAudit?.opponentHiddenZonesInspected===false&&
        row.ownerZoneAudit?.notPolicyInput===true);
    result.artifactPath=writeReceipt(result);
    return result;
  }finally{
    for(const [name,value] of old){
      if(value===undefined)delete process.env[name];
      else process.env[name]=value;
    }
  }
}

if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!result.controlsPass)process.exitCode=1;
}
module.exports={VERSION,PIN,ROOT_LIMIT,SEEDS,EXPECTED,schedule,
  relevantCounts,summarizeSnapshots,runOne,run};
