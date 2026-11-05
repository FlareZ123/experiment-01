'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {TARGET}=require('../simulation/evaluation/agent7-shadowmist-original48-hammer-aba.cjs');
const {FLAGS,runPreservedMailTurn5Aba}=
  require('../simulation/evaluation/agent7-preserved-mail-turn5-original48-aba.cjs');

function mockExecutor(){
  let calls=0;
  const ids=[TARGET,...Array.from({length:7},(_,i)=>'case'+i)];
  const development=options=>({options});
  const execute=({runner})=>{
    const chosen=runner({actorOnlyComposition:true});
    const mail=chosen.options.actorOwnerMailAfterPass;
    const scope=chosen.options.actorOwnerMailAfterPassScope;
    if(mail)assert.deepEqual(scope,{trialId:TARGET,globalTurn:5});
    else assert.equal(scope,null);
    calls++;
    const rows=ids.map(id=>({
      trial:{id},sourceSeat:1,actualStarterSeat:0,
      sourceDealFingerprint:'source-'+id,
      fullPhysicalDealFingerprint:'all-'+id,
      status:'action-limit',rootActionLedger:[{
        playerSlot:1,turnBefore:3,action:'PassTurnAction'
      }],
      actorOnlyDecisionCoverage:{detailedComponentAudits:{
        ownerPlumeriaAfterPass:{acceptedPlumeria:id===TARGET?1:0,
          physicallyAcceptedOwnerPayments:id===TARGET?[{
            seat:1,turn:3,acceptedByOriginalStore:true,
            payment:[{printing:'Enhanced Hammer TWM'},
              {printing:"Trainers' Mail ROS"}]
          }]:[]}
      }},
      ownerMailAfterPassAudit:mail&&id===TARGET?{
        mailStoreAccepted:1,promptAccepted:1,
        chosenCardsSettledInHand:1,
        selectedReceipts:[{seat:1,turn:5,
          nativeStore:'accepted',mailPrompt:'owner-prompt-accepted',
          chosen:['Guzma CEC']}]
      }:undefined
    }));
    return {rawDevelopment:{rows}};
  };
  return {execute,development,getCalls:()=>calls};
}
test('A/B/A carries original eight with physical same-deal and T5 receipt',()=>{
  const deps=mockExecutor();
  const before=new Map(FLAGS.map(name=>[name,process.env[name]]));
  const result=runPreservedMailTurn5Aba(deps);
  assert.equal(deps.getCalls(),3);
  assert.equal(result.allTrials.length,8);
  assert.equal(result.target.id,TARGET);
  assert.deepEqual(result.target.statuses,['action-limit','action-limit','action-limit']);
  assert.equal(result.target.mailAccepted,1);
  assert.equal(result.target.sourceMailReceipts[0].turn,5);
  assert.equal(result.paperQualifiedGames,0);
  for(const name of FLAGS)assert.equal(process.env[name],before.get(name));
});
test('rejects changed source full deal while restoring environment',()=>{
  const deps=mockExecutor();
  let count=0;
  const execute=({runner})=>{
    const result=deps.execute({runner});
    count++;
    if(count===2)result.rawDevelopment.rows[0].fullPhysicalDealFingerprint='changed';
    return result;
  };
  const before=FLAGS.map(name=>[name,process.env[name]]);
  assert.throws(()=>runPreservedMailTurn5Aba({...deps,execute}),
    /Expected values to be strictly equal/);
  for(const [name,value] of before)assert.equal(process.env[name],value);
});
