'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');

const registration = require('../../results/aichi-2026/registrations/agent17-original-rank5-mew-genesect-20261101.json');
const profile = require('./agent41-frozen-bilateral-development-v2.json');
const {summarizeEight} =
  require('./agent16-original-rank1-shadow-rider-development.cjs');

const ROOT = path.resolve(__dirname, '../..');
const VERSION = 'agent17-original-rank5-mew-genesect-cross-archetype-native-v1';
const REGISTRATION = 'results/aichi-2026/registrations/agent17-original-rank5-mew-genesect-20261101.json';
const REGISTRATION_BLOB = '6b7cb6f919cc0d2ac76f8b3bf3ec1032f467c60c';

/** @param {Buffer} bytes @returns {string} */
function gitBlob(bytes) {
  return createHash('sha1').update('blob '+bytes.length+'\0')
    .update(bytes).digest('hex');
}

/** @returns {Array<{rank:number,repeat:number,candidateSlot:string,seed:number,candidateId:string,id:string}>} */
function scheduledArms() {
  assert.equal(registration.schema,
    'agent17-original-rank5-mew-genesect-bilateral-develop-v1');
  assert.equal(registration.seedGroups, 4);
  assert.equal(registration.attemptedNativeArms, 8);
  assert.deepEqual(registration.candidateIds,
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.equal(registration.pinnedVendorRevision,profile.pinnedVendorRevision);
  const groups=new Set();
  const trials=[];
  for(const row of registration.seeds) {
    assert.equal(row.rank,5);
    assert.ok([0,1].includes(row.repeat));
    assert.ok(['A','B'].includes(row.candidateSlot));
    assert.ok(Number.isSafeInteger(row.seed)&&
      row.seed>=0&&row.seed<=0xffffffff);
    const group=[row.rank,row.repeat,row.candidateSlot].join(':');
    assert.ok(!groups.has(group),'Duplicate physical source group');
    groups.add(group);
    for(const candidateId of registration.candidateIds)
      trials.push({...row,candidateId,id:group+':'+candidateId});
  }
  assert.deepEqual([...groups].sort(),
    ['5:0:A','5:0:B','5:1:A','5:1:B']);
  assert.equal(trials.length,8);
  return trials;
}

/**
 * Source and policy checks before any native game. This preflight says nothing
 * about the pinned Store implementing the original deck's card effects.
 * @param {string} [root]
 * @returns {object}
 */
function preflight(root=ROOT) {
  assert.equal(gitBlob(fs.readFileSync(path.join(root,REGISTRATION))),
    REGISTRATION_BLOB,'Preregistered rank5 source seeds changed');
  assert.equal(registration.policyProfile,
    'simulation/evaluation/agent41-frozen-bilateral-development-v2.json');
  assert.equal(gitBlob(fs.readFileSync(path.join(root,registration.policyProfile))),
    registration.policyProfileGitBlobSha,
    'Registered common policy profile changed');
  const sourceBytes=fs.readFileSync(path.join(root,registration.originalSourceRoster));
  assert.equal(gitBlob(sourceBytes),
    registration.originalSourceRosterGitBlobSha,
    'Original source 60 inventory changed');
  const source=JSON.parse(sourceBytes);
  assert.equal(source.published_deck_count,29);
  const original=source.decks.find(x=>x.rank===5);
  assert.equal(original?.archetype,'Mew Genesect');
  assert.equal(original.cards.reduce((sum,c)=>sum+c.count,0),60);
  for(const [name,set,number,count] of [
    ['Mew V','FST','113',4],
    ['Mew VMAX','FST','114',3],
    ['Genesect V','FST','185',4],
    ['Double Colorless Energy','SUM','136',4]
  ]) {
    assert.equal(original.cards.find(c=>c.name===name&&
      c.printing.set===set&&String(c.printing.number)===number)?.count,count,
      'Key source printing changed: '+name);
  }
  assert.equal(profile.policyOptions.actorOnlyComposition,true);
  assert.equal(profile.policyOptions.bilateralPublicContextSpecialEnergy,true);
  assert.equal(profile.policyOptions.physicalZoneGate,true);
  return {
    version:VERSION,originalRank:5,originalArchetype:original.archetype,
    registrationBlobSha:REGISTRATION_BLOB,
    originalRosterBlobSha:registration.originalSourceRosterGitBlobSha,
    policyProfileBlobSha:registration.policyProfileGitBlobSha,
    seedGroups:4,attemptedNativeArms:scheduledArms().length,
    paperQualified:false,competitiveQualified:false
  };
}

/** @returns {object} Pinned native, real Store developmental experiments. */
function run() {
  const inspected=preflight();
  const {assertNoUnreviewedAmbientAgentEnvironment,assertPinnedNativeStore}=
    require('./agent41-frozen-bilateral-development-v1.cjs');
  assertNoUnreviewedAmbientAgentEnvironment(process.env,profile);
  assertPinnedNativeStore(ROOT,profile);
  const {planAichi}=require('./aichi-pilot.cjs');
  const plan=planAichi(5,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(x=>x.rank===5);
  assert.equal(source?.status,'ready',
    'The original rank5 source cannot be loaded as a native 60');
  assert.equal(source.cards.length,60);
  assert.deepEqual(source.substitutions,[],
    'Rank5 must remain the one substitution-free original source');
  const prior={};
  for(const [key,value] of Object.entries(profile.injectedResearchEnvironment)) {
    prior[key]=process.env[key];
    process.env[key]=value;
  }
  try {
    const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
    const observed=runDevelopment({
      ...profile.policyOptions,
      allowAdditionalOriginalSourceRanks:true,
      registeredTrials:scheduledArms(),
      registeredFrameName:VERSION
    });
    const rows=observed.rows??[];
    const {auditSourceClosure}=require('./agent36-source-closure-audit.cjs');
    const closure=auditSourceClosure(ROOT,[
      'simulation/evaluation/agent41-bilateral-v2-development.cjs'
    ]);
    return {
      version:VERSION,inspected,registration,
      sourceNativePrintingProxyCount:source.substitutions.length,
      sourceClosureSha256:closure.digest,
      sourceClosureLimitations:closure.limitations,
      researchHeadCommit:process.env.GITHUB_SHA??null,
      enginePin:profile.pinnedVendorRevision,
      attempted:observed.attempted,
      expectedAttempts:registration.attemptedNativeArms,
      complete:observed.attempted===8&&rows.length===8,
      ...summarizeEight(rows),rows,paired:observed.paired??null,
      competitiveQualifiedGames:0,winRateCertified:false,
      caveat:'Development-only common-policy source archetype extension. No independent printed-effect or interactive prompt legality certification, source-policy competence, paper clock, or matchup win-rate proof. The same integer seed on different candidate decks does not certify the same physical deal.'
    };
  } finally {
    for(const [key,value] of Object.entries(prior)) {
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}

if(require.main===module) {
  const inspect=process.argv.includes('--inspect-only');
  const output=inspect?preflight():run();
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
  if(!inspect&&!output.complete)process.exitCode=1;
}

module.exports={VERSION,scheduledArms,preflight,run};
