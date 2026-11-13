'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {evidenceBundleSha256}=require('../simulation/evaluation/agent45-independent-competitive-admission.cjs');
const {withPinnedResearchModuleLoads}=require('../simulation/evaluation/agent36-runtime-module-pin.cjs');
const I=require('../simulation/evaluation/2026-11/agent42-role-policy-identity.cjs');
const h=n=>n.toString(16).padStart(64,'0'),g=n=>n.toString(16).padStart(40,'0');
const constraints={
 candidateFormat:'Expanded',gameRuleset:'Expanded',
 opponentSourceEventFormat:'Japanese Extra',expandedLegalityAsOf:null,eventDate:null,
 formatReviewStatus:'unverified-fixture-only',
 decisionBudget:{maxNodes:128,deadlineMs:250},
 hiddenInformationBoundary:{forbidOpponentPrivateHand:true,forbidDeckOrder:true},
 sharedEngineCompatibilityPatches:[]
};
const constraintsSha=evidenceBundleSha256(constraints);
const bindings=[
 {name:'observe',path:'observe.cjs',exportName:'actorObservation'},
 {name:'promptActions',path:'vendor/twinleaf/resolve-prompt-action.js',exportName:'ResolvePromptAction'},
 {name:'cardPoolStartup',path:'vendor/twinleaf/ptcg-server/start.js'},
 {name:'roleComposer',path:'composer.cjs',exportName:'withCandidateOpponentPolicyRoles'},
 {name:'moduleLoadGuard',path:'loadguard.cjs',exportName:'withPinnedResearchModuleLoads'},
 {name:'sourceClosureAudit',path:'audit.cjs',exportName:'auditSourceClosure'},
 {name:'roleIdentityHelper',path:'identity-helper.cjs',exportName:'buildRolePolicyIdentity'}
];
function repo(fn){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'agent42-role-policy-'));
 try{
  const files={
   'candidate.cjs':"module.exports=require('./shared.cjs');\n",
   'opponent.cjs':"module.exports=require('./shared.cjs');\n",
   'shared.cjs':"module.exports=state=>({action:'pass',public:state.public});\n",
   'observe.cjs':"module.exports={actorObservation:state=>({public:state.public})};\n",
   'prompt.cjs':"module.exports={ResolvePromptAction:function ResolvePromptAction(){}};\n",
   'composer.cjs':"require('./vendor/twinleaf/resolve-prompt-action.js'); module.exports={withCandidateOpponentPolicyRoles:()=>{}};\n",
   'loadguard.cjs':"module.exports={withPinnedResearchModuleLoads:()=>{}};\n",
   'audit.cjs':"module.exports={auditSourceClosure:()=>{}};\n",'identity-helper.cjs':"module.exports={buildRolePolicyIdentity:()=>{}};\n",
   'hook.cjs':"module.exports=()=>{};\n",'cards.json':'{"cardCount":60}\n',
   'vendor/twinleaf/resolve-prompt-action.js':"process.env.UNPINNED; module.exports={ResolvePromptAction:function ResolvePromptAction(){}};\n",
   'vendor/twinleaf/ptcg-server/start.js':"module.exports={};\n",
   'package-lock.json':'{"lockfileVersion":3}\n'
  };
  for(const [p,c] of Object.entries(files)){
   fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});
   fs.writeFileSync(path.join(root,p),c);
  }
  fn(root);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
}
function manifest(root,entrypoint='candidate.cjs',extra={}){
 return I.createPolicyEntryManifest({repositoryRoot:root,entrypoint,commonRuntimeBindings:bindings,
  orderedPromptChain:[{name:'native-prompt',path:'prompt.cjs'}],
  sharedEnginePatches:[{name:'underworld-door-psychic-recipient',path:'hook.cjs'}],
  dataAssetPaths:['cards.json'],dependencyLockPaths:['package-lock.json'],
  enginePin:g(10),runnerRevision:g(11),...extra});
}
function cardPoolReceipt(enginePin,startupSha256){return {schema:'agent36-twinleaf-card-pool-initialization-v1',
 enginePin,startupPath:'vendor/twinleaf/ptcg-server/start.js',startupSha256,
 setNames:['base-set','expanded-set'],definedSetCount:2,cardCount:60};}
