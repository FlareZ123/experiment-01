'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const {stagedRaichu} = require('./temple-raichu-board.cjs');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(output, name));

/** @returns {object} */
function evaluateBombTactic() {
  const f = stagedRaichu([], null);
  const {PokemonCardList} = load('game/store/state/pokemon-card-list');
  const {CardList} = load('game/store/state/card-list');
  const {PlayerType, SlotType} = load('game/store/actions/play-card-action');
  const {UseAbilityAction} = load('game/store/actions/game-actions');
  const {UseAbilityTactic} = load('simple-bot/simple-tactics/use-ability-tactic');
  const {StateScore} = load('simple-bot/state-score/state-score');
  const definitions = load('simple-bot/simple-bot-definitions');
  const {BotFlipMode, BotShuffleMode} = load('game/bots/bot-arbiter');
  const electrode = new PokemonCardList();
  electrode.cards.push(f.card('Electrode-GX CES'));
  f.a.bench.push(electrode);
  for (const player of [f.a,f.b]) {
    player.prizes = Array.from({length:6}, () => {
      const prize = new CardList();
      prize.cards.push(f.card('Psychic Energy SVE'));
      return prize;
    });
    player.deck.cards.push(f.card('Psychic Energy SVE'));
  }
  f.a.discard.cards.push(...[
    'Reversal Energy PAL','Counter Energy CIN','Unit Energy LPM UPR',
    'Reversal Energy PAL','Counter Energy CIN'
  ].map(f.card));
  const options = {
    tactics:definitions.allSimpleTactics,
    promptResolvers:definitions.allPromptResolvers,
    scores:definitions.defaultStateScores,
    arbiter:{flipMode:BotFlipMode.RANDOM,shuffleMode:BotShuffleMode.RANDOM}
  };
  const tactic = new UseAbilityTactic(options);
  const scorer = new StateScore(options);
  const before = scorer.getScore(f.state,101);
  const target = {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0};
  const simulated = tactic.simulateAction(f.state,
    new UseAbilityAction(101,'Extra Energy Bomb',target));
  assert.ok(simulated,'Pinned simulator must be able to resolve the Ability');
  const after = scorer.getScore(simulated,101);
  const recommended = tactic.useTactic(f.state,f.a);
  const result = {
    sourceRanks:[4,17],beforeScore:before,afterScore:after,
    scoreChange:after-before,
    stockUseAbilityTactic:recommended?.name ?? null,
    prizesBefore:f.b.getPrizeLeft(),
    simulatedPrizesAfter:simulated.players[1].getPrizeLeft()
  };
  console.log(JSON.stringify(result,null,2));
  assert.equal(result.stockUseAbilityTactic,null,
    'Stock heuristic declines Extra Energy Bomb on otherwise ready board');
  assert.ok(result.scoreChange < -1000,'Two-Prize penalty overwhelms Energy utility');
  return result;
}

/**
 * Source-specific theoretical Lightning provision after Bomb gives the opponent
 * two Prizes. This is a deliberately narrow tactical heuristic.
 * @param {any[]} energies
 * @returns {number}
 */
function projectedLightningUnits(energies) {
  return energies.slice(0,5).reduce((n,card)=>{
    if(card.fullName==='Reversal Energy PAL')return n+3;
    if(card.fullName==='Counter Energy CIN')return n+2;
    if(card.fullName==='Unit Energy LPM UPR')return n+1;
    return n;
  },0);
}


/**
 * Opt-in same-turn positive-Prize-response policy for the exact source
 * Raichu/Electrode payload. It uses public board state and own discard only.
 * @returns {Function} A pinned SimpleTactic subclass.
 */
function makeElectrodePrizeTradeTactic(){
  const {SimpleTactic}=load('simple-bot/simple-tactics/simple-tactics');
  const {UseAbilityAction}=load('game/store/actions/game-actions');
  const {PlayerType,SlotType}=load('game/store/actions/play-card-action');
  const {CardTag,SuperType}=load('game/store/card/card-types');
  const twoPrize=[CardTag.POKEMON_V,CardTag.POKEMON_GX,CardTag.POKEMON_EX,
    CardTag.POKEMON_ex,CardTag.POKEMON_VSTAR,CardTag.POKEMON_VMAX,
    CardTag.POKEMON_SV_MEGA,CardTag.TAG_TEAM];
  const sightEligible=[CardTag.POKEMON_V,CardTag.POKEMON_VMAX,
    CardTag.POKEMON_VSTAR,CardTag.POKEMON_GX,CardTag.TAG_TEAM];
  return class ElectrodePrizeTradeTactic extends SimpleTactic {
    useTactic(state,player){
      if(player.active.getPokemonCard()?.fullName!=='Alolan Raichu UNM')return;
      const opponent=state.players.find(p=>p.id!==player.id);
      if(!opponent||opponent.getPrizeLeft()<=2)return;
      if(player.getPrizeLeft()<=opponent.getPrizeLeft()-2)return;
      if(state.players.some(p=>p.stadium.cards.some(c=>c.name==='Temple of Sinnoh')))return;
      const energy=player.discard.cards.filter(c=>c.superType===SuperType.ENERGY).slice(0,5);
      if(energy.length<3||energy.some(c=>!['Reversal Energy PAL',
        'Counter Energy CIN','Unit Energy LPM UPR'].includes(c.fullName)))return;
      const base=projectedLightningUnits(energy)*30;
      if(base<180)return;
      const hasSight=player.active.tools.some(c=>c.fullName==='Telescopic Sight VIV');
      let immediateTwoPrizeKO=false;
      opponent.forEachPokemon(PlayerType.TOP_PLAYER,(list,card,target)=>{
        if(!twoPrize.some(tag=>card.hasTag(tag)))return;
        const bonus=hasSight&&target.slot===SlotType.BENCH&&
          sightEligible.some(tag=>card.hasTag(tag))?30:0;
        if(card.hp-list.damage<=base+bonus)immediateTwoPrizeKO=true;
      });
      if(!immediateTwoPrizeKO)return;
      for(let i=0;i<player.bench.length;i++){
        if(player.bench[i].getPokemonCard()?.fullName==='Electrode-GX CES'){
          return new UseAbilityAction(player.id,'Extra Energy Bomb',{
            player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:i
          });
        }
      }
    }
  };
}

/** Add the narrow projected two-Prize trade before ordinary attachments. */
function withElectrodePrizeTradePolicy(options){
  const index=options.tactics.findIndex(t=>t.name==='AttachEnergyTactic');
  if(index<0)throw Error('Expected upstream AttachEnergyTactic');
  return {...options,tactics:[
    ...options.tactics.slice(0,index),makeElectrodePrizeTradeTactic(),
    ...options.tactics.slice(index)
  ]};
}

if(require.main===module) evaluateBombTactic();
module.exports={evaluateBombTactic};
