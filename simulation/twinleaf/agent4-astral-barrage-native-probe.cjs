'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {withPaperAstralBarrageTargets}=
  require('./agent4-astral-barrage-active-target-hook.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath @returns {any} */
const native=modulePath=>require(path.join(output,modulePath));

/**
 * Genuine Store initial state, with exact CRE74 source printing and three
 * real attached Psychic Energy cards. Opponent has one Active and 0..2 Bench
 * Pokémon. Not a full original 60 deal or competitive opponent policy.
 * @param {0|1|2} benchCount
 * @returns {object}
 */
function stagedAstralBarrage(benchCount){
  assert.ok([0,1,2].includes(benchCount));
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {CardList}=native('game/store/state/card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const a=new Player(),b=new Player();
  a.id=141;b.id=282;
  state.players=[a,b];
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=3;
  state.activePlayer=0;
  state.gameSettings.format=Format.EXPANDED;
  let id=10000;
  /** @param {string} name @returns {any} */
  const card=name=>{
    const instance=manager.getCardByName(name);
    assert.ok(instance,'Missing pinned printing '+name);
    instance.id=id++;
    return instance;
  };
  a.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  b.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  for(let i=0;i<3;i++){
    const energy=card('Psychic Energy SVE');
    a.active.cards.push(energy);
    a.active.energies.cards.push(energy);
  }
  for(const player of state.players){
    for(let i=0;i<5;i++)player.bench.push(new PokemonCardList());
    for(let i=0;i<7;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  for(let i=0;i<benchCount;i++){
    b.bench[i].cards.push(card('Shadow Rider Calyrex V CRE'));
  }
  return {store,state,a,b,benchCount};
}

/**
 * Use the actual pinned Store attack and native ChoosePokemonPrompt reply,
 * observing original vs optionally corrected effects with identical fixture.
 * @param {{benchCount:0|1|2,corrected:boolean}} cfg
 * @returns {object}
 */
function runAstralBarrageNative(cfg){
  const {AttackAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const f=stagedAstralBarrage(cfg.benchCount);
  const observe=()=>{
    f.store.dispatch(new AttackAction(f.a.id,'Astral Barrage'));
    // Native Store also holds an unrelated opposing-player WaitPrompt.
    // Select only the attack's actual owner ChoosePokemonPrompt.
    const prompt=f.state.prompts.find(p=>p.result===undefined&&
      p.constructor.name==='ChoosePokemonPrompt');
    const available=[f.b.active,...f.b.bench.filter(s=>s.cards.length>0)];
    const proof=prompt?{
      type:prompt.constructor.name,
      min:prompt.options.min,max:prompt.options.max,
      allowedActive:prompt.slots.includes(
        native('game/store/actions/play-card-action').SlotType.ACTIVE)
    }:null;
    if(prompt){
      assert.equal(prompt.constructor.name,'ChoosePokemonPrompt');
      const targets=available.slice(0,prompt.options.max);
      assert.equal(prompt.validate(targets,f.state),true);
      f.store.dispatch(new ResolvePromptAction(prompt.id,targets));
    }
    return {
      benchCount:cfg.benchCount,corrected:cfg.corrected,
      sourceAttack:'Shadow Rider Calyrex V CRE: Astral Barrage',
      availableOpponentPokemon:available.length,
      nativePrompt:proof,
      targetDamage:[f.b.active.damage,...f.b.bench.slice(0,cfg.benchCount)
        .map(s=>s.damage)],
      pendingPrompts:f.state.prompts.filter(p=>p.result===undefined)
        .map(p=>p.constructor.name)
    };
  };
  return cfg.corrected?withPaperAstralBarrageTargets(observe):observe();
}

function run(){
  const paired=[0,1,2].map(benchCount=>({
    original:runAstralBarrageNative({benchCount,corrected:false}),
    corrected:runAstralBarrageNative({benchCount,corrected:true})
  }));
  const out={
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    source:'Authenticated Aichi rank1 CRE74, staged paper-legal attack cost',
    classification:'Staged native card-fidelity differential, no source-dealt game',
    paired
  };
  console.log(JSON.stringify(out,null,2));
  return out;
}
if(require.main===module)run();
module.exports={stagedAstralBarrage,runAstralBarrageNative,run};
