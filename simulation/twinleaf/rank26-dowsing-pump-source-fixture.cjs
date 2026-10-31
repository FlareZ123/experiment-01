'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {fixture}=require('./rank26-pump-source-conserved-fixture.cjs');
const {exchange}=require('./rank26-redeemable-ticket-source-fixture.cjs');
const {withRank26ExeggcutePump}=
  require('./rank26-exeggcute-pump-policy.cjs');
const {withRank26PropagationLoop}=
  require('./rank26-propagation-loop.cjs');
const {installDamagePumpSingleSourceHook}=
  require('./damage-pump-single-source-hook.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const engine=name=>require(path.join(OUTPUT,name));

/** @param {object} player @returns {object[]} */
function physical(player){
  return [
    ...player.active.cards,
    ...player.bench.flatMap(slot=>[...slot.cards,...slot.tools,...slot.energies.cards]),
    ...player.stadium.cards,...player.supporter.cards,
    ...player.hand.cards,...player.deck.cards,...player.discard.cards,
    ...player.lostzone.cards,...player.prizes.flatMap(slot=>slot.cards)
  ];
}

/** Preserve source original physical ids; stage scarce item and its payment. */
function stage(f){
  const own=f.own;
  exchange(own,'Dowsing Machine',own.hand,4);
  const mails=own.deck.cards.filter(card=>card.name==="Trainers' Mail").slice(0,2);
  assert.equal(mails.length,2,'Need two real distinct Mail payment copies in deck');
  for(const card of mails)own.deck.moveCardTo(card,own.hand);
  const extra=own.deck.cards.find(card=>card.name==='Damage Pump');
  assert.ok(extra,'Expected another source original Pump in deck');
  own.deck.moveCardTo(extra,own.hand);
  assert.equal(own.hand.cards.filter(c=>c.name==='Damage Pump').length,2);
  assert.equal(own.hand.cards.filter(c=>c.name==='Dowsing Machine').length,1);
  assert.equal(own.hand.cards.filter(c=>c.name==="Trainers' Mail").length,2);
  const ids=physical(own).map(card=>card.id);
  assert.equal(ids.length,60);
  assert.equal(new Set(ids).size,60);
  return ids.sort((a,b)=>a-b);
}

/**
 * Dispatch one real Dowsing Item plus all prompted card choices on a prepared
 * physical source-60 Store. Each selected card is an actual source instance.
 * Any mismatch is reported at the precise physical prompt, never glossed over.
 * @param {object} f
 */
function playDowsing(f){
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const own=f.own;
  const index=own.hand.cards.findIndex(card=>card.name==='Dowsing Machine');
  assert.ok(index>=0);
  const pumpBefore=own.discard.cards.find(card=>card.name==='Damage Pump');
  assert.ok(pumpBefore,'Must actually have spent a Pump before retrieval');
  const dowsing=own.hand.cards[index];
  const receipts=[];
  f.store.dispatch(new PlayCardAction(own.id,index,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  receipts.push({action:'PlayCardAction',name:dowsing.fullName,
    pending:f.state.prompts.find(p=>p.result===undefined)?.constructor.name??null});
  for(let i=0;i<4;i++){
    const pending=f.state.prompts.find(p=>p.result===undefined);
    if(!pending)break;
    assert.equal(pending.playerId,own.id,'Dowsing prompts owned by source');
    let cards;
    let intended;
    const pool=Array.isArray(pending.cards)?pending.cards:
      (pending.cards?.cards??[]);
    const eligible=card=>pool.some(candidate=>candidate.id===card.id);
    const mailPayment=own.hand.cards.filter(card=>
      card.name==="Trainers' Mail"&&eligible(card));
    if(mailPayment.length>=2){
      cards=mailPayment.slice(0,2);
      intended='discard-two-own-hand-cards';
    }else if(eligible(pumpBefore) &&
      own.discard.cards.some(card=>card.id===pumpBefore.id)){
      cards=[pumpBefore];
      intended='recover-physical-discarded-Pump';
    }else{
      throw Error('Unrecognized native Dowsing prompt: '+JSON.stringify({
        type:pending.constructor.name,
        poolClass:pending.cards?.constructor?.name,
        poolSize:pool.length,
        poolNames:pool.slice(0,8).map(c=>c.name),
        promptKeys:Object.keys(pending),
        ownerMailCount:own.hand.cards.filter(c=>
          c.name==="Trainers' Mail").length,
        discardPumpCount:own.discard.cards.filter(c=>
          c.name==='Damage Pump').length
      }));
    }
    assert.equal(pending.validate(cards,f.state),true,
      'Dowsing real Store rejected requested '+intended);
    f.store.dispatch(new ResolvePromptAction(pending.id,cards));
    receipts.push({action:'ResolvePromptAction',intent:intended,
      choice:cards.map(card=>card.fullName),
      pendingNext:f.state.prompts.find(p=>p.result===undefined)?.constructor.name??null});
  }
  assert.equal(f.state.prompts.filter(p=>p.result===undefined).length,0,
    'Unresolved Dowsing native prompt');
  assert.equal(own.hand.cards.some(card=>card.id===pumpBefore.id),true,
    'Spent physical Pump not actually recovered into hand');
  assert.equal(own.discard.cards.some(card=>card.id===dowsing.id),true,
    'Dowsing physical Item did not enter own discard');
  assert.equal(own.discard.cards.filter(c=>c.name==="Trainers' Mail").length,2,
    'Exactly two printed payment cards must be discarded');
  return receipts;
}

/** Prepared original60 2+2+1 fifth self-KO with an actual Dowsing retrieval. */
function runSeat(seat){
  const f=fixture(seat);
  const startingIds=stage(f);
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {GamePhase}=engine('game/store/state/state');
  const restore=installDamagePumpSingleSourceHook();
  try{
    const audit=withRank26ExeggcutePump(seat,()=>
      withRank26PropagationLoop(seat,()=>{
        const actor={client:{id:f.own.id}};
        const prizeProgress=[];
        const nativeRoots=[];
        let dowsingReceipts=null;
        for(let step=0;step<60;step++){
          const prize=f.opponent.getPrizeLeft();
          if(prize===1)break;
          const pending=f.state.prompts.find(p=>p.result===undefined);
          if(pending?.constructor.name==='ChoosePrizePrompt'){
            assert.equal(pending.playerId,f.opponent.id);
            const choices=f.opponent.prizes.filter(slot=>slot.cards.length)
              .slice(0,pending.options.count);
            assert.equal(pending.validate(choices,f.state),true);
            f.store.dispatch(new ResolvePromptAction(pending.id,choices));
            prizeProgress.push(f.opponent.getPrizeLeft());
            continue;
          }
          if(prize===2&&!dowsingReceipts){
            assert.ok(!pending,'Dowsing dispatched at actual owner root');
            assert.equal(f.own.hand.cards.some(c=>c.name==='Damage Pump'),false);
            dowsingReceipts=playDowsing(f);
            nativeRoots.push({kind:'Dowsing real source Item and owner prompts'});
            continue;
          }
          const action=SimpleTacticsAi.prototype.decodeNextAction.call(actor,f.state);
          assert.ok(action,'No action selected for owner source');
          assert.ok(['PlayCardAction','ResolvePromptAction','UseAbilityAction']
            .includes(action.constructor.name),
            'Unexpected source fallback '+action.constructor.name);
          nativeRoots.push({kind:action.constructor.name,
            ownerPrizesBefore:prize});
          f.store.dispatch(action);
        }
        assert.ok(dowsingReceipts,'No real source Dowsing action');
        assert.deepEqual(prizeProgress,[4,2,1]);
        assert.equal(f.opponent.getPrizeLeft(),1);
        assert.equal(f.state.phase,GamePhase.PLAYER_TURN);
        const endIds=physical(f.own).map(card=>card.id).sort((a,b)=>a-b);
        assert.deepEqual(endIds,startingIds,'Rank26 all 60 physical IDs conserved');
        assert.equal(f.own.discard.cards.filter(c=>c.name==='Damage Pump').length,2);
        return {sourceSeat:seat,prizeProgress,dowsingReceipts,nativeRoots,
          printedSource60Conserved:true,realStoreDowsingRecoveredPump:true,
          reachedFifthSelfKO:true};
      }));
    return {...audit.result.result,
      pumpAudit:audit.policyAudit,
      propagationAudit:audit.result.policyAudit};
  }finally{restore();}
}
function run(){
  return {schema:'rank26-native-dowsing-two-Pump-2plus2plus1-staged-v1',
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    cases:[runSeat(0),runSeat(1)],
    originalRandomDeal:false,sourceCardInstancesConserved:true,
    firstTurnHandSearchAndAttackQualified:false,
    competitorPolicyQualified:false,competitiveGameQualified:false};
}
module.exports={stage,playDowsing,physical,runSeat,run};
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
