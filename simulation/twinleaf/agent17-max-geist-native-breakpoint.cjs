'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {stagedRaichu} = require('./temple-raichu-board.cjs');
const {actorObservation} = require('./actor-observation-contract.cjs');
const {chooseActorRootIntent} = require('./agent34-actor-only-root-policy.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const load = name => require(path.join(output, name));
const PINNED = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * A genuine Store action test of a single synthetic turn, from the original
 * rank-1 CRE-75 / Basic Psychic card printings. Initial evolution stack,
 * opposing damage, Energy ownership and both players' Prizes are deliberately
 * constructed. No natural draw, complete game or opponent policy is inferred.
 *
 * @param {boolean} beforeAttackAttachment Root policy treatment flag.
 * @returns {object} Actual typed Store actions and post-prompt Prize witness.
 */
function runMaxGeistNativeBreakpoint(beforeAttackAttachment) {
  const fixture = stagedRaichu([], null);
  const {PokemonCardList} = load('game/store/state/pokemon-card-list');
  const {CardList} = load('game/store/state/card-list');
  const {CardType,SpecialCondition} = load('game/store/card/card-types');
  assert.equal(CardType.COLORLESS,9,'Pinned native Colorless enum drift');
  assert.equal(CardType.PSYCHIC,5,'Pinned native Psychic enum drift');
  const {PlayCardAction,PlayerType,SlotType} =
    load('game/store/actions/play-card-action');
  const {AttackAction} = load('game/store/actions/game-actions');
  const {ResolvePromptAction} =
    load('game/store/actions/resolve-prompt-action');

  const {state,store,a,b,card} = fixture;
  const v=card('Shadow Rider Calyrex V CRE');
  const vmax=card('Shadow Rider Calyrex VMAX CRE');
  assert.equal(vmax.attacks.find(attack => attack.name==='Max Geist')?.damage,10);
  const regidrago=card('Regidrago V SIT');
  assert.equal(regidrago.hp,220);

  // A proper two-card evolution stack is deliberately staged; this is not
  // evidence that an unmodified source-rank1 opener could assemble it.
  v.id=17001;vmax.id=17002;regidrago.id=17003;
  a.active.cards.splice(0,a.active.cards.length,v,vmax);
  b.active.cards.splice(0,b.active.cards.length,regidrago);
  b.active.damage=90;
  const nextActive = new PokemonCardList();
  const reserve = card('Regidrago V SIT');
  reserve.id=17004;
  nextActive.cards.push(reserve);
  b.bench.push(nextActive);

  const attached=Array.from({length:3},(_,i)=>{
    const energy=card('Psychic Energy MEE');
    energy.id=17005+i;
    a.active.cards.push(energy);
    a.active.energies.cards.push(energy);
    return energy;
  });
  const held=card('Psychic Energy MEE');
  // The source 60 specifies MEE 013 (art variation); pinned Twinleaf has
  // MEE 005 for the same unrestricted Basic Psychic Energy effect.
  const manifest=require('../../results/aichi-2026/full-decklists.json');
  const rank1=manifest.decks.find(deck=>deck.rank===1);
  const sourceBasic=rank1.cards.find(row=>
    row.name==='Psychic Energy'&&row.printing.set==='MEE');
  assert.equal(sourceBasic.count,11);
  assert.equal(sourceBasic.printing.number,'13');
  assert.equal(held.set,'MEE');
  assert.equal(held.setNumber,'5');
  assert.equal(held.name,'Psychic Energy');
  held.id=17008;
  a.hand.cards.push(held);

  for(const owner of [a,b]){
    owner.prizes=Array.from({length:6},()=>{
      const slot=new CardList();
      slot.cards.push(card('Psychic Energy SVE'));
      return slot;
    });
    owner.deck.cards.push(card('Psychic Energy SVE'));
  }
  const catalog={
    basics:new Set(),abilityBasics:new Set(),
    basicEnergies:new Set(['Psychic Energy MEE']),
    colorlessEnergyType:CardType.COLORLESS,
    basicEnergyTypes:{
      Grass:CardType.GRASS,Fire:CardType.FIRE,Water:CardType.WATER,
      Lightning:CardType.LIGHTNING,Psychic:CardType.PSYCHIC,
      Fighting:CardType.FIGHTING,Darkness:CardType.DARK,
      Metal:CardType.METAL,Fairy:CardType.FAIRY
    },
    specialConditions:{
      ASLEEP:SpecialCondition.ASLEEP,
      PARALYZED:SpecialCondition.PARALYZED
    }
  };
  const options={
    energyRecipientFrontier:true,
    printedScalingBasicKoBeforeAttack:beforeAttackAttachment
  };
  const first=chooseActorRootIntent(actorObservation(state,0),catalog,options);
  assert.equal(first.kind,beforeAttackAttachment?'attach-basic-energy':'attack');
  if(beforeAttackAttachment){
    assert.equal(first.printing,'Psychic Energy MEE');
    assert.equal(first.slot,'active');
    assert.equal(first.index,0);
    assert.equal(a.hand.cards[first.handIndex],held);
    store.dispatch(new PlayCardAction(101,first.handIndex,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    assert.equal(a.active.energies.cards.includes(held),true);
    assert.equal(a.hand.cards.includes(held),false);
    assert.equal(a.energyPlayedTurn,state.turn);
  }
  const attack=chooseActorRootIntent(actorObservation(state,0),catalog,options);
  assert.deepEqual(attack,{kind:'attack',attackName:'Max Geist'});
  const beforePrizes=a.getPrizeLeft();
  store.dispatch(new AttackAction(101,attack.attackName));

  const promptTypes=[];
  for(let i=0;i<35;i++){
    const prompt=state.prompts.find(row=>row.result===undefined);
    if(!prompt)break;
    const type=prompt.constructor.name;
    let chosen;
    if(type==='WaitPrompt')chosen=null;
    else if(type==='ChoosePokemonPrompt'){
      assert.equal(prompt.playerId,b.id);
      chosen=[b.bench.find(slot=>slot.getPokemonCard()===reserve)];
    }else if(type==='ChoosePrizePrompt'){
      chosen=a.prizes.filter(slot=>slot.cards.length)
        .slice(0,prompt.options.count);
    }else throw Error('Unexpected Max Geist native prompt '+type);
    assert.equal(prompt.validate(chosen,state),true,'Invalid '+type);
    promptTypes.push(type);
    store.dispatch(new ResolvePromptAction(prompt.id,chosen));
  }
  assert.equal(state.prompts.some(prompt=>prompt.result===undefined),false);
  const opponentKO=b.discard.cards.includes(regidrago);
  const prizesTaken=beforePrizes-a.getPrizeLeft();
  assert.equal(opponentKO,beforeAttackAttachment);
  assert.equal(prizesTaken,beforeAttackAttachment?2:0);
  if(!beforeAttackAttachment)
    assert.equal(b.active.damage,190);
  assert.equal(b.active.getPokemonCard()?.fullName,
    beforeAttackAttachment?reserve.fullName:regidrago.fullName);

  return {
    beforeAttackAttachment,pinnedTwinleaf:PINNED,
    energyPrintProxy:{originalSet:'MEE',originalNumber:'13',
      pinnedSet:held.set,pinnedNumber:held.setNumber,
      ordinaryBasicPsychicEquivalent:true,exactPrintingPreserved:false},
    firstRoot:first.kind,firstPrinting:first.printing??null,
    nativeAttachmentAccepted:beforeAttackAttachment,
    psychicCardsOnAttackBoard:attached.length+Number(beforeAttackAttachment),
    attackName:attack.attackName,opponentRegidragoKO:opponentKO,
    prizesTaken,opponentActiveAfter:b.active.getPokemonCard()?.fullName??null,
    promptTypes,competitiveGameQualified:false,
    witness:'staged evolution/hand/energy/opponent damage; actual Store actions'
  };
}

/** @returns {object} Same artificial starting state, native control/treatment. */
function verify(){
  const control=runMaxGeistNativeBreakpoint(false);
  const treatment=runMaxGeistNativeBreakpoint(true);
  const result={control,treatment,pinnedTwinleaf:PINNED,
    originalSourceRank:1,competitiveQualifiedGames:0,
    scope:'single constructed board, source printings, genuine Store attachment/attack/Prize'};
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)verify();
module.exports={runMaxGeistNativeBreakpoint,verify};
