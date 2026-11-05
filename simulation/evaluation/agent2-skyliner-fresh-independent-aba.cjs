'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {initializeCards}=require('../twinleaf/headless.cjs');
const {originals}=require('./agent41-rank3-arbitration-original-store.cjs');
const {runArm}=require('./agent2-fresh-rank1-rank3-multibasic-panel.cjs');

const VERSION='agent2-independent-fresh-seed-skyliner-eight-group-aba-v1';
const SEEDS=Object.freeze([150259101,28170349,1756373271,679037087]);
const SOURCE='72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f';
const REFERENCE='de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311';
const NATIVE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');

/**
 * Confirm actual public post-Store zero-payment retreat and same-turn attack.
 * @param {object} e Accepted target-sidecar event.
 * @param {object[]} roots Exact native root actions.
 * @returns {object|null}
 */
function physicalFreeRetreat(e,roots){
  if(e?.action!=='RetreatAction'||e.storeAccepted!==true||
    e.declared?.kind!=='retreat'||e.declared?.status!=='captured')
    return null;
  const beforeActive=e.publicBoardChanges?.find(c=>
    c.seat===e.playerSlot&&c.position==='active'&&
    c.before?.pokemon&&c.after?.pokemon&&
    c.before.pokemon!==c.after.pokemon);
  const movedToBench=e.publicBoardChanges?.find(c=>
    c.seat===e.playerSlot&&c.position==='bench'&&
    c.after?.pokemon===beforeActive?.before.pokemon);
  if(!beforeActive||!movedToBench)return null;
  const originalEnergy=beforeActive.before.energies?.length;
  const benchedEnergy=movedToBench.after.energies?.length;
  const zeroDebit=Number.isInteger(originalEnergy)&&
    originalEnergy===benchedEnergy;
  const root=roots.find(r=>r.action==='RetreatAction'&&
    r.actionOrdinal===e.rootActionOrdinal);
  const attack=root?roots.find(r=>
    r.playerSlot===root.playerSlot&&r.turnBefore===root.turnBefore&&
    r.actionOrdinal>root.actionOrdinal&&r.action==='AttackAction'):null;
  const opponent=root?roots.find(r=>
    r.playerSlot!==root.playerSlot&&r.turnBefore>root.turnBefore&&
    r.actionOrdinal>root.actionOrdinal&&
    ['PlayCardAction','RetreatAction','AttackAction','PassTurnAction']
      .includes(r.action)):null;
  return {
    ownerSeat:e.playerSlot,
    genuineRoot:root?.actionOrdinal??null,
    nativeAccepted:true,
    nativePhysicalExchange:true,
    physicallyZeroEnergyDebit:zeroDebit,
    before:beforeActive.before.pokemon,
    promoted:beforeActive.after.pokemon,
    nextSameTurnAttack:attack?{
      ordinal:attack.actionOrdinal,name:attack.attack??null
    }:null,
    firstOpponentVoluntary:opponent?{
      turn:opponent.turnBefore,action:opponent.action,
      card:opponent.card??null
    }:null
  };
}