function identity(role,rank,deck,entry,options={},policyConstraintsSha256=constraintsSha){
 return I.buildRolePolicyIdentity({role,rank,producerId:role==='candidate-policy'?'candidate-author':'opponent-author',
  deckSha256:h(deck),policyVersion:'policy-v1',entryManifest:entry.manifest,
  entryManifestSha256:entry.entryManifestSha256,challengeSuiteSha256:h(900),
  policyOptions:options,policyConstraintsSha256,
  runtimePinUnionSha256:h(800),loadedProcessClosureSha256:h(801),
  cardPoolInitializationSha256:evidenceBundleSha256(cardPoolReceipt(entry.manifest.enginePin,
   entry.manifest.vendorDependencies.find(x=>x.path==='vendor/twinleaf/ptcg-server/start.js').sha256))});
}
function preDeal(candidate,opponent,planConstraints=constraints,fullProcessClosureCovered=false){
 const formatReviewStatus=fullProcessClosureCovered?'independently-reviewed':'unverified-fixture-only';
 const expandedLegalityAsOf=fullProcessClosureCovered?'2026-11-13':null;
 const effectiveConstraints={
  ...planConstraints,candidateFormat:'Expanded',gameRuleset:'Expanded',
  opponentSourceEventFormat:'Japanese Extra',expandedLegalityAsOf,eventDate:null,
  formatReviewStatus
 };
 const core={schema:'aichi-policy-plan-core-v1',comparisonMode:'candidate-vs-field',
  fixtureOnly:true,candidateFormat:'Expanded',gameRuleset:'Expanded',
  opponentSourceEventFormat:'Japanese Extra',formatReviewStatus,
  candidate:{deckSha256:candidate.deckSha256,policySha256:candidate.policySha256,
   entryManifestSha256:candidate.entryManifestSha256,challengeSuiteSha256:candidate.challengeSuiteSha256,
   policyProducerId:candidate.policyProducerId,formatStatus:'unverified',
   formatStatusEvidenceRef:null},
  runtimePinEvidence:{schema:'aichi-runtime-pin-evidence-v2',unionSha256:candidate.runtimePinUnionSha256,
   loadedProcessClosureSha256:candidate.loadedProcessClosureSha256,
   cardPoolInitializationSha256:candidate.cardPoolInitializationSha256,
   fullProcessClosureCovered},
  opponentPolicyBundle:{schema:'aichi-opponent-policy-bundle-v1',ranks:[{rank:opponent.rank,
   sourceStatus:'authenticated',deckSha256:opponent.deckSha256,policySha256:opponent.policySha256,
   entryManifestSha256:opponent.entryManifestSha256,challengeSuiteSha256:opponent.challengeSuiteSha256,
   policyProducerId:opponent.policyProducerId,formatStatus:'unverified',
   formatStatusEvidenceRef:null}]},constraints:effectiveConstraints};
 const registration={
  schema:'aichi-policy-registration-v1',trialId:'trial-1',
  policyPlanSha256:evidenceBundleSha256(core),
  candidateFormat:'Expanded',gameRuleset:'Expanded',
  opponentSourceEventFormat:'Japanese Extra',expandedLegalityAsOf,
  eventDate:null,formatReviewStatus
 };
 const attestation={schema:'aichi-policy-attestation-bundle-v1',policyPlanSha256:evidenceBundleSha256(core)};
 return {ready:true,fixtureOnly:true,trialId:'trial-1',policyPlanCore:core,policyPlanSha256:evidenceBundleSha256(core),
  policyRegistration:registration,policyRegistrationSha256:evidenceBundleSha256(registration),
  policyAttestationBundle:attestation,policyAttestationBundleSha256:evidenceBundleSha256(attestation)};
}
function actorOnlyBoundary(candidateSeat,opponentSeat,candidateOverrides={},opponentOverrides={}){
 const role=(name,seat,overrides)=>({role:name,policyOwnerSeat:seat,
  version:'agent34-actor-only-root-policy-v1',
  origin:'detached-actor-observation',
  observationSchema:'agent2-public-native-dispatch-diff-v1',
  nativeOwnerTrainerFallbackEnabled:false,ownerFallbackDiagnosticViewEnabled:false,
  nativePolicyMayUseHiddenInformation:false,unsupportedPromptFallbacks:0,
  nonLiveSpeculativeFallbacks:0,nonOwnerNativeDelegations:0,
  nonTurnPhaseFallbacks:0,nonOwnerSeatBypassCalls:0,
  nativeOwnerTrainerFallbackAttemptedUnsupportedPasses:0,...overrides});
 return {schema:'aichi-actor-only-execution-boundary-v1',valid:true,failures:[],
  candidate:role('candidate',candidateSeat,candidateOverrides),
  opponent:role('opponent',opponentSeat,opponentOverrides)};
}
function trial(candidate,opponent,candidateSeat,firstPlayerSeat,runtimePatchReceipts=[]){
 return {trialId:'trial-1',fixtureOnly:true,opponentRank:opponent.rank,
  candidateFormat:'Expanded',gameRuleset:'Expanded',
  opponentSourceEventFormat:'Japanese Extra',expandedLegalityAsOf:null,eventDate:null,
  formatReviewStatus:'unverified-fixture-only',
  candidateSeat,originalSourceSeat:1-candidateSeat,
  actualFirstPlayerSeat:firstPlayerSeat,candidatePrinted60Sha256:candidate.deckSha256,
  originalPrinted60Sha256:opponent.deckSha256,vendorCommitSha:candidate.entryManifest.enginePin,
  researchRevisionSha:candidate.entryManifest.runnerRevision,decisionTraceSha256:h(906),
  actorOnlyExecutionBoundary:actorOnlyBoundary(candidateSeat,1-candidateSeat),
  cardPoolInitializationReceipt:cardPoolReceipt(candidate.entryManifest.enginePin,
   candidate.entryManifest.vendorDependencies.find(x=>x.path==='vendor/twinleaf/ptcg-server/start.js').sha256),runtimePatchReceipts};
}

