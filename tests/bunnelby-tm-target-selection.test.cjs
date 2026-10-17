'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {stage}=require('../simulation/twinleaf/bunnelby-k0-action-contrast.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {resolveManifestFile}=require('../simulation/twinleaf/resolve-field.cjs');
const {hasK0PossibleStageFor,withBunnelbyEvolutionLine}=
  require('../simulation/twinleaf/bunnelby-evolution-policy.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const engine=p=>require(path.join(output,p));

function printedRank2() {
  const manifest=resolveManifestFile(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),
    {allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const rank2=manifest.decks.find(x=>x.rank===2);
  assert.ok(rank2?.playableUnderEngine);
  const manager=initializeCards();
  return rank2.cardIds.map(name=>manager.getCardByName(name));
}

function fixture(hiddenGloom=false) {
  const result=stage(hiddenGloom);
  const manager=initializeCards();
  const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
  for(const name of ['Pidgey MEW','Fan Rotom SCR','Relicanth TEF']) {
    const slot=new PokemonCardList();
    const card=manager.getCardByName(name);
    assert.ok(card,name);
    slot.cards.push(card);
    result.a.bench.push(slot);
  }
  const {GamePhase}=engine('game/store/state/state');
  result.state.phase=GamePhase.ATTACK;
  return result;
}

function selections(context,source) {
  const {ChoosePokemonPrompt}=engine('game/store/prompts/choose-pokemon-prompt');
  const {PlayerType,SlotType}=engine('game/store/actions/play-card-action');
  const {GameMessage}=engine('game/game-message');
  const definitions=engine('simple-bot/simple-bot-definitions');
  const {ChoosePokemonPromptResolver}=engine(
    'simple-bot/prompt-resolver/choose-pokemon-prompt-resolver');
  const opts={tactics:definitions.allSimpleTactics,
    promptResolvers:definitions.allPromptResolvers,
    scores:definitions.defaultStateScores,
    arbiter:definitions.defaultArbiterOptions};
  const prompt=new ChoosePokemonPrompt(context.a.id,
    GameMessage.CHOOSE_POKEMON_TO_EVOLVE,
    PlayerType.BOTTOM_PLAYER,[SlotType.BENCH],
    {min:1,max:2,allowCancel:false,blocked:[]});
  const defaultAction=new ChoosePokemonPromptResolver(opts)
    .resolvePrompt(context.state,context.a,prompt);
  const guardedOpts=withBunnelbyEvolutionLine(opts,{
    sourceCards:source,targetAwareEvolution:true});
  const Target=guardedOpts.promptResolvers.find(cls=>
    cls.name==='BunnelbyStageTargetResolver');
  assert.ok(Target,'Opt-in Stage target resolver was not installed');
  const targetAction=new Target(guardedOpts)
    .resolvePrompt(context.state,context.a,prompt);
  assert.ok(defaultAction?.result && targetAction?.result);
  return {
    defaultNames:defaultAction.result.map(slot=>slot.getPokemonCard().fullName),
    selectedNames:targetAction.result.map(slot=>slot.getPokemonCard().fullName)
  };
}

test('generic TM Evolution prompt selects high-score non-evolving Basics',()=>{
  const context=fixture();
  const source=printedRank2();
  const choices=selections(context,source);
  assert.deepEqual(choices.defaultNames,['Fan Rotom SCR','Relicanth TEF']);
  assert.deepEqual(choices.selectedNames,['Oddish UNB','Pidgey MEW']);
});

test('K0 source target selection is unchanged across hidden Gloom Prize layouts',()=>{
  const source=printedRank2();
  const accessible=fixture(false),prized=fixture(true);
  assert.equal(hasK0PossibleStageFor(accessible.a,source,'Oddish'),true);
  assert.equal(hasK0PossibleStageFor(prized.a,source,'Oddish'),true);
  assert.deepEqual(selections(accessible,source).selectedNames,
    selections(prized,source).selectedNames);
});

test('target filtering requires source-60 information',()=>{
  const definitions=engine('simple-bot/simple-bot-definitions');
  assert.throws(()=>withBunnelbyEvolutionLine({
    tactics:definitions.allSimpleTactics,
    promptResolvers:definitions.allPromptResolvers
  },{targetAwareEvolution:true}),/known physical source 60/);
});
