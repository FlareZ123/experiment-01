'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('./agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('./headless.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUTPUT,name));
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const GHOLDENGO='Gholdengo 30C';
const GIMMIGHOUL='Gimmighoul 30C';
const ATTACK='Celebration';

/**
 * A properly chained evolved Gholdengo carrying one Metal Energy with an
 * artificial 29/30/31 card hand. Reuses a genuine compiled Store, original
 * native cards and prompts; deliberately stages a position instead of
 * claiming that a source-real 60 could reach it.
 *
 * @param {0|1} seat Store physical seat.
 * @param {29|30|31} handCount Exact original-owner current hand size.
 * @param {1|6} remainingPrizes Original-owner Prize count.
 * @returns {object} Original Store with public and private test assertions.
 */
function stageGholdengo(seat,handCount,remainingPrizes){
  const x=stage(seat),manager=initializeCards();
  let nextId=30000;
  const card=printing=>{
    const result=manager.getCardByName(printing);
    assert.ok(result,'Pinned card missing: '+printing);
    result.id=nextId++;
    return result;
  };
  x.owner.active.cards.length=0;
  x.owner.active.energies.cards.length=0;
  x.owner.active.cards.push(card(GIMMIGHOUL));
  x.owner.active.cards.push(card(GHOLDENGO));
  const energy=card('Metal Energy SVE');
  x.owner.active.cards.push(energy);
  x.owner.active.energies.cards.push(energy);
  x.owner.hand.cards.length=0;
  for(let i=0;i<handCount;i++)
    x.owner.hand.cards.push(card('Psychic Energy SVE'));
  x.owner.prizes.splice(remainingPrizes);
  assert.equal(x.owner.active.getPokemonCard()?.fullName,GHOLDENGO);
  assert.equal(x.owner.active.energies.cards.length,1);
  assert.equal(x.owner.hand.cards.length,handCount);
  assert.equal(x.owner.prizes.length,remainingPrizes);
  assert.equal(x.owner.deck.cards.length,8);
  return x;
}

/**
 * Resolve actual native Prize-choice prompts as the owner, in recorded
 * positional order; WaitPrompt is nondiscretionary. No bot or substitute
 * effects, and no artificial hand/Prize updates after the action.
 * @param {object} x Staged pinned native Store.
 * @returns {string[]} Actual prompt sequence.
 */
function settleAttackPrompts(x){
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const sequence=[];
  for(let i=0;i<32;i++){
    const pending=x.state.prompts.find(p=>p.result===undefined);
    if(!pending)return sequence;
    const name=pending.constructor.name;
    sequence.push(name);
    // Direct Store.dispatch receives the decoded native CardList objects.
    // Numeric [0,1] is only the outer client protocol for ChoosePrizePrompt.
    const result=name==='ChoosePrizePrompt'?
      x.owner.prizes.filter(prize=>prize.cards.length>0).slice(0,2):
      name==='ShuffleDeckPrompt'?
        x.owner.deck.cards.map((_,index)=>index):
      name==='WaitPrompt'?null:undefined;
    assert.notEqual(result,undefined,
      'Unknown native prompt requires owner-specific policy: '+name);
    x.store.dispatch(new ResolvePromptAction(pending.id,result));
  }
  assert.fail('Native Gholdengo prompt resolution exceeded 32 actions');
}

/**
 * An exact original-Store printed-effect mechanism test, not a reachable
 * player-turn probability, a legal 60, or a qualified competitive match.
 *
 * @param {0|1} seat
 * @param {29|30|31} handCount
 * @param {1|6} remainingPrizes
 */
function runCase(seat,handCount,remainingPrizes){
  const x=stageGholdengo(seat,handCount,remainingPrizes);
  const {AttackAction}=native('game/store/actions/game-actions');
  const ownerBefore={
    hand:x.owner.hand.cards.length,
    deck:x.owner.deck.cards.length,
    prizes:x.owner.prizes.filter(p=>p.cards.length>0).length,
    prizesTaken:x.owner.prizesTaken,
    turn:x.state.turn,seat
  };
  const error=[];
  let prompts=[];
  try{
    x.store.dispatch(new AttackAction(x.owner.id,ATTACK));
    prompts=settleAttackPrompts(x);
  }catch(e){
    error.push(String(e?.stack??e));
  }
  const ownerAfter={
    hand:x.owner.hand.cards.length,
    deck:x.owner.deck.cards.length,
    prizes:x.owner.prizes.filter(p=>p.cards.length>0).length,
    prizesTaken:x.owner.prizesTaken,
    turn:x.state.turn,seat,
    winner:x.state.winner?.id??x.state.winner??null
  };
  return {seat,handCount,remainingPrizes,
    ownerBefore,ownerAfter,prompts,error,
    attackAccepted:error.length===0,
    prizesTakenDelta:ownerBefore.prizes-ownerAfter.prizes,
    handShuffledIntoDeck:ownerAfter.hand===0&&
      ownerAfter.deck-ownerBefore.deck===handCount+
      ownerBefore.prizes-ownerAfter.prizes,
    qualifiedCompetitiveGame:false};
}

function runAudit(){
  const rows=[];
  for(const seat of [0,1]){
    for(const handCount of [29,30,31])
      rows.push(runCase(seat,handCount,6));
    rows.push(runCase(seat,30,1));
  }
  for(const x of rows){
    assert.equal(x.error.length,0,
      'Pinned native Celebration failed at '+JSON.stringify({
        seat:x.seat,handCount:x.handCount,remainingPrizes:x.remainingPrizes,
        ownerBefore:x.ownerBefore,ownerAfter:x.ownerAfter,
        prompts:x.prompts,error:x.error}));
    const eligible=x.handCount===30;
    const prizes=eligible?Math.min(2,x.remainingPrizes):0;
    assert.equal(x.prizesTakenDelta,prizes);
    assert.equal(x.ownerAfter.hand,eligible?0:x.handCount);
    assert.equal(x.ownerAfter.deck,
      x.ownerBefore.deck+(eligible?x.handCount+prizes:0));
    assert.equal(x.ownerAfter.prizes,x.remainingPrizes-prizes);
    if(eligible&&x.remainingPrizes>2)
      assert.ok(x.prompts.includes('ChoosePrizePrompt'),
        'Nonfinal two-Prize choice should be a real native owner prompt');
    if(!eligible)
      assert.ok(!x.prompts.includes('ChoosePrizePrompt'));
  }
  return {schema:'agent34-gholdengo-30c-native-prize-effect-v1',
    pin:PIN,print:GHOLDENGO,attack:ATTACK,
    seats:[0,1],cases:rows.length,
    eligibleCases:rows.filter(x=>x.handCount===30).length,
    directPrizeTransfers:rows.reduce((a,x)=>a+x.prizesTakenDelta,0),
    noQualificationViolations:true,
    qualifiedCompetitiveGames:0,
    caveat:'Staged original Store effects only, with artificial 29/30/31-card hand; not a source-real evolution, 60-card draw process, actual game outcome, or matchup policy.',
    rows};
}

if(require.main===module)
  process.stdout.write(JSON.stringify(runAudit(),null,2)+'\n');
module.exports={stageGholdengo,settleAttackPrompts,runCase,runAudit};
