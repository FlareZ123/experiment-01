'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {run:runMailABA}=require('./agent4-bilateral-mail-original-eight-aba-v1.cjs');
const {runStewardInnermostPrizeV5}=require('./agent36-issue25-steward-innermost-prize-v5.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {writeAtomicLocked}=require('./agent20-frozen-rank6-canary-v1.cjs');
const reg=require('../../results/aichi-2026/registrations/agent4-mail-plumeria-source-opportunity-aba-20261105.json');
const VERSION='agent4-original-mail-plumeria-afterpass-native-ABA-v1';
function countActions(roots,seat,action,card){return roots.filter(x=>x.seat===seat&&x.action===action&&(!card||x.card===card)).length;}
function run(deps={}){
 const baselineRunner=deps.runner??(()=>runStewardInnermostPrizeV5({runner:options=>runDevelopment({...options,actorPlumeriaAfterPass:true})}));
 const rawAudits=[];
 const wrapped=()=>{const result=baselineRunner();rawAudits.push(result.rawDevelopment?.rows?.map(r=>({id:r.trial?.id??r.id,physicalOwnerPlumeria:r.actorOnlyDecisionCoverage?.ownerPlumeriaAfterPassAudit??null}))??[]);return result;};
 const sample=(deps.mailABA??runMailABA)({runner:wrapped});
 assert.equal(sample.originalEight,8);
 const rank6=sample.panel.filter(x=>x.id.startsWith('6:100:A:'));
 assert.equal(rank6.length,2);
 const rows=rank6.map(x=>{
   const a=x.changeAudit?.baselinePublicRootTape??[];
   const b=x.changeAudit?.treatedPublicRootTape??[];
   const source=1,candidate=0;
   return {id:x.id,sourceSeat:source,candidateSeat:candidate,
    openingParity:x.fullOpeningParity&&x.sourceOpeningParity,
    firstDivergence:x.firstTreatedRootDivergence,
    controlPlumeria:countActions(a,source,'PlayCardAction','Plumeria'),
    treatedPlumeria:countActions(b,source,'PlayCardAction','Plumeria'),
    controlMail:countActions(a,source,'PlayCardAction',"Trainers' Mail"),
    treatedMail:countActions(b,source,'PlayCardAction',"Trainers' Mail"),
    controlCandidateAttacks:a.filter(x=>x.seat===candidate&&x.action==='AttackAction'),
    treatedCandidateAttacks:b.filter(x=>x.seat===candidate&&x.action==='AttackAction'),
    controlSourceTurn3:a.filter(x=>x.seat===source&&x.turn===3),
    treatedSourceTurn3:b.filter(x=>x.seat===source&&x.turn===3),
    controlCandidateTurn4:a.filter(x=>x.seat===candidate&&x.turn===4),
    treatedCandidateTurn4:b.filter(x=>x.seat===candidate&&x.turn===4),
    controlLastTurn:a.length?a[a.length-1].turn:null,
    treatmentLastTurn:b.length?b[b.length-1].turn:null};
 });
 return {schema:VERSION,sourceRegistration:reg.schema,
  controlAndTreatmentUseActorPlumeriaAfterPass:true,
  sameAllEightInitialPhysicalDeals:sample.sameAllPhysicalOpenings,
  repeatedOriginalPolicyIdentical:sample.ARepeatFullyDeterministic,
  originalTrialCount:sample.originalEight,
  rank6OriginalMatchedArms:rows,
  fullNativeMailAudit:sample.bilateralMailAudit,
  actualPerTrialPlumeriaNativeAuditABA:rawAudits.map((rows,i)=>({phase:['A-original','B-mail','A-repeated'][i],originalRank6:rows.filter(x=>x.id?.startsWith('6:100:A:')).map(x=>({id:x.id,actualStoreAccepted:x.physicalOwnerPlumeria?.acceptedPlumeria??null,physicalOpponentEnergyDiscards:x.physicalOwnerPlumeria?.settledEnergyDiscards??null,realPhysicalOwnerPayments:x.physicalOwnerPlumeria?.physicallyAcceptedOwnerPayments??[],bySeat:x.physicalOwnerPlumeria?.bySeat??null}))})),
  allArmNativeStatus:sample.panel.map(x=>({id:x.id,control:x.originalDisposition,treatment:x.treatmentDisposition,repeat:x.repeatedDisposition})),
  paperQualifiedGameCount:0,winRate:null};
}
if(require.main===module){
 const file=process.env.AGENT4_MAIL_PLUMERIA_ABA_OUTPUT;
 assert.ok(file,'Set archival filename');
 const d=run(),bytes=JSON.stringify(d,null,2)+'\n';
 fs.mkdirSync(path.dirname(file),{recursive:true});
 writeAtomicLocked(file,bytes);
 writeAtomicLocked(file+'.sha256',createHash('sha256').update(bytes).digest('hex')+'  '+path.basename(file)+'\n');
 process.stdout.write('AGENT4_MAIL_PLUMERIA_ABA '+JSON.stringify({sameDeals:d.sameAllEightInitialPhysicalDeals,repeatControls:d.repeatedOriginalPolicyIdentical,rank6:d.rank6OriginalMatchedArms.map(x=>({id:x.id,controlPlumeria:x.controlPlumeria,treatedPlumeria:x.treatedPlumeria,controlMail:x.controlMail,treatedMail:x.treatedMail,controlTurn4:x.controlCandidateTurn4,treatedTurn4:x.treatedCandidateTurn4})),qualifiedGames:0})+'\n');
}
module.exports={VERSION,run};
