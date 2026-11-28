'use strict';
/**
 * Exact pinned Twinleaf Store setup witness for the original candidate's
 * high-impact error: shuffled first eligible card is Radiant/Lele, whereas
 * the first SELECTED card (not first source index) becomes Active.
 *
 * Requires compiled pinned Twinleaf output; intentionally unexecuted in this
 * GitHub-only invocation. It exercises native ChooseCardsPrompt decode,
 * Store.dispatch(ResolvePromptAction), actual physical hand transfers,
 * source-shaped candidate policy and strict projection token order.
 *
 * This witness uses a SMALL *test-only* source-printing map for four known
 * physical cards. It is NOT the complete Agent32 PR#94 source-certified
 * original-60 map, must not be used as a live V3 host adapter, and does not
 * qualify any matchup.
 */
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../../simulation/twinleaf/headless.cjs');
const {projectPrompt,dispatchPromptChoice}=
  require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
const {createPolicy,POLICY_VERSION}=
  require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');

const native=name=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',name));
const {Store}=native('game/store/store');
const {Player}=native('game/store/state/player');
const {PokemonCardList}=native('game/store/state/pokemon-card-list');
const {GamePhase}=native('game/store/state/state');
const {ChooseCardsPrompt}=native('game/store/prompts/choose-cards-prompt');
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
const {GameMessage}=native('game/game-message');

const ORIGINAL_PRINT=Object.freeze({
  'Radiant Eternatus CRZ':'Radiant Eternatus CRZ 105',
  'Mimikyu GRI':'Mimikyu GRI 58',
  'Tapu Lele-GX GRI':'Tapu Lele-GX GRI 60',
  'Shadow Rider Calyrex V CRE':'Shadow Rider Calyrex V CRE 74'
});

function exactFourCardOpening(seat){
  const manager=initializeCards();
  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.phase=GamePhase.SETUP;
  state.turn=0;
  state.activePlayer=seat;
  const owner=new Player(),opponent=new Player();
  owner.id=seat===0?102:201;
  opponent.id=seat===0?201:102;
  for(const player of [owner,opponent]){
    player.bench=Array.from({length:5},()=>new PokemonCardList());
  }
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  for(const name of Object.keys(ORIGINAL_PRINT)){
    const physical=manager.getCardByName(name);
    assert.ok(physical,'pinned card unavailable: '+name);
    owner.hand.cards.push(physical);
  }
  // Use the exact critical shuffled order:
  // [Radiant, Mimikyu, Tapu Lele, Shadow Rider V].
  assert.deepEqual(owner.hand.cards.map(c=>c.fullName),
    Object.keys(ORIGINAL_PRINT));
  const prompt=new ChooseCardsPrompt(owner,GameMessage.CHOOSE_STARTING_POKEMONS,
    owner.hand,{}, {min:1,max:6,allowCancel:false,blocked:[]});
  let nativeCallbackInvocations=0;
  store.prompt(state,prompt,chosen=>{
    nativeCallbackInvocations++;
    assert.ok(Array.isArray(chosen));
    owner.hand.moveCardTo(chosen[0],owner.active);
    for(let i=1;i<chosen.length;i++){
      owner.hand.moveCardTo(chosen[i],owner.bench[i-1]);
    }
  });
  const projected=projectPrompt({prompt,state,actorSeat:seat,native:{
    Store,ResolvePromptAction
  },store});
  assert.equal(projected.hostOnly,false);
  assert.equal(projected.promptProjection.source.sourceKind,'engine');
  assert.equal(projected.promptProjection.description,'CHOOSE_STARTING_POKEMONS');

  // PR#94 will eventually replace this local witness-only source map.
  // Raw physical objects, prompt tokens and choiceByToken remain UNCHANGED.
  const mappedChoices=projected.promptProjection.choices.map(choice=>{
    const original=ORIGINAL_PRINT[choice.printing];
    assert.ok(original,'outside original witness print map: '+choice.printing);
    return Object.freeze({...choice,printing:original,label:original});
  });
  const sourceProjection=Object.freeze({...projected.promptProjection,
    choices:Object.freeze(mappedChoices)});
  protocol.validatePrompt(sourceProjection,seat);
  const view={
    phase:1,actorSeat:seat,globalTurn:0,decisionKind:'owner-prompt',
    ownHand:mappedChoices.map(x=>x.printing),
    ownPublic:{active:null,bench:[],discard:[],stadium:[],
      deckCount:46,handCount:4,publicTurnRestrictions:{}},
    opponentPublic:{active:null,bench:[],discard:[],stadium:[],
      deckCount:46,publicTurnRestrictions:{}}
  };
  const policy=createPolicy({role:'candidate',seat,
    policyVersion:POLICY_VERSION,config:{}});
  const request={role:'candidate',seat,observation:view,
    publicEventReceipt:null,
    prompt:sourceProjection,
    actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}};
  const decision=policy.decide(request);
  assert.equal(decision.kind,'select-choices');
  const selected=decision.tokens.map(token=>mappedChoices.find(c=>c.token===token));
  assert.deepEqual(selected.map(c=>c.printing),[
    'Shadow Rider Calyrex V CRE 74','Mimikyu GRI 58']);
  // Native dispatch maps selected token order to PHYSICAL hand indices and
  // does not reorder them into shuffled index order.
  const dispatched=dispatchPromptChoice({
    store,prompt,state,actorSeat:seat,projection:{
      ...projected,promptProjection:sourceProjection
    },decision,native:{Store,ResolvePromptAction}
  });
  assert.equal(dispatched.decoded.length,2);
  assert.equal(nativeCallbackInvocations,1);
  assert.equal(owner.active.getPokemonCard().fullName,
    'Shadow Rider Calyrex V CRE');
  assert.equal(owner.bench[0].getPokemonCard().fullName,'Mimikyu GRI');
  assert.equal(owner.bench[1].cards.length,0);
  assert.deepEqual(owner.hand.cards.map(c=>c.fullName).sort(),[
    'Radiant Eternatus CRZ','Tapu Lele-GX GRI'
  ].sort());
  assert.equal(owner.hand.cards.some(c=>c.fullName==='Radiant Eternatus CRZ'),true);
  assert.equal(store.state.prompts.some(p=>p.result===undefined),false);
}

for(const seat of [0,1]){
  test('pinned native source-ordered original Hood setup Active and reserved triggers seat '+seat,
    ()=>exactFourCardOpening(seat));
}
