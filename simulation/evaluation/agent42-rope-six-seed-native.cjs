'use strict';
const assert=require('node:assert/strict');
const {loadCampaignInputs}=require('./aichi-campaign-runner.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {executeDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {withCanonicalActorOnlyPolicy}=require('./agent7-canonical-actor-composition.cjs');
const {rootKey}=require('../../scripts/agent42-sourcefirst-rope-native-paircheck.cjs');
const SCHEDULE=Object.freeze([
  {rank:11,seed:3595827683},{rank:11,seed:2757372600},
  {rank:11,seed:2581034045},{rank:11,seed:3939815003},
  {rank:6,seed:4053525817},{rank:6,seed:3969914932}
]);
function run(){
  const inputs=loadCampaignInputs();
  const row=inputs.candidates.find(x=>x.id==='new-moon-lockbreaker-v1');
  assert.ok(row);
  const plan=planAichi({label:row.id,cards:row.cards},{
    allowEquivalentBasicEnergies:true,allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  assert.equal(plan.candidate.cards.length,60);
  const candidates=new Map([[row.id,{plan}]]);
  const pairs=SCHEDULE.map((s,i)=>{
    const trial={...s,id:'agent42-unselected-'+i,candidateSlot:'B',
      candidateId:row.id,repeat:i};
    const arms=[false,true].map(on=>{
      const prior=process.env.AGENT42_ESCAPE_ROPE_DEV;
      const seat=process.env.AGENT42_ESCAPE_ROPE_OWNER_SEAT;
      process.env.AGENT42_ESCAPE_ROPE_DEV=on?'true':'false';
      process.env.AGENT42_ESCAPE_ROPE_OWNER_SEAT='1';
      try {
        const execution=()=>executeDevelopment(trial,candidates,{
          mandatoryOptionFallback:true,paperSupporterQuota:true,
          initializationWindow:s.rank===6,garbotoxinWindow:s.rank===11
        });
        const result=withCanonicalActorOnlyPolicy(execution,{},{
          ownerSingleSearch:true,genericFallbackAttribution:true,
          actorHandDiscard:true,actorChoosePokemon:true
        });
        return {...result.result,actorAudit:result.audit};
      }catch(e){
        return {trial,status:'engine-error',
          error:String(e?.stack??e).slice(0,3500)};
      }finally{
        if(prior===undefined)delete process.env.AGENT42_ESCAPE_ROPE_DEV;
        else process.env.AGENT42_ESCAPE_ROPE_DEV=prior;
        if(seat===undefined)delete process.env.AGENT42_ESCAPE_ROPE_OWNER_SEAT;
        else process.env.AGENT42_ESCAPE_ROPE_OWNER_SEAT=seat;
      }
    });
    const [a,b]=arms;
    const original=a.rootActionLedger??[],treated=b.rootActionLedger??[];
    let j=0;
    while(j<original.length&&j<treated.length&&
      rootKey(original[j])===rootKey(treated[j]))j++;
    const unchanged=j===original.length&&j===treated.length;
    return {trial,control:a,treatment:b,
      sameSourceDeal:Boolean(a.sourceDealFingerprint&&
        a.sourceDealFingerprint===b.sourceDealFingerprint),
      sameActualStarter:Boolean(a.verifiedFirstTurn&&b.verifiedFirstTurn&&
        a.actualStarterSeat===b.actualStarterSeat),
      firstDifference:unchanged?null:{
        control:original[j]??null,treatment:treated[j]??null},
      ropeRoots:treated.filter(x=>x.action==='PlayCardAction'&&
        x.playerSlot===1&&x.card==='Escape Rope')
        .map(x=>({turn:x.turnBefore,ordinal:x.actionOrdinal}))
    };
  });
  return {schema:'agent42-rope-six-predeclared-original-store-v1',
    registration:'agent42-rope-prospective-six-seeds-20261021.md',
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    selectedHistoricalSeedsExcluded:true,
    attemptedPairs:pairs.length,attemptedArms:2*pairs.length,
    pairs,competitiveQualifiedGames:0,winRateCertified:false};
}
if(require.main===module){
  const r=run();process.stdout.write(JSON.stringify(r,null,2)+'\n');
  process.stderr.write(JSON.stringify(r.pairs.map(x=>({
    rank:x.trial.rank,seed:x.trial.seed,start:x.control.actualStarterSeat,
    matched:x.sameSourceDeal,rope:x.ropeRoots,controlWinner:x.control.winner,
    ropeWinner:x.treatment.winner,controlError:x.control.error?.slice(0,110),
    ropeError:x.treatment.error?.slice(0,110)
  })))+'\n');
}
module.exports={SCHEDULE,run};
