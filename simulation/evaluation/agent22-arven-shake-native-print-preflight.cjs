'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {planAichi}=require('./aichi-pilot.cjs');
const {initializeCards}=require('../twinleaf/headless.cjs');
const {writeAtomicLocked}=
  require('./agent49-pinned-source-print-census.cjs');
const {EnergyType}=
  require('../../vendor/twinleaf/ptcg-server/output/game/store/card/card-types');

const VERSION='agent22-arven-shake-fixed60-native-print-preflight-v1';
const CANDIDATE_PATH=
  'results/aichi-2026/candidate-arven-shake-absol-v1.json';
const CANDIDATE_BLOB_SHA='bdf94126d2fae5d72c9c8a83eb6a6c31ce831e34';
const SOURCE_RANK=11;
const OUTPUT=path.resolve(process.cwd(),
  'agent22-arven-shake-native-print-preflight.json');

function gitBlobSha(bytes){
  return createHash('sha1').update(
    Buffer.from('blob '+bytes.length+'\0','utf8')
  ).update(bytes).digest('hex');
}

/**
 * Read-only native-print feasibility for a separately registered 60 whose
 * original rank-11 Basic Darkness artwork metadata is post-Aichi. This
 * deliberately makes no game-semantic or current metagame claim.
 *
 * @param {object} manifest Original 60 printed rows.
 * @param {object} plan Actual pinned native print resolution.
 * @param {(id:string)=>object|null} lookup Actual native CardManager.
 * @returns {object}
 */
function auditArvenNativePrinting(manifest,plan,lookup){
  assert.equal(typeof lookup,'function');
  assert.ok(Array.isArray(manifest.cards));
  assert.equal(manifest.cards.reduce((n,r)=>n+r.count,0),60);
  assert.equal(plan.sourceDeckCount,29);
  assert.equal(plan.engineRevision,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(plan.printEquivalencePolicy.allowEquivalentBasicEnergies,true);
  assert.equal(plan.printEquivalencePolicy.allowBasicEnergyMirrorPrintings,true);
  assert.equal(plan.printEquivalencePolicy.allowJapanesePromoHooks,true);
  const printed=manifest.cards.find(x=>
    x.category==='Energy'&&x.name==='Darkness Energy'&&
    x.printing?.set==='MEE'&&
    String(x.printing?.number)==='15');
  assert.ok(printed);
  assert.equal(printed.count,8);
  const otherEnergy=manifest.cards.filter(x=>x.category==='Energy'&&x!==printed);
  assert.equal(otherEnergy.length,0);
  assert.equal(plan.candidate.cards?.length,60,
    'Fixed candidate must resolve all 60 physical native IDs');
  assert.deepEqual(plan.candidate.unresolved,[]);
  const aliases=plan.candidate.substitutions.filter(x=>
    x.sourceName===printed.name&&
    x.sourcePrinting?.set===printed.printing.set&&
    String(x.sourcePrinting.number)===String(printed.printing.number)&&
    x.sourcePrinting.language===printed.printing.language);
  assert.equal(aliases.length,1,'Require one explicit original post-event print alias');
  const alias=aliases[0];
  assert.equal(alias.count,8);
  assert.equal(alias.reason,'same-set-basic-energy-number-mismatch');
  const card=lookup(alias.resolvedId);
  assert.ok(card);
  assert.equal(card.fullName,alias.resolvedId);
  assert.equal(card.name,'Darkness Energy');
  assert.equal(card.set,'MEE');
  assert.equal(String(Number(card.setNumber)),'7');
  assert.equal(card.energyType,EnergyType.BASIC);
  assert.equal(plan.opponents.find(x=>x.rank===SOURCE_RANK)?.status,'ready');
  assert.equal(plan.opponents.filter(x=>x.status==='ready').length,29);
  assert.deepEqual(plan.opponents.filter(x=>
    x.status==='missing-published-list').map(x=>x.rank),[23,25,28]);
  return {
    schema:VERSION,candidateGitBlobSha:CANDIDATE_BLOB_SHA,
    candidateManifestPath:CANDIDATE_PATH,
    underlyingOriginalRank:SOURCE_RANK,
    candidateLabel:manifest.label,
    enginePin:plan.engineRevision,
    candidateSourcePrint:printed.printing,
    candidatePrintCopiedFromOriginalMayArtifact:true,
    candidateNativeDeckSize:plan.candidate.cards.length,
    candidateNativeReady:true,
    originalSourceNativeReadyCount:29,
    sourceRanksStillMissing:[23,25,28],
    cardName:printed.name,quantity:printed.count,
    nativeAlias:alias,
    observedNativeCard:{
      fullName:card.fullName,name:card.name,set:card.set,
      number:String(card.setNumber),energyType:'BASIC'
    },
    originalMayPhysicalArtIdentified:false,
    originalMayArtChronology: 'post-event-annotation',
    officialCurrentPaperLegalityCertified:false,
    nativeEffectParityCertified:false,
    fullGamePlayabilityCertified:false,
    selectedPolicyCertified:false,
    competitiveQualifiedGames:0,
    targetWinRateDemonstrated:false
  };
}

function run(){
  const bytes=fs.readFileSync(path.resolve(__dirname,'../..',CANDIDATE_PATH));
  assert.equal(gitBlobSha(bytes),CANDIDATE_BLOB_SHA,
    'Agent38 printed 60 changed; candidate registration no longer frozen');
  const manifest=JSON.parse(bytes.toString('utf8'));
  const plan=planAichi({
    label:'agent38-arven-shake-absol-v1',cards:manifest.cards
  },{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const manager=initializeCards();
  const result=auditArvenNativePrinting(manifest,plan,
    id=>manager.getCardByName(id));
  writeAtomicLocked(OUTPUT,JSON.stringify(result,null,2)+'\n');
  console.log('AGENT22_ARVEN_SHAKE_NATIVE_PRINT',JSON.stringify({
    schema:result.schema,manifest:result.candidateGitBlobSha,
    engine:result.enginePin,
    candidateNativeReady:result.candidateNativeReady,
    candidateSize:result.candidateNativeDeckSize,
    sourceRanksResolved:result.originalSourceNativeReadyCount,
    print:result.candidateSourcePrint,aliasedTo:result.observedNativeCard,
    competitiveQualifiedGames:0
  }));
  return result;
}
if(require.main===module)run();
module.exports={VERSION,CANDIDATE_PATH,CANDIDATE_BLOB_SHA,gitBlobSha,
  auditArvenNativePrinting,run};