test('entry manifest pins research closure, vendor prompt binding, dependency lock and runtime',()=>repo(root=>{
 const m=manifest(root);
 assert.equal(m.manifest.complete,true);
 assert.ok(m.manifest.files.length>=8);
 assert.ok(m.manifest.vendorDependencies.some(dep=>dep.path==='vendor/twinleaf/resolve-prompt-action.js'));
 assert.equal(m.manifest.vendorDependenciesSha256,evidenceBundleSha256(m.manifest.vendorDependencies));
 assert.equal(m.manifest.vendorImportsSha256,evidenceBundleSha256(m.manifest.vendorImports));
 assert.ok(m.manifest.vendorImports.some(edge=>edge.path==='vendor/twinleaf/resolve-prompt-action.js'));
 assert.ok(m.manifest.vendorDependencies.some(dep=>dep.path==='vendor/twinleaf/ptcg-server/start.js'));
 assert.equal(m.manifest.dependencyState.lockfiles[0].path,'package-lock.json');
 assert.equal(m.manifest.nodeVersion,process.version);
 assert.equal(m.manifest.orderedPromptChain[0].name,'native-prompt');
 assert.equal(m.manifest.sharedEnginePatches[0].name,'underworld-door-psychic-recipient');
 assert.deepEqual(Object.keys(m.expectedByPath).sort(),m.manifest.files.map(x=>x.path).sort());
}));

test('candidate and opponent identities are invariant under seat and first-player swaps',()=>repo(root=>{
 const c=identity('candidate-policy',null,1,manifest(root,'candidate.cjs'),{mode:'prize-map'});
 const o=identity('opponent-policy',7,2,manifest(root,'opponent.cjs'),{mode:'source-native'});
 const pd=preDeal(c,o);
 const a=I.createPolicyApplicationReceipt({preDeal:pd,candidateIdentity:c,opponentIdentity:o,trial:trial(c,o,0,1)});
 const b=I.createPolicyApplicationReceipt({preDeal:pd,candidateIdentity:c,opponentIdentity:o,trial:trial(c,o,1,0)});
 assert.equal(a.receipt.candidatePolicySha256,b.receipt.candidatePolicySha256);
 assert.equal(a.receipt.opponentPolicySha256,b.receipt.opponentPolicySha256);
 assert.deepEqual(a.policySha256BySeat,[c.policySha256,o.policySha256]);
 assert.deepEqual(b.policySha256BySeat,[o.policySha256,c.policySha256]);
 assert.notEqual(a.receipt.receiptSha256,b.receipt.receiptSha256);
 assert.equal(a.receipt.receiptSha256,evidenceBundleSha256(Object.fromEntries(Object.entries(a.receipt).filter(([k])=>k!=='receiptSha256'))));
}));

