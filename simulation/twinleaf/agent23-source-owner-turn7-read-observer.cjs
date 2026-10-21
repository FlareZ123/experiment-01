'use strict';
const assert=require('node:assert/strict');
const {actorObservation}=require('./actor-observation-contract.cjs');

const VERSION='agent23-source-owned-turn7-root-read-v1';

/**
 * Keep only Source-owner-authenticated own-hand recovery resources.
 * Opponent private cards are not read. This read-only report is collected
 * strictly for later game auditing and is never supplied to either policy.
 * @param {object} view Deeply frozen real actorObservation.
 */
function ownerRecoverySnapshot(view){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic;
  const names=[
    'Float Stone BKT','Guzma BUS','Escape Rope BST',
    'VS Seeker PHF','Secret Box TWM','Shopping Center EVS',
    'Darkness Energy MEE','Dark Patch ASR','Professor\'s Letter BKT'
  ];
  const held=Object.fromEntries(names.map(name=>[
    name,view.ownHand.filter(card=>card===name).length
  ]));
  const active=own.active;
  const visible=(slot)=>slot?{
    printing:slot.printing,
    damage:slot.damage,retreatCost:slot.printed?.retreatCost??[],
    tools:slot.tools,energies:slot.energies,
    attacks:slot.attacks.map(a=>({name:a.name,cost:a.cost,damage:a.damage}))
  }:null;
  return {
    turn:view.globalTurn,actorSeat:view.actorSeat,
    handSize:view.ownHand.length,
    heldRecoveryPrintings:held,
    active:visible(active),
    benched:own.bench.map(visible),
    publicDiscardGuzma:own.discard.filter(x=>x==='Guzma BUS').length,
    publicDiscardFloatStone:own.discard.filter(x=>x==='Float Stone BKT').length,
    ownTurnResources:view.ownTurnResources,
    opponentPublicActive:visible(view.opponentPublic?.active),
    opponentHandIdentityInspected:false,
    cardAvailabilityEqualsLegality:false,
    paperOutcomeQualified:false
  };
}

/**
 * Install one reversible owner-root-read observer only while the existing
 * headless match runs, *inside* already installed outer policy adapters.
 * Captures before original native decision. Its result does not decide any
 * action or mutate a cloned/live Store. Authenticated replay fingerprint is
 * compared independently after full game completion.
 *
 * @template T
 * @param {Function} BotClass Native SimpleTacticsAi class.
 * @param {()=>T} execute Existing full match.
 * @param {{seat:0|1,turn:number}} target
 * @param {{headless?:object,makeObservation?:Function}} [deps]
 * @returns {{result:T,observationAudit:object}}
 */
function withOwnedTurnRootReadObserver(BotClass,execute,target,deps={}){
  assert.equal(typeof execute,'function');
  assert.ok([0,1].includes(target?.seat));
  assert.ok(Number.isSafeInteger(target.turn)&&target.turn>=1);
  const headless=deps.headless??require('./headless.cjs');
  const makeObservation=deps.makeObservation??actorObservation;
  assert.equal(typeof headless.runMatch,'function');
  const originalRun=headless.runMatch;
  let matchCalls=0,seenRoots=0,selectedRecords=[];
  let hookErrors=0;
  function observedRun(request){
    matchCalls++;
    const proto=BotClass.prototype;
    const descriptor=Object.getOwnPropertyDescriptor(proto,'decodeNextAction');
    assert.equal(typeof descriptor?.value,'function');
    function observedDecode(state,...args){
      const actor=state.players?.[target.seat];
      const eligible=state.turn===target.turn &&
        state.activePlayer===target.seat &&
        state.prompts?.every(prompt=>prompt.result!==undefined) &&
        actor?.id===this.client?.id;
      if(!eligible)return descriptor.value.apply(this,[state,...args]);
      seenRoots++;
      let event;
      try{
        const view=makeObservation(state,target.seat);
        const root=ownerRecoverySnapshot(view);
        event={root,preDecision:true};
      }catch(error){
        hookErrors++;
        event={observationError:String(error?.message??error),
          preDecision:true};
      }
      const selected=descriptor.value.apply(this,[state,...args]);
      event.nativeChosenAction=selected?.constructor?.name??null;
      event.rootPosition=seenRoots;
      if(selectedRecords.length<12)selectedRecords.push(event);
      return selected;
    }
    Object.defineProperty(proto,'decodeNextAction',
      {...descriptor,value:observedDecode});
    try{return originalRun.call(this,request);}
    finally{
      const owned=proto.decodeNextAction===observedDecode;
      Object.defineProperty(proto,'decodeNextAction',descriptor);
      assert.ok(owned,
        'Source owner observer lost native decision hook ownership');
    }
  }
  headless.runMatch=observedRun;
  try{
    const result=execute();
    return {result,observationAudit:{
      version:VERSION,target,matchCalls,seenRoots,hookErrors,
      boundedRoots:selectedRecords,
      originalPolicyActionsPreservedByDesign:true,
      qualification:{
        fullGameUnchangedRequiresIndependentNativeLedgerCheck:true,
        opponentHiddenHandRead:false,
        nativeLegalAlternativesTested:false,
        competitiveGameQualified:false
      }
    }};
  }finally{
    const owned=headless.runMatch===observedRun;
    headless.runMatch=originalRun;
    assert.ok(owned,'Source owner observer lost headless runMatch hook');
  }
}

module.exports={VERSION,ownerRecoverySnapshot,withOwnedTurnRootReadObserver};
