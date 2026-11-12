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
const constraints={decisionBudget:{maxNodes:128,deadlineMs:250},hiddenInformationBoundary:{forbidOpponentPrivateHand:true,forbidDeckOrder:true}};
const constraintsSha=evidenceBundleSha256(constraints);
const bindings=[
 {name:'observe',path:'observe.cjs',exportName:'actorObservation'},
 {name:'promptActions',path:'vendor/twinleaf/resolve-prompt-action.js',exportName:'ResolvePromptAction'},
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
function identity(role,rank,deck,entry,options={}){
 return I.buildRolePolicyIdentity({role,rank,producerId:role==='candidate-policy'?'candidate-author':'opponent-author',
  deckSha256:h(deck),policyVersion:'policy-v1',entryManifest:entry.manifest,
  entryManifestSha256:entry.entryManifestSha256,challengeSuiteSha256:h(900),
  policyOptions:options,policyConstraintsSha256:constraintsSha,
  runtimePinUnionSha256:h(800),loadedProcessClosureSha256:h(801)});
}
function preDeal(candidate,opponent){
 const core={schema:'aichi-policy-plan-core-v1',comparisonMode:'candidate-vs-field',
  candidate:{deckSha256:candidate.deckSha256,policySha256:candidate.policySha256,
   entryManifestSha256:candidate.entryManifestSha256,challengeSuiteSha256:candidate.challengeSuiteSha256,
   policyProducerId:candidate.policyProducerId},
  runtimePinEvidence:{schema:'aichi-runtime-pin-evidence-v1',unionSha256:candidate.runtimePinUnionSha256,
   loadedProcessClosureSha256:candidate.loadedProcessClosureSha256},
  opponentPolicyBundle:{schema:'aichi-opponent-policy-bundle-v1',ranks:[{rank:opponent.rank,
   sourceStatus:'authenticated',deckSha256:opponent.deckSha256,policySha256:opponent.policySha256,
   entryManifestSha256:opponent.entryManifestSha256,challengeSuiteSha256:opponent.challengeSuiteSha256,
   policyProducerId:opponent.policyProducerId}]},constraints};
 const registration={schema:'aichi-policy-registration-v1',trialId:'trial-1',policyPlanSha256:evidenceBundleSha256(core)};
 const attestation={schema:'aichi-policy-attestation-bundle-v1',policyPlanSha256:evidenceBundleSha256(core)};
 return {ready:true,trialId:'trial-1',policyPlanCore:core,policyPlanSha256:evidenceBundleSha256(core),
  policyRegistration:registration,policyRegistrationSha256:evidenceBundleSha256(registration),
  policyAttestationBundle:attestation,policyAttestationBundleSha256:evidenceBundleSha256(attestation)};
}
function trial(candidate,opponent,candidateSeat,firstPlayerSeat){
 return {trialId:'trial-1',opponentRank:opponent.rank,candidateSeat,originalSourceSeat:1-candidateSeat,
  actualFirstPlayerSeat:firstPlayerSeat,candidatePrinted60Sha256:candidate.deckSha256,
  originalPrinted60Sha256:opponent.deckSha256,vendorCommitSha:candidate.entryManifest.enginePin,
  researchRevisionSha:candidate.entryManifest.runnerRevision,decisionTraceSha256:h(906)};
}

test('entry manifest pins research closure, vendor prompt binding, dependency lock and runtime',()=>repo(root=>{
 const m=manifest(root);
 assert.equal(m.manifest.complete,true);
 assert.ok(m.manifest.files.length>=8);
 assert.equal(m.manifest.vendorDependencies[0].path,'vendor/twinleaf/resolve-prompt-action.js');
 assert.equal(m.manifest.vendorDependenciesSha256,evidenceBundleSha256(m.manifest.vendorDependencies));
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

test('policy hash binds deck, closure, constraints and canonical config but not producer identity',()=>repo(root=>{
 const m=manifest(root),base={role:'candidate-policy',rank:null,producerId:'author-a',deckSha256:h(1),
  policyVersion:'v1',entryManifest:m.manifest,entryManifestSha256:m.entryManifestSha256,
  challengeSuiteSha256:h(3),policyOptions:{mode:'public'},policyConstraintsSha256:constraintsSha};
 const a=I.buildRolePolicyIdentity(base);
 assert.notEqual(I.buildRolePolicyIdentity({...base,deckSha256:h(2)}).policySha256,a.policySha256);
 assert.notEqual(I.buildRolePolicyIdentity({...base,policyConstraintsSha256:h(4)}).policySha256,a.policySha256);
 assert.notEqual(I.buildRolePolicyIdentity({...base,policyOptions:{mode:'owner'}}).policySha256,a.policySha256);
 assert.equal(I.buildRolePolicyIdentity({...base,producerId:'author-b'}).policySha256,a.policySha256);
 assert.throws(()=>I.buildRolePolicyIdentity({...base,policyOptions:{nested:{firstPlayerSeat:0}}}),/physical-game context/);
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

test('actual Agent36 module pin accepts the combined role closure and restores itself',()=>repo(root=>{
 const a=manifest(root,'candidate.cjs'),b=manifest(root,'opponent.cjs');
 const union=I.combineRolePolicyEntryManifests(a,b);
 for(const name of Object.keys(union.expectedByPath))require(path.join(root,name));
 const loaded=I.assertLoadedResearchModulesCovered(root,union.expectedByPath);
 assert.match(loaded.loadedProcessClosureSha256,/^[0-9a-f]{64}$/);
 const result=withPinnedResearchModuleLoads(root,union.expectedByPath,()=>{
  const policy=require(path.join(root,'candidate.cjs'));
  return policy({public:42});
 });
 assert.deepEqual(result.result,{action:'pass',public:42});
 assert.equal(result.audit.guardRestored,true);
 assert.ok(result.audit.files.includes('candidate.cjs'));
 assert.ok(result.audit.files.includes('shared.cjs'));
}));

test('candidate and opponent may have different role-local engine patch dependencies',()=>repo(root=>{
 const cm=manifest(root,'candidate.cjs'),om=manifest(root,'opponent.cjs');
 const c=identity('candidate-policy',null,1,cm),o=identity('opponent-policy',7,2,om);
 const altered={...om.manifest,sharedEnginePatchSha256:h(777)};
 const roleSpecificOpponent=I.buildRolePolicyIdentity({role:'opponent-policy',rank:7,producerId:'opponent-author',
  deckSha256:h(2),policyVersion:'policy-v1',entryManifest:altered,
  entryManifestSha256:evidenceBundleSha256(altered),challengeSuiteSha256:h(900),
  policyOptions:{},policyConstraintsSha256:constraintsSha,
  runtimePinUnionSha256:h(800),loadedProcessClosureSha256:h(801)});
 const pd=preDeal(c,roleSpecificOpponent);
 const applied=I.createPolicyApplicationReceipt({preDeal:pd,candidateIdentity:c,
  opponentIdentity:roleSpecificOpponent,trial:trial(c,roleSpecificOpponent,0,1)});
 assert.equal(applied.receipt.opponentPolicySha256,roleSpecificOpponent.policySha256);
}));