test('policy hash binds deck, closure, constraints, canonical config and producer identity',()=>repo(root=>{
 const m=manifest(root),base={role:'candidate-policy',rank:null,producerId:'author-a',deckSha256:h(1),
  policyVersion:'v1',entryManifest:m.manifest,entryManifestSha256:m.entryManifestSha256,
  challengeSuiteSha256:h(3),policyOptions:{mode:'public'},policyConstraintsSha256:constraintsSha,
  runtimePinUnionSha256:h(800),loadedProcessClosureSha256:h(801),cardPoolInitializationSha256:h(802)};
 const a=I.buildRolePolicyIdentity(base);
 assert.notEqual(I.buildRolePolicyIdentity({...base,deckSha256:h(2)}).policySha256,a.policySha256);
 assert.notEqual(I.buildRolePolicyIdentity({...base,policyConstraintsSha256:h(4)}).policySha256,a.policySha256);
 assert.notEqual(I.buildRolePolicyIdentity({...base,policyOptions:{mode:'owner'}}).policySha256,a.policySha256);
 assert.notEqual(I.buildRolePolicyIdentity({...base,producerId:'author-b'}).policySha256,a.policySha256);
 assert.throws(()=>I.buildRolePolicyIdentity({...base,policyOptions:{nested:{firstPlayerSeat:0}}}),/physical-game context/);
 assert.throws(()=>I.buildRolePolicyIdentity({...base,policyOptions:{nativeOwnerTrainerFallback:true}}),/diagnostic native-state fallback/);
 assert.throws(()=>I.buildRolePolicyIdentity({...base,policyOptions:{nested:{ownerFallbackDiagnosticView:true}}}),/diagnostic native-state fallback/);
}));

test('environment readers are allowlisted and actual values are hashed; secret keys fail closed',()=>repo(root=>{
 fs.writeFileSync(path.join(root,'candidate.cjs'),'module.exports=process.env.POLICY_MODE;\n');
 const old=process.env.POLICY_MODE,oldToken=process.env.API_TOKEN;
 try{
  process.env.POLICY_MODE='public';
  const args={repositoryRoot:root,entrypoint:'candidate.cjs',commonRuntimeBindings:bindings,
   orderedPromptChain:[{name:'native-prompt',path:'prompt.cjs'}],sharedEnginePatches:[{name:'underworld',path:'hook.cjs'}],
   dataAssetPaths:['cards.json'],dependencyLockPaths:['package-lock.json'],enginePin:g(10),runnerRevision:g(11),
   environmentAllowlist:['POLICY_MODE']};
  const a=I.createPolicyEntryManifest(args);process.env.POLICY_MODE='conservative';
  const b=I.createPolicyEntryManifest(args);assert.notEqual(a.entryManifestSha256,b.entryManifestSha256);
  fs.writeFileSync(path.join(root,'candidate.cjs'),'module.exports=process.env.API_TOKEN;\n');
  process.env.API_TOKEN='secret';
  assert.throws(()=>I.createPolicyEntryManifest({...args,environmentAllowlist:['API_TOKEN']}),/secret-bearing environment/);
 }finally{
  if(old===undefined)delete process.env.POLICY_MODE;else process.env.POLICY_MODE=old;
  if(oldToken===undefined)delete process.env.API_TOKEN;else process.env.API_TOKEN=oldToken;
 }
}));

test('GITHUB/RUNNER environment reads are allowed only in the exact trusted runner',()=>repo(root=>{
 const runnerPath='simulation/evaluation/2026-11/agent36-v3-runner.cjs';
 fs.mkdirSync(path.dirname(path.join(root,runnerPath)),{recursive:true});
 fs.writeFileSync(path.join(root,runnerPath),"process.env.GITHUB_REPOSITORY; module.exports={run:()=>{}};\n");
 const common=bindings.concat([{name:'runner',path:runnerPath,exportName:'run'}]);
 const ok=I.createPolicyEntryManifest({repositoryRoot:root,entrypoint:'candidate.cjs',
  commonRuntimeBindings:common,orderedPromptChain:[{name:'native-prompt',path:'prompt.cjs'}],
  sharedEnginePatches:[{name:'underworld-door',path:'hook.cjs'}],dataAssetPaths:['cards.json'],
  dependencyLockPaths:['package-lock.json'],enginePin:g(10),runnerRevision:g(11)});
 assert.ok(ok.manifest.trustedOperationalEnvironmentReaders.some(x=>x.key==='GITHUB_REPOSITORY'));
 fs.writeFileSync(path.join(root,'candidate.cjs'),"module.exports=process.env.GITHUB_SHA;\n");
 assert.throws(()=>manifest(root),/untrusted-operational-environment/);
}));

