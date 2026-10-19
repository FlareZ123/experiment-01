'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {withBilateralCommonCandidatePolicy}=require(
  '../simulation/evaluation/agent41-bilateral-common-policy.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const engine=name=>require(path.join(output,name));

/**
 * Exercise the actual three-layer bilateral candidate wrapper against a real
 * pinned Store. This covers the composed bot decision chain, beyond testing
 * its Field Blower helpers in isolation. No source-dealt competitive claim.
 *
 * @param {0|1} candidateSeat Actual candidate player slot.
 * @returns {object}
 */
function exercise(candidateSeat){
  const manager=initializeCards();
  let nextId=0;
  const card=name=>{
    const instance=manager.getCardByName(name);
    assert.ok(instance,'Missing '+name);
    instance.id=++nextId;
    return instance;
  };
  const {Store}=engine('game/store/store');
  const {Player}=engine('game/store/state/player');
  const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
  const {CardList}=engine('game/store/state/card-list');
  const {GamePhase}=engine('game/store/state/state');
  const {Format}=engine('game/store/card/card-types');
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {IS_ABILITY_BLOCKED}=engine('game/store/prefabs/prefabs');
  const {StateUtils}=engine('game/store/state-utils');
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const owner=new Player();
  const opponent=new Player();
  owner.id=candidateSeat===0?101:202;
  opponent.id=candidateSeat===0?202:101;
  owner.name='candidate';
  opponent.name='source';
  state.players=candidateSeat===0?[owner,opponent]:[opponent,owner];
  state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=candidateSeat;
  state.turn=4;
  state.gameSettings.format=Format.EXPANDED;
  const mew=card('Mewtwo & Mew-GX UNM');
  owner.active.cards.push(mew);
  opponent.active.cards.push(card('Trubbish FST'),card('Garbodor LTR'));
  const bench=new PokemonCardList();
  bench.cards.push(card('Trubbish FST'),card('Garbodor BKP'));
  opponent.bench.push(bench);
  const tools=[card('Float Stone BKT'),card('Float Stone BKT')];
  opponent.active.tools.push(tools[0]);
  bench.tools.push(tools[1]);
  const stadium=card('Sky Field ROS');
  owner.stadium.cards.push(stadium);
  const blower=card('Field Blower GRI');
  owner.hand.cards.push(blower);
  for(const player of state.players){
    player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const pile=new CardList();
      pile.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(pile);
    }
  }
  const power=mew.powers.find(x=>x.name==='Perfection');
  assert.ok(power);
  const blocked=()=>IS_ABILITY_BLOCKED(store,state,owner,mew,power);
  assert.equal(blocked(),true);

  const ai=new SimpleTacticsAi({id:owner.id},
    {tactics:[],promptResolvers:[]},null);
  const wrapped=withBilateralCommonCandidatePolicy(candidateSeat,()=>{
    const selected=ai.decodeNextAction(state);
    assert.equal(selected?.constructor.name,'PlayCardAction');
    store.dispatch(selected);
    const option=state.prompts.find(p=>p.result===undefined);
    assert.equal(option?.constructor.name,'SelectOptionPrompt');
    const resolvedOption=ai.decodeNextAction(state);
    assert.equal(resolvedOption?.constructor.name,'ResolvePromptAction');
    assert.equal(resolvedOption.id,option.id);
    assert.equal(resolvedOption.result,1,'Must remove both Tools, not Stadium');
    store.dispatch(resolvedOption);

    const targetPrompt=state.prompts.find(p=>p.result===undefined);
    assert.equal(targetPrompt?.constructor.name,'ChoosePokemonPrompt');
    const resolvedTargets=ai.decodeNextAction(state);
    assert.equal(resolvedTargets?.constructor.name,'ResolvePromptAction');
    assert.equal(resolvedTargets.id,targetPrompt.id);
    assert.deepEqual(resolvedTargets.result,[opponent.active,bench]);
    store.dispatch(resolvedTargets);
    assert.equal(state.prompts.find(p=>p.result===undefined),undefined);
    assert.equal(blocked(),false);
    assert.equal(StateUtils.getStadiumCard(state),stadium);
    assert.ok(owner.discard.cards.some(x=>x.id===blower.id));
    assert.equal(tools.filter(tool=>
      opponent.discard.cards.some(x=>x.id===tool.id)).length,2);
    return {item: selected.constructor.name, option:resolvedOption.result,
      targets:resolvedTargets.result.map(s=>s.getPokemonCard().fullName)};
  });
  assert.equal(wrapped.policyAudit.components.fieldBlower
    .opportunitySelections,1);
  assert.equal(wrapped.policyAudit.components.fieldBlower
    .confirmedToolRemovals,0,
    'No third bot decision requested: post-action audit is deferred');
  assert.equal(wrapped.policyAudit.qualification.hiddenInformationSafe,false);
  return wrapped.result;
}

test('bilateral composed owner bot clears both Garbotoxin Tools, seat 0',()=>{
  assert.deepEqual(exercise(0),{item:'PlayCardAction',option:1,
    targets:['Garbodor LTR','Garbodor BKP']});
});

test('bilateral composed owner bot clears both Garbotoxin Tools, seat 1',()=>{
  assert.deepEqual(exercise(1),{item:'PlayCardAction',option:1,
    targets:['Garbodor LTR','Garbodor BKP']});
});
