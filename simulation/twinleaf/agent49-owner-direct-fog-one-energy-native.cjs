'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const roster=require('../../results/aichi-2026/full-decklists.json');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {proposeOwnerDirectFogOneEnergyKo}=
  require('./agent49-owner-direct-fog-one-energy-reply.cjs');
const {stagedPainfulSpoons}=
  require('./agent4-rank31-alakazam-movesource-native.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUTPUT,name));
const FOG='Fog Crystal CRE';
const UNOWN='Unown AOR';
const BASIC_PAPER='Psychic Energy MEE 13';
const BASIC_NATIVE='Psychic Energy MEE';
const TARGET='Trubbish FST';

/**
 * Expand the authenticated rank31 source list into exact English paper
 * printing names, matching the K0 representation used by the pure planner.
 *
 * @returns {string[]}
 */
function rank31Original60(){
  const deck=roster.decks.find(row=>row.rank===31);
  assert.ok(deck,'Authenticated rank31 source deck must exist');
  return deck.cards.flatMap(row=>Array.from({length:row.count},()=>(
    row.name+' '+row.printing.set+
    (row.category==='Energy'&&row.printing.number?
      ' '+row.printing.number:'')
  )));
}

/**
 * Execute the rank31 direct-Fog/Unown line in a staged pinned-Twinleaf Store.
 *
 * The K0 input is the exact registered rank31 60. The native fixture contains
 * only the relevant physical printings and a synthetic Prize/bench state; it
 * is deliberately not represented as a full-deck deal or competitive game.
 *
 * @param {0|1} [seat=0] Physical seat occupied by the rank31 owner.
 * @returns {object} Reproducible native prompt, attachment, attack and Prize evidence.
 */
function probeRank31DirectFogOneEnergy(seat=0){
  assert.ok(seat===0||seat===1,'seat must be physical seat 0 or 1');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const {AttackAction}=native('game/store/actions/game-actions');

  const f=stagedPainfulSpoons(seat);
  const {source,opponent,store,state}=f;
  assert.equal(state.activePlayer,seat);
  assert.ok(state.turn>1);

  const original60=rank31Original60();
  const source60Counts={
    fogCrystal:original60.filter(name=>name===FOG).length,
    unown:original60.filter(name=>name===UNOWN).length,
    basicPsychic:original60.filter(name=>name===BASIC_PAPER).length,
    secretBox:original60.filter(name=>name==='Secret Box TWM').length
  };
  assert.equal(original60.length,60);
  assert.deepEqual(source60Counts,{
    fogCrystal:4,unown:3,basicPsychic:2,secretBox:0
  });
  const source60Sha256=createHash('sha256')
    .update(JSON.stringify(original60)).digest('hex');

  const activeUnown=f.card(UNOWN);
  const fog=f.card(FOG);
  const deckFog=Array.from({length:3},()=>f.card(FOG));
  const deckUnown=Array.from({length:2},()=>f.card(UNOWN));
  const deckBasic=Array.from({length:2},()=>f.card(BASIC_NATIVE));
  const target=f.card(TARGET);
  assert.equal(Number(target.hp),70);

  source.active.cards.splice(0,source.active.cards.length,activeUnown);
  source.active.damage=0;
  source.active.energies.cards.splice(0,source.active.energies.cards.length);
  source.hand.cards.splice(0,source.hand.cards.length,fog);
  const relevantDeck=[...deckFog,...deckUnown,...deckBasic];
  source.deck.cards.splice(0,source.deck.cards.length,...relevantDeck);

  opponent.active.cards.splice(0,opponent.active.cards.length,target);
  opponent.active.damage=60;
  opponent.active.energies.cards.splice(0,opponent.active.energies.cards.length);

  const view=actorObservation(state,seat);
  const plan=proposeOwnerDirectFogOneEnergyKo(view,original60);
  assert.ok(plan,'rank31 K0 plus live owner observation must admit direct Fog line');
  assert.equal(plan.kind,'owner-direct-fog-one-energy-ko');
  assert.equal(plan.sourcePrinting,UNOWN);
  assert.equal(plan.fogCrystal,FOG);
  assert.equal(plan.attackName,'Hidden Power');
  assert.equal(plan.damage,10);
  assert.equal(plan.remainingHp,10);
  assert.ok(plan.basicEnergyPrintings.includes(BASIC_PAPER));

  const pending=()=>state.prompts.find(prompt=>prompt.result===undefined);
  const fogTrace=[];
  const deckBefore=source.deck.cards.length;
  const fogIndex=source.hand.cards.indexOf(fog);
  store.dispatch(new PlayCardAction(source.id,fogIndex,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  const fogPrompt=pending();
  assert.equal(fogPrompt?.constructor?.name,'ChooseCardsPrompt');
  assert.equal(fogPrompt.sourceCard?.fullName,FOG);
  assert.equal(fogPrompt.playerId,source.id);
  assert.equal(fogPrompt.message,'CHOOSE_CARD_TO_HAND');
  assert.equal(fogPrompt.cards,source.deck);
  const offeredBasics=fogPrompt.cards.cards.filter(
    card=>card.fullName===BASIC_NATIVE);
  assert.equal(offeredBasics.length,2);
  const basic=offeredBasics[0];
  assert.equal(fogPrompt.validate([basic],state),true);
  store.dispatch(new ResolvePromptAction(fogPrompt.id,[basic]));
  fogTrace.push('ChooseCardsPrompt');

  for(let i=0;i<15;i++){
    const prompt=pending();
    if(!prompt)break;
    let answer;
    if(prompt.constructor.name==='ShowCardsPrompt')answer=true;
    else if(prompt.constructor.name==='ShuffleDeckPrompt')
      answer=source.deck.cards.map((_,index)=>index);
    else if(prompt.constructor.name==='WaitPrompt')answer=null;
    else throw new Error('Unexpected Fog Crystal prompt '+prompt.constructor.name);
    fogTrace.push(prompt.constructor.name);
    store.dispatch(new ResolvePromptAction(prompt.id,answer));
  }
  assert.equal(pending(),undefined,'Fog Crystal search tail must settle');
  assert.equal(source.hand.cards.includes(basic),true);
  assert.equal(source.deck.cards.includes(basic),false);
  assert.equal(source.deck.cards.length,deckBefore-1);
  assert.equal(source.discard.cards.includes(fog),true);
  assert.equal(proposeOwnerDirectFogOneEnergyKo(
    actorObservation(state,seat),original60),null,
    'spent Fog Crystal must no longer be proposed');

  const energyIndex=source.hand.cards.indexOf(basic);
  store.dispatch(new PlayCardAction(source.id,energyIndex,{
    player:PlayerType.ANY,slot:SlotType.ACTIVE,index:0
  }));
  assert.equal(source.active.energies.cards.includes(basic),true);
  assert.equal(source.hand.cards.includes(basic),false);
  assert.equal(proposeOwnerDirectFogOneEnergyKo(
    actorObservation(state,seat),original60),null,
    'attached Basic Psychic must close the one-energy plan');

  const sourcePrizesBefore=source.prizes.filter(prize=>prize.cards.length>0).length;
  const opponentPrizesBefore=opponent.prizes.filter(prize=>prize.cards.length>0).length;
  assert.equal(sourcePrizesBefore,6);
  assert.equal(opponentPrizesBefore,6);
  const promotedSlot=opponent.bench.find(slot=>slot.getPokemonCard());
  assert.ok(promotedSlot,'staged opponent must have a physical Bench Pokémon');
  const promotedCard=promotedSlot.getPokemonCard();
  const attackTrace=[];
  let prizePromptSeen=false;
  let promotionPromptSeen=false;

  store.dispatch(new AttackAction(source.id,'Hidden Power'));
  for(let i=0;i<25;i++){
    const prompt=pending();
    if(!prompt)break;
    const kind=prompt.constructor.name;
    let answer;
    if(kind==='WaitPrompt')answer=null;
    else if(kind==='ShowCardsPrompt')answer=true;
    else if(kind==='ChoosePrizePrompt'&&prompt.playerId===source.id){
      const firstPrize=source.prizes.find(prize=>prize.cards.length>0);
      assert.ok(firstPrize,'source must have a physical Prize to take');
      assert.equal(prompt.validate([firstPrize],state),true);
      answer=[firstPrize];
      prizePromptSeen=true;
    }else if(kind==='ChoosePokemonPrompt'&&prompt.playerId===opponent.id){
      assert.equal(prompt.validate([promotedSlot],state),true);
      answer=[promotedSlot];
      promotionPromptSeen=true;
    }else{
      throw new Error('Unexpected Hidden Power settlement prompt '+kind+
        ' for player '+prompt.playerId);
    }
    attackTrace.push(kind);
    store.dispatch(new ResolvePromptAction(prompt.id,answer));
  }

  assert.equal(pending(),undefined,'Hidden Power Prize and promotion must settle');
  assert.equal(prizePromptSeen,true);
  assert.equal(promotionPromptSeen,true);
  assert.equal(opponent.discard.cards.includes(target),true);
  assert.equal(source.active.getPokemonCard().fullName,UNOWN);
  assert.equal(source.active.energies.cards.includes(basic),true);
  assert.equal(source.discard.cards.includes(fog),true);
  assert.equal(opponent.active.getPokemonCard().fullName,promotedCard.fullName);
  const sourcePrizesAfter=source.prizes.filter(prize=>prize.cards.length>0).length;
  const opponentPrizesAfter=opponent.prizes.filter(prize=>prize.cards.length>0).length;
  assert.equal(sourcePrizesAfter,5);
  assert.equal(opponentPrizesAfter,6);

  return {
    version:'agent49-rank31-direct-fog-one-energy-native-v1',
    seat,sourceId:source.id,opponentId:opponent.id,
    source60K0:true,source60Count:original60.length,source60Sha256,
    source60Counts,sourceDeckPhysicalSubset:true,
    sourceDeckPhysicalComplete:false,opponentDeckPhysicalComplete:false,
    sourceDeckBefore:deckBefore,sourceDeckAfter:source.deck.cards.length,
    sourceHandBefore:1,sourceHandAfter:source.hand.cards.length,
    sourcePrinting:UNOWN,targetPrinting:TARGET,targetHp:70,
    targetDamageBefore:60,targetRemainingHpBeforeAttack:10,
    fogPromptOwner:true,fogPromptDeckBound:true,
    fogPromptSource:FOG,fogPromptMessage:'CHOOSE_CARD_TO_HAND',
    offeredBasicPhysicalCount:offeredBasics.length,
    paperBasicPrinting:BASIC_PAPER,nativeBasicPrinting:basic.fullName,
    basicPhysicallyAttached:source.active.energies.cards.includes(basic),
    fogPhysicallyDiscarded:source.discard.cards.includes(fog),
    attackName:'Hidden Power',printedAttackDamage:10,
    attackAccepted:true,targetKnockedOut:opponent.discard.cards.includes(target),
    sourcePrizeCountBefore:sourcePrizesBefore,
    sourcePrizeCountAfter:sourcePrizesAfter,
    opponentPrizeCountBefore:opponentPrizesBefore,
    opponentPrizeCountAfter:opponentPrizesAfter,
    opponentPromotedPrinting:promotedCard.fullName,
    fogPromptTrace:fogTrace,attackPromptTrace:attackTrace,
    qualifiedGame:false,competitiveResult:false
  };
}

module.exports={rank31Original60,probeRank31DirectFogOneEnergy};
