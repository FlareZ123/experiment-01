'use strict';
const assert=require('node:assert/strict');
const {runStewardSelectedIssue25V4}=require('./agent36-issue25-steward-selected-v4.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {TARGET}=require('./agent7-shadowmist-original48-hammer-aba.cjs');
const VERSION='agent7-preserved-mail-original48-aba-v1';
const FLAGS=['AGENT29_HAMMER_AFTER_PASS_DEV',
  'AGENT7_PLUMERIA_PRESERVE_MAIL_DEV','AGENT4_NATIVE_PAYMENT_RECEIPT_DEV'];

/** Three native original-eight arms: preserved-Mail A, Mail-after-Pass B, A repeat.
 * @param {{execute?:Function,development?:Function}} [deps]
 * @returns {object} Native evidence, with every cap and abort retained.
 */
function runPreservedMailTurn5Aba(deps={}){
  const execute=deps.execute??runStewardSelectedIssue25V4;
  const development=deps.development??runDevelopment;
  const saved=FLAGS.map(name=>({
    name,had:Object.hasOwn(process.env,name),value:process.env[name]
  }));
  const run=mail=>{
    process.env.AGENT29_HAMMER_AFTER_PASS_DEV='false';
    process.env.AGENT7_PLUMERIA_PRESERVE_MAIL_DEV='true';
    process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
    return execute({runner:options=>development({
      ...options,actorPlumeriaAfterPass:true,actorOwnerMailAfterPass:mail,
      actorOwnerMailAfterPassScope:mail?{
        trialId:TARGET,globalTurn:5
      }:null
    })});
  };
  let runs;
  try{runs=[run(false),run(true),run(false)];}
  finally{for(const x of saved){
    if(x.had)process.env[x.name]=x.value;
    else delete process.env[x.name];
  }}
  const maps=runs.map(result=>{
    const rows=result.rawDevelopment?.rows;
    assert.equal(rows?.length,8);
    const map=new Map(rows.map(row=>[row.trial.id,row]));
    assert.equal(map.size,8);
    return map;
  });
  const ledger=row=>row.rootActionLedger??
    row.nativeAbortEvidence?.rootActionLedger??[];
  const projection=row=>ledger(row).map(x=>[
    x.playerSlot,x.turnBefore,x.action,x.card,x.attack,x.pendingPrompt
  ]);
  const trials=[...maps[0].keys()].map(id=>{
    const [a,b,c]=maps.map(map=>map.get(id));
    assert.ok(a&&b&&c);
    for(const row of [b,c]){
      assert.equal(row.sourceDealFingerprint,a.sourceDealFingerprint,id);
      assert.equal(row.fullPhysicalDealFingerprint,
        a.fullPhysicalDealFingerprint,id);
      assert.equal(row.actualStarterSeat,a.actualStarterSeat,id);
    }
    assert.deepEqual(projection(a),projection(c),id);
    const preWindow=x=>ledger(x).filter(root=>
      root.turnBefore===null||root.turnBefore===undefined||
      root.turnBefore<5).map(root=>[
        root.playerSlot,root.turnBefore,root.action,
        root.card,root.attack,root.pendingPrompt
      ]);
    assert.deepEqual(preWindow(a),preWindow(b),
      id+' treatment must preserve all pre-turn5 public actions');
    if(id!==TARGET)assert.deepEqual(projection(a),projection(b),
      id+' non-target trial must be entirely unaffected');
    const sourceSeat=b.sourceSeat??b.nativeAbortProvenance?.sourceSeat;
    const mail=b.ownerMailAfterPassAudit;
    const sourceMail=(mail?.selectedReceipts??[])
      .filter(x=>x.seat===sourceSeat);
    const firstSourceMailTurn=sourceMail.find(
      x=>x.nativeStore==='accepted')?.turn??null;
    const sourceOpponentReply=firstSourceMailTurn===null?null:
      ledger(b).find(x=>x.playerSlot===1-sourceSeat&&
        x.turnBefore===firstSourceMailTurn+1&&
        x.action!=='ResolvePromptAction')??null;
    const plumeria=x=>x.actorOnlyDecisionCoverage?.
      detailedComponentAudits?.ownerPlumeriaAfterPass??null;
    const beforeFive=x=>(plumeria(x)?.physicallyAcceptedOwnerPayments??[])
      .filter(p=>p.turn<5).map(p=>({
        seat:p.seat,turn:p.turn,accepted:p.acceptedByOriginalStore,
        payment:p.payment.map(card=>card.printing).sort()
      }));
    assert.deepEqual(beforeFive(a),beforeFive(b),
      id+' original Plumeria payment changed before Mail treatment');
    if(id===TARGET){
      const paid=beforeFive(a).find(p=>
        p.seat===1&&p.turn===3&&p.accepted===true);
      assert.deepEqual(paid?.payment,
        ['Enhanced Hammer TWM',"Trainers' Mail ROS"]);
    }
    return {
      id,sourceSeat,starter:a.actualStarterSeat,
      sourceDeal:a.sourceDealFingerprint,
      fullDeal:a.fullPhysicalDealFingerprint,
      statuses:[a,b,c].map(x=>x.status??'unqualified'),
      roots:[a,b,c].map(x=>ledger(x).length),
      plumeriaAccepted:[a,b,c].map(x=>plumeria(x)?.acceptedPlumeria??null),
      plumeriaEnergyDiscardSettled:[a,b,c]
        .map(x=>plumeria(x)?.settledEnergyDiscards??null),
      plumeriaPayments:[a,b,c].map(x=>
        (plumeria(x)?.physicallyAcceptedOwnerPayments??[]).map(r=>({
          seat:r.seat,turn:r.turn,accepted:r.acceptedByOriginalStore,
          payment:r.payment.map(card=>card.printing).sort()
        }))),
      mailAccepted:mail?.mailStoreAccepted??null,
      mailPromptsObserved:mail?.liveOwnerMailSearchPrompts??null,
      mailPromptsSettled:mail?.promptAccepted??null,
      mailOwnerDirectHiddenDeckRead:mail?.
        nativeSourceHiddenOrderReadByThisBridge??null,
      firstSourceMailTurn,sourceOpponentReply,
      mailCardsToHand:mail?.chosenCardsSettledInHand??null,
      sourceMailReceipts:sourceMail.map(x=>({
          turn:x.turn,nativeStore:x.nativeStore,
          prompt:x.mailPrompt,chosen:x.chosen??[]
        }))
    };
  });
  const target=trials.find(x=>x.id===TARGET);
  assert.ok(target);
  return {version:VERSION,target,allTrials:trials,
    registeredOriginalArmsPerCondition:8,conditions:3,
    samePhysicalFirstDeals:true,identicalRepeatedControl:true,
    treatmentOnly:'owner-observed Mail after Pass',
    paperQualifiedGames:0,competitiveWinRate:null};
}
module.exports={VERSION,FLAGS,runPreservedMailTurn5Aba};