test('dynamic require, ESM, external packages, file reads and unseeded randomness are rejected',()=>repo(root=>{
 fs.writeFileSync(path.join(root,'candidate.cjs'),"module.exports=()=>require('./'+process.env.NEXT);\n");
 assert.throws(()=>manifest(root),/Unresolved role policy closure/);
 fs.writeFileSync(path.join(root,'candidate.cjs'),"module.exports=()=>require('third-party-package');\n");
 assert.throws(()=>manifest(root),/Unresolved role policy closure/);
 fs.writeFileSync(path.join(root,'candidate.cjs'),"const n=1; import action from 'third-party-package'; module.exports=n;\n");
 assert.throws(()=>manifest(root),/Role policy closure contains ESM/);
 fs.writeFileSync(path.join(root,'candidate.cjs'),"const Module=require('node:module'); const load=Module._load; module.exports=load;\n");
 assert.throws(()=>manifest(root),/module-loader capture/);
 fs.writeFileSync(path.join(root,'candidate.cjs'),"const fs=require('node:fs'); module.exports=fs.readFileSync('./other.cjs','utf8');\n");
 assert.throws(()=>manifest(root),/unreviewed file loading/);
 fs.writeFileSync(path.join(root,'candidate.cjs'),'module.exports=Math.random();\n');
 assert.throws(()=>manifest(root),/unseeded-random/);
}));

test('data changes alter entry identity and symlink escapes are rejected',()=>repo(root=>{
 const args={repositoryRoot:root,entrypoint:'candidate.cjs',commonRuntimeBindings:bindings,
  orderedPromptChain:[{name:'native-prompt',path:'prompt.cjs'}],sharedEnginePatches:[{name:'underworld',path:'hook.cjs'}],
  dataAssetPaths:['cards.json'],dependencyLockPaths:['package-lock.json'],enginePin:g(1),runnerRevision:g(2)};
 const a=I.createPolicyEntryManifest(args);
 fs.writeFileSync(path.join(root,'cards.json'),'{"cardCount":61}\n');
 assert.notEqual(I.createPolicyEntryManifest(args).entryManifestSha256,a.entryManifestSha256);
 const outside=fs.mkdtempSync(path.join(os.tmpdir(),'agent42-outside-'));
 try{
  fs.writeFileSync(path.join(outside,'secret.json'),'{}');
  fs.symlinkSync(path.join(outside,'secret.json'),path.join(root,'escape.json'));
  assert.throws(()=>I.createPolicyEntryManifest({...args,dataAssetPaths:['escape.json']}),/resolves outside the repository/);
 }finally{fs.rmSync(outside,{recursive:true,force:true});}
}));

test('runtime pin union comes only from role manifest files and must cover loaded shared modules',()=>repo(root=>{
 fs.writeFileSync(path.join(root,'runner.cjs'),'module.exports=()=>{};\n');
 const a=manifest(root,'candidate.cjs'),b=manifest(root,'opponent.cjs');
 const union=I.combineRolePolicyEntryManifests(a,b);
 assert.throws(()=>I.assertLoadedResearchModulesCovered(root,union.expectedByPath,[path.join(root,'runner.cjs')]),/absent from the combined role pin/);
 assert.throws(()=>I.assertLoadedResearchModulesCovered(root,union.expectedByPath,[]),/every expected role\/shared runtime module must be preloaded/);
 const extended=bindings.concat([{name:'runner',path:'runner.cjs'}]);
 const aa=manifest(root,'candidate.cjs',{commonRuntimeBindings:extended});
 const bb=manifest(root,'opponent.cjs',{commonRuntimeBindings:extended});
 const combined=I.combineRolePolicyEntryManifests(aa,bb);
 const loaded=I.assertLoadedResearchModulesCovered(root,combined.expectedByPath,
  Object.keys(combined.expectedByPath).map(name=>path.join(root,name)));
 assert.ok(loaded.files.some(x=>x.path==='runner.cjs'));
}));

test('preloader rejects vendor paths and source hash drift',()=>repo(root=>{
 const m=manifest(root);
 assert.throws(()=>I.preloadResearchModules(root,{...m.expectedByPath,
  'vendor/twinleaf/resolve-prompt-action.js':h(999)}),/research-owned modules only/);
 assert.throws(()=>I.preloadResearchModules(root,{...m.expectedByPath,'candidate.cjs':h(998)}),
  /differs from the role runtime pin/);
}));