/** @returns {object} Fresh eight-group original same-60 A/B/A native ledger. */
function run(){
  initializeCards();
  const decks=originals();
  assert.equal(sha(decks.source),SOURCE);
  assert.equal(sha(decks.candidate),REFERENCE);
  const prior=new Map([
    ['AGENT8_ACTOR_QUICK_BALL_DEV',process.env.AGENT8_ACTOR_QUICK_BALL_DEV],
    ['AGENT41_OWNER_TERMINAL_ARBITRATION_DEV',
      process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV]
  ]);
  const groups=[];
  try{
    for(const key of prior.keys())process.env[key]='false';
    for(const seed of SEEDS){
      for(const rank3Seat of [0,1]){
        const modes=[
          {name:'control',mode:'control'},
          {name:'treatment',mode:'bilateral-skyliner-free-retreat'},
          {name:'control-repeat',mode:'control'}
        ];
        const arms=modes.map(spec=>runArm({
          id:[seed,rank3Seat,spec.name].join(':'),
          seed,rank3Seat,mode:spec.mode,
          energyRecipient:true,captureTargets:true
        },decks));
        const [a,b,repeat]=arms;
        const physicallyMatched=arms.every(x=>
          x.status!=='native-error'&&
          x.fullDealSha256!==null&&
          x.rank3DealSha256!==null&&
          x.fullDealSha256===a.fullDealSha256&&
          x.rank3DealSha256===a.rank3DealSha256&&
          x.actualFirstSeat===a.actualFirstSeat);
        const repeatExact=physicallyMatched&&
          a.rootLedgerSha256===repeat.rootLedgerSha256&&
          a.winner===repeat.winner&&
          a.status===repeat.status&&
          a.actions===repeat.actions&&
          a.globalTurns===repeat.globalTurns;
        const roots=b.rootActionLedger??[];
        const offers=b.genericAudit?.proposals??[];
        const receipts=(b.nativeAcceptedTargetSidecar?.events??[])
          .map(e=>physicalFreeRetreat(e,roots)).filter(Boolean);
        groups.push({
          seed,rank3Seat,rank1Seat:1-rank3Seat,
          original60sUnchanged:a.originalSource60Hash===SOURCE&&
            a.originalReference60Hash===REFERENCE&&
            arms.every(x=>x.originalSource60Hash===SOURCE&&
              x.originalReference60Hash===REFERENCE),
          initialPhysicalDealMatched:physicallyMatched,
          repeatedControlExact:repeatExact,
          physicalDealSha256:a.fullDealSha256??null,
          originalRank3DealSha256:a.rank3DealSha256??null,
          actualFirstSeat:a.actualFirstSeat??null,
          nativeStatus:arms.map(x=>x.status),
          nativeErrors:arms.map(x=>x.error??null),
          originalPassesBySeat:b.genericAudit?.originalPassesBySeat??null,
          nominalOffersBySeat:b.genericAudit?.nominalOffersBySeat??null,
          nativeFreeCostsBySeat:b.genericAudit?.nativeZeroCostBySeat??null,
          typedRetreatProposalsBySeat:
            b.genericAudit?.typedRetreatProposalsBySeat??null,
          treatmentPolicyProposals:offers,
          acceptedPhysicalRetreats:receipts,
          controlWinner:a.winner??null,
          treatmentWinner:b.winner??null,
          controlRank1Attacks:a.rank1AttackCount??null,
          treatmentRank1Attacks:b.rank1AttackCount??null,
          controlRank3Attacks:a.rank3AttackCount??null,
          treatmentRank3Attacks:b.rank3AttackCount??null,
          rootHashes:arms.map(x=>x.rootLedgerSha256??null),
          actionCounts:arms.map(x=>x.actions??null),
          rawArms:arms
        });
      }
    }
  }finally{
    for(const [k,value] of prior){
      if(value===undefined)delete process.env[k];
      else process.env[k]=value;
    }
  }
  const arms=groups.flatMap(x=>x.rawArms);
  const nativeTerminals=arms.filter(x=>x.status==='native-terminal').length;
  const nominalOffers=groups.reduce((n,x)=>
    n+(x.nominalOffersBySeat??[]).reduce((a,b)=>a+b,0),0);
  const nativePhysicalFreeRetreats=groups.reduce((n,x)=>
    n+x.acceptedPhysicalRetreats.filter(y=>
      y.physicallyZeroEnergyDebit).length,0);
  const nativeWinnerReversals=groups.filter(x=>
    x.nativeStatus.every(s=>s==='native-terminal')&&
    x.controlWinner!==x.treatmentWinner).length;
  return {
    version:VERSION,registration:'agent2-skyliner-fresh-independent-8group-prereg-20261105.md',
    independentNativeSample:true,
    seedSampling:'OS SystemRandom four 32-bit integers on 2026-11-05T22:46:40Z',
    registeredSeeds:[...SEEDS],twoRealSeats:[0,1],
    nativePin:NATIVE_PIN,originalRank3Hash:SOURCE,
    originalRank1Hash:REFERENCE,
    originalGames:8,expectedArms:24,actualArms:arms.length,
    nativeTerminalArms:nativeTerminals,
    nativeErrors:arms.filter(x=>x.status==='native-error').length,
    nativeCaps:arms.filter(x=>x.status==='native-cap').length,
    allSamePhysicalDeal:groups.every(x=>x.initialPhysicalDealMatched),
    allControlsRepeatedExactly:groups.every(x=>x.repeatedControlExact),
    allOriginal60Unchanged:groups.every(x=>x.original60sUnchanged),
    nominalOffers,nativePhysicalFreeRetreats,nativeWinnerReversals,
    groups,competitivelyQualifiedGames:0,
    inference:'Fresh original rank1-vs-rank3 developmental Store games only; no population win rate, clock or 32-field coverage.'
  };
}
if(require.main===module){
  try{
    const result=run();
    process.stdout.write(JSON.stringify(result)+'\n');
    if(result.actualArms!==24||!result.allSamePhysicalDeal||
      !result.allControlsRepeatedExactly||!result.allOriginal60Unchanged||
      result.nativeErrors>0||result.nativeCaps>0)
      process.exitCode=1;
  }catch(error){
    process.stdout.write(JSON.stringify({
      version:VERSION,status:'runner-error',
      error:String(error?.stack??error).slice(0,6000),
      competitivelyQualifiedGames:0
    })+'\n');
    process.exitCode=1;
  }
}
module.exports={VERSION,SEEDS,physicalFreeRetreat,run};
