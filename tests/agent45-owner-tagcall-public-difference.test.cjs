'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {
  sourceSeatForTrial,activity,compareTagCallPublicRoots
}=require('../simulation/evaluation/agent45-owner-tagcall-public-difference.cjs');

const IDS=[
  '6:100:A:champion-reference','6:100:A:new-moon-lockbreaker-v1',
  '6:101:B:champion-reference','6:101:B:new-moon-lockbreaker-v1',
  '11:102:A:champion-reference','11:102:A:new-moon-lockbreaker-v1',
  '11:103:B:champion-reference','11:103:B:new-moon-lockbreaker-v1'
];
function ledgerRow(id,actions){
  const hash=createHash('sha256').update(JSON.stringify(actions))
    .digest('hex');
  return {
    id,publicRootActions:actions,publicRootActionCount:actions.length,
    publicRootActionsTruncated:false,
    publicRootLedgerSha256Computed:hash,
    publicRootLedgerDigestConsistent:true
  };
}
const root=(seat,action,card=null,turn=1)=>({
  playerSlot:seat,action,card,turnBefore:turn
});
const base=id=>[
  root(sourceSeatForTrial(id),'PassTurnAction'),
  root(sourceSeatForTrial(id),'PassTurnAction',null,3)
];

test('source seat derives from frozen slot even for aborted row',()=>{
  assert.equal(sourceSeatForTrial(IDS[0]),1);
  assert.equal(sourceSeatForTrial(IDS[2]),0);
  assert.throws(()=>sourceSeatForTrial('unknown'));
});

test('only genuine public accepted root plays count',()=>{
  const actions=[
    root(0,'PlayCardAction','Tag Call CEC'),
    root(0,'ResolvePromptAction'),
    root(0,'PlayCardAction','Guzma & Hala CEC',3),
    root(0,'PassTurnAction',null,5),
    root(1,'PlayCardAction','Tag Call CEC',3)
  ];
  const result=activity(actions,0);
  assert.equal(result.tagCallPlayed,1);
  assert.equal(result.guzmaHalaPlayed,1);
  assert.equal(result.passes,1);
  assert.equal(result.attacks,0);
  assert.equal(result.cardsPlayed,2);
  assert.equal(result.roots,4);
});

test('full eight exact ledgers distinguish changed true source Item from no-change arms',()=>{
  const control={attempts:IDS.map(id=>ledgerRow(id,base(id)))};
  const treatment={attempts:IDS.map(id=>
    ledgerRow(id,id===IDS[2]?
      [root(0,'PlayCardAction','Tag Call CEC'),root(0,'PassTurnAction')]:
      base(id)))};
  const audit=compareTagCallPublicRoots(control,treatment,IDS);
  assert.equal(audit.rows.length,8);
  assert.equal(audit.rows.filter(x=>!x.identicalPublicAcceptedRoots).length,1);
  assert.equal(audit.rows[2].firstPublicActionDifference.ordinal,0);
  assert.equal(audit.rows[2].treatmentSourceActions.tagCallPlayed,1);
  assert.equal(audit.rows[2].controlSourceActions.tagCallPlayed,0);
  assert.equal(audit.rows[5].identicalPublicAcceptedRoots,true);
  assert.equal(audit.qualifiedCompetitiveGames,0);
});

test('reject truncated or inconsistent native action receipts before conclusions',()=>{
  const control={attempts:IDS.map(id=>ledgerRow(id,base(id)))};
  const variant={attempts:IDS.map(id=>ledgerRow(id,base(id)))};
  variant.attempts[3].publicRootActionCount=1;
  assert.throws(()=>compareTagCallPublicRoots(control,variant,IDS),
    {name:'AssertionError'});
  variant.attempts[3].publicRootActionCount=2;
  variant.attempts[3].publicRootActionsTruncated=true;
  assert.throws(()=>compareTagCallPublicRoots(control,variant,IDS),
    {name:'AssertionError'});
});