test('actual Agent36 module pin accepts the combined role closure and restores itself',()=>repo(root=>{
 const a=manifest(root,'candidate.cjs'),b=manifest(root,'opponent.cjs');
 const union=I.combineRolePolicyEntryManifests(a,b);
 const preload=I.preloadResearchModules(root,union.expectedByPath);
 assert.match(preload.loadedProcessClosureSha256,/^[0-9a-f]{64}$/);
 const result=withPinnedResearchModuleLoads(root,union.expectedByPath,()=>{
  const policy=require(path.join(root,'candidate.cjs'));
  return policy({public:42});
 });
 assert.deepEqual(result.result,{action:'pass',public:42});
 assert.equal(result.audit.guardRestored,true);
 assert.ok(result.audit.files.includes('candidate.cjs'));
 assert.ok(result.audit.files.includes('shared.cjs'));
}));

test('application receipt binds exactly-once shared runtime patch install and restore',()=>repo(root=>{
 const cm=manifest(root,'candidate.cjs'),om=manifest(root,'opponent.cjs');
 const patchFile=cm.manifest.sharedEnginePatches[0];
 const patch={patchId:'underworld-door-psychic-recipient-v1',modulePath:patchFile.path,
  moduleSha256:patchFile.sha256,target:'ShadowRiderCalyrexVMAX.prototype.reduceEffect'};
 const patchConstraints={...constraints,sharedEngineCompatibilityPatches:[patch]};
 const patchConstraintsSha=evidenceBundleSha256(patchConstraints);
 const candidate=identity('candidate-policy',null,1,cm,{},patchConstraintsSha);
 const opponent=identity('opponent-policy',7,2,om,{},patchConstraintsSha);
 const receipt={schema:'aichi-runtime-patch-installation-receipt-v1',...patch,
  originalReducerFingerprint:h(1001),installedReducerFingerprint:h(1002),
  installCount:1,installBoundary:'outer-v3-runner-before-role-wrappers',
  restoreCount:1,restoreBoundary:'outer-finally',restoredOriginal:true,
  nestedInstallCount:0,wrapperInstallCount:0};
 const pd=preDeal(candidate,opponent,patchConstraints);
 const applied=I.createPolicyApplicationReceipt({preDeal:pd,candidateIdentity:candidate,
  opponentIdentity:opponent,trial:trial(candidate,opponent,0,1,[receipt])});
 assert.deepEqual(applied.receipt.runtimePatchReceipts,[receipt]);
 assert.equal(applied.receipt.runtimePatchReceiptsSha256,evidenceBundleSha256([receipt]));
 assert.throws(()=>I.createPolicyApplicationReceipt({preDeal:pd,candidateIdentity:candidate,
  opponentIdentity:opponent,trial:trial(candidate,opponent,0,1,[{...receipt,installCount:2}])}),/exactly once/);
 assert.throws(()=>I.createPolicyApplicationReceipt({preDeal:pd,candidateIdentity:candidate,
  opponentIdentity:opponent,trial:trial(candidate,opponent,0,1,[])}),/exactly cover/);
}));

