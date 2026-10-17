'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {build}=require('../simulation/twinleaf/ticket-k1-epoch-contrast.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {installRedeemableTicketPaperOrderHook}=
  require('../simulation/twinleaf/redeemable-ticket-paper-hook.cjs');
const {withBunnelbyEvolutionLine,hasBenchEvolutionTarget,
  hasK0PossibleBenchEvolutionTarget}=
  require('../simulation/twinleaf/bunnelby-evolution-policy.cjs');
const {snapshotPrizeCardIdentities,invalidateAfterRootHiddenPrizeIngress}=
  require('../simulation/twinleaf/root-prize-knowledge-observer.cjs');
const engine=name=>require(path.resolve(__dirname,
  '../vendor/twinleaf/ptcg-server/output',name));

function conditionedBot(insertion){
  const sample=build(insertion);
  const {Format}=engine('game/store/card/card-types');
  sample.state.gameSettings.format=Format.EXPANDED;
  sample.state.turn=2;
  const manager=initializeCards();
  const opponent=sample.state.players.find(player=>player.id!==sample.a.id);
  assert.ok(opponent);
  for(let i=0;i<4;i++)opponent.deck.cards.push(
    manager.getCardByName('Psychic Energy MEE'));
  const bunnelby=manager.getCardByName('Bunnelby PRC');
  const tool=manager.getCardByName('Technical Machine: Evolution PAR');
  const energy=manager.getCardByName('Double Colorless Energy SUM');
  assert.ok(bunnelby&&tool&&energy);
  sample.a.active.cards.splice(0,sample.a.active.cards.length,bunnelby,energy);
  sample.a.active.energies.cards.push(energy);
  sample.a.active.tools.push(tool);
  // The two physical worlds share the same exact known 60 and public/own
  // visible cards. The synthetic stage predates the imagined real search.
  const original=[...sample.sourcePrints,bunnelby,energy,tool];
  const source60=[...original];
  while(source60.length<60)
    source60.push(manager.getCardByName('Psychic Energy MEE'));
  assert.equal(source60.length,60);
  const defs=engine('simple-bot/simple-bot-definitions');
  const options=withBunnelbyEvolutionLine({
    tactics:defs.allSimpleTactics,promptResolvers:defs.allPromptResolvers,
    scores:defs.defaultStateScores,arbiter:defs.defaultArbiterOptions
  },{
    sourceCards:source60,observeFirstOwnDeckSearch:true,
    isLivePrompt:(state,player,prompt)=>
      state===sample.store.state && state.players.includes(player) &&
      state.prompts.includes(prompt) && prompt.result===undefined
  });
  const Tactic=options.tactics.find(t=>t.name==='BunnelbyEvolutionTactic');
  assert.ok(Tactic);
  return {...sample,source60,options,tactic:new Tactic(options),
    epoch:options.bunnelbyDeckKnowledgeEpoch};
}

test('post-Ticket Bunnelby decisions return to source-K0 equality across unknown Prize partitions',()=>{
  const worlds=[conditionedBot(0),conditionedBot(6)];
  for(const w of worlds){
    assert.equal(hasBenchEvolutionTarget(w.a),true);
    w.epoch.observeOwnerDeckSearch();
    assert.equal(w.tactic.useTactic(w.state,w.a)?.name,'Evolution');
  }
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {Format}=engine('game/store/card/card-types');
  const restore=installRedeemableTicketPaperOrderHook();
  try{
    for(const w of worlds){
      w.state.gameSettings.format=Format.EXPANDED;
      w.state.turn=2;
      const prior=snapshotPrizeCardIdentities(w.state);
      const handIndex=w.a.hand.cards.indexOf(w.ticket);
      assert.ok(handIndex>=0);
      w.store.dispatch(new PlayCardAction(w.a.id,handIndex,
        {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
      assert.deepEqual(invalidateAfterRootHiddenPrizeIngress(
        prior,w.state,new Map([[w.a.id,w.epoch]])),[w.a.id]);
    }
  }finally{restore();}
  assert.deepEqual(worlds.map(w=>hasBenchEvolutionTarget(w.a)),
    [false,true],'The two physical hidden deck partitions differ');
  for(const w of worlds){
    assert.equal(w.epoch.exactMembershipKnown(),false);
    assert.equal(hasK0PossibleBenchEvolutionTarget(w.a,w.source60),true);
    assert.equal(w.tactic.useTactic(w.state,w.a)?.name,'Evolution',
      'A formerly K1 bot must not inspect the hidden post-Ticket partition');
  }
});