test('partial runtime closure is fixture-only; production receipts require full closure',()=>repo(root=>{
 const cm=manifest(root,'candidate.cjs'),om=manifest(root,'opponent.cjs');
 const candidate=identity('candidate-policy',null,1,cm),opponent=identity('opponent-policy',7,2,om);
 const fixturePlan=preDeal(candidate,opponent,constraints,false);
 const fixtureTrial=trial(candidate,opponent,0,1);
 const fixtureApplied=I.createPolicyApplicationReceipt({preDeal:fixturePlan,
  candidateIdentity:candidate,opponentIdentity:opponent,trial:fixtureTrial});
 assert.equal(fixtureTrial.fixtureOnly,true);
 assert.equal(fixturePlan.policyPlanCore.runtimePinEvidence.fullProcessClosureCovered,false);
 assert.match(fixtureApplied.receipt.receiptSha256,/^[0-9a-f]{64}$/);
 assert.throws(()=>I.createPolicyApplicationReceipt({preDeal:fixturePlan,
  candidateIdentity:candidate,opponentIdentity:opponent,
  trial:{...fixtureTrial,fixtureOnly:false}}),/production application receipt requires complete process-closure coverage/);
 const productionConstraints={
  ...constraints,expandedLegalityAsOf:'2026-11-13',
  formatReviewStatus:'independently-reviewed'
 };
 const productionConstraintsSha=evidenceBundleSha256(productionConstraints);
 const productionCandidate=identity('candidate-policy',null,1,cm,{},productionConstraintsSha);
 const productionOpponent=identity('opponent-policy',7,2,om,{},productionConstraintsSha);
 const productionPlan=preDeal(productionCandidate,productionOpponent,productionConstraints,true);
 assert.notEqual(fixturePlan.policyPlanSha256,productionPlan.policyPlanSha256,
  'fixture/production closure scope must be frozen into distinct policy-plan digests');
 const productionTrial={...trial(productionCandidate,productionOpponent,0,1),fixtureOnly:false,
  expandedLegalityAsOf:'2026-11-13',formatReviewStatus:'independently-reviewed'};
 const productionApplied=I.createPolicyApplicationReceipt({preDeal:productionPlan,
  candidateIdentity:productionCandidate,opponentIdentity:productionOpponent,trial:productionTrial});
 assert.match(productionApplied.receipt.receiptSha256,/^[0-9a-f]{64}$/);
 assert.throws(()=>I.createPolicyApplicationReceipt({preDeal:productionPlan,
  candidateIdentity:productionCandidate,opponentIdentity:productionOpponent,
  trial:{...productionTrial,fixtureOnly:true}}),/fixture-only trial must explicitly use fixture-scoped process closure/);
}));


test('V3 role identities reject diagnostic native-state fallback options',()=>repo(root=>{
 const m=manifest(root),base={role:'candidate-policy',rank:null,producerId:'author-a',
  deckSha256:h(1),policyVersion:'v1',entryManifest:m.manifest,
  entryManifestSha256:m.entryManifestSha256,challengeSuiteSha256:h(3),
  policyConstraintsSha256:constraintsSha,policyOptions:{mode:'public'},
  runtimePinUnionSha256:h(800),loadedProcessClosureSha256:h(801),
  cardPoolInitializationSha256:h(802)};
 assert.throws(()=>I.buildRolePolicyIdentity({...base,
  policyOptions:{nativeOwnerTrainerFallback:true}}),/diagnostic native-state fallback/);
 assert.throws(()=>I.buildRolePolicyIdentity({...base,
  policyOptions:{nested:{ownerFallbackDiagnosticView:true}}}),/diagnostic native-state fallback/);
 assert.throws(()=>I.buildRolePolicyIdentity({...base,
  policyOptions:{nativeOwnerTrainerFallback:false}}),/diagnostic native-state fallback/);
}));

test('application receipt binds the exact composer actor-only boundary and all fallback counters',()=>repo(root=>{
 const cm=manifest(root,'candidate.cjs'),om=manifest(root,'opponent.cjs');
 const candidate=identity('candidate-policy',null,1,cm),opponent=identity('opponent-policy',7,2,om);
 const pd=preDeal(candidate,opponent),t=trial(candidate,opponent,0,1);
 const applied=I.createPolicyApplicationReceipt({preDeal:pd,candidateIdentity:candidate,
  opponentIdentity:opponent,trial:t});
 assert.deepEqual(applied.receipt.actorOnlyExecutionBoundary,t.actorOnlyExecutionBoundary);
 assert.equal(applied.receipt.actorOnlyExecutionBoundarySha256,
  evidenceBundleSha256(t.actorOnlyExecutionBoundary));
 assert.equal(applied.receipt.receiptSha256,evidenceBundleSha256(
  Object.fromEntries(Object.entries(applied.receipt).filter(([key])=>key!=='receiptSha256'))));

 const speculative=actorOnlyBoundary(0,1,{nonLiveSpeculativeFallbacks:1});
 speculative.valid=false;
 speculative.failures=['candidate-nonLiveSpeculativeFallbacks-nonzero'];
 const speculativeApplied=I.createPolicyApplicationReceipt({preDeal:pd,
  candidateIdentity:candidate,opponentIdentity:opponent,
  trial:{...t,actorOnlyExecutionBoundary:speculative}});
 assert.deepEqual(speculativeApplied.receipt.actorOnlyExecutionBoundary,speculative);
 assert.equal(speculativeApplied.receipt.actorOnlyExecutionBoundarySha256,
  evidenceBundleSha256(speculative));

 const hidden=actorOnlyBoundary(0,1,{nativeOwnerTrainerFallbackEnabled:true});
 hidden.valid=false;
 hidden.failures=['candidate-native-owner-trainer-fallback-enabled'];
 const hiddenApplied=I.createPolicyApplicationReceipt({preDeal:pd,
  candidateIdentity:candidate,opponentIdentity:opponent,
  trial:{...t,actorOnlyExecutionBoundary:hidden}});
 assert.equal(hiddenApplied.receipt.actorOnlyExecutionBoundarySha256,
  evidenceBundleSha256(hidden));

 const wrongSeat=actorOnlyBoundary(1,0);
 const wrongSeatApplied=I.createPolicyApplicationReceipt({preDeal:pd,
  candidateIdentity:candidate,opponentIdentity:opponent,
  trial:{...t,actorOnlyExecutionBoundary:wrongSeat}});
 assert.equal(wrongSeatApplied.receipt.actorOnlyExecutionBoundarySha256,
  evidenceBundleSha256(wrongSeat));

 const missingApplied=I.createPolicyApplicationReceipt({preDeal:pd,
  candidateIdentity:candidate,opponentIdentity:opponent,
  trial:{...t,actorOnlyExecutionBoundary:undefined}});
 assert.equal(missingApplied.receipt.actorOnlyExecutionBoundary,null);
 assert.equal(missingApplied.receipt.actorOnlyExecutionBoundarySha256,null);
}));

test('candidate and opponent may have different role-local engine patch dependencies',()=>repo(root=>{
 const cm=manifest(root,'candidate.cjs'),om=manifest(root,'opponent.cjs');
 const c=identity('candidate-policy',null,1,cm),o=identity('opponent-policy',7,2,om);
 const altered={...om.manifest,sharedEnginePatchSha256:h(777)};
 const roleSpecificOpponent=I.buildRolePolicyIdentity({role:'opponent-policy',rank:7,producerId:'opponent-author',
  deckSha256:h(2),policyVersion:'policy-v1',entryManifest:altered,
  entryManifestSha256:evidenceBundleSha256(altered),challengeSuiteSha256:h(900),
  policyOptions:{},policyConstraintsSha256:constraintsSha,
  runtimePinUnionSha256:h(800),loadedProcessClosureSha256:h(801),
  cardPoolInitializationSha256:c.cardPoolInitializationSha256});
 const pd=preDeal(c,roleSpecificOpponent);
 const applied=I.createPolicyApplicationReceipt({preDeal:pd,candidateIdentity:c,
  opponentIdentity:roleSpecificOpponent,trial:trial(c,roleSpecificOpponent,0,1)});
 assert.equal(applied.receipt.opponentPolicySha256,roleSpecificOpponent.policySha256);
}));



test('application receipt binds the frozen format, date scope and review status',()=>repo(root=>{
 const cm=manifest(root,'candidate.cjs'),om=manifest(root,'opponent.cjs');
 const candidate=identity('candidate-policy',null,1,cm);
 const opponent=identity('opponent-policy',7,2,om);
 const pd=preDeal(candidate,opponent);
 const t=trial(candidate,opponent,0,1);
 const applied=I.createPolicyApplicationReceipt({
  preDeal:pd,candidateIdentity:candidate,opponentIdentity:opponent,trial:t
 });
 for(const key of ['candidateFormat','gameRuleset','opponentSourceEventFormat',
   'expandedLegalityAsOf','eventDate','formatReviewStatus'])
  assert.equal(applied.receipt[key],t[key]);
 assert.equal(applied.receipt.formatReviewStatus,'unverified-fixture-only');
 assert.equal(applied.receipt.receiptSha256,evidenceBundleSha256(
  Object.fromEntries(Object.entries(applied.receipt).filter(([key])=>key!=='receiptSha256'))));
 assert.throws(()=>I.createPolicyApplicationReceipt({
  preDeal:pd,candidateIdentity:candidate,opponentIdentity:opponent,
  trial:{...t,gameRuleset:'Japanese Extra'}
 }),/trial gameRuleset mismatch/);
 assert.throws(()=>I.createPolicyApplicationReceipt({
  preDeal:pd,candidateIdentity:candidate,opponentIdentity:opponent,
  trial:{...t,formatReviewStatus:'independently-reviewed'}
 }),/trial formatReviewStatus mismatch/);
}));
