'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stageSourceBunnelbyBoard}=require('./bunnelby-tm-policy-replay.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {initializeCards}=require('./headless.cjs');
const {makeBunnelbyEvolutionTactic,hasBenchEvolutionTarget,hasK0PossibleBenchEvolutionTarget}=
  require('./bunnelby-evolution-policy.cjs');

const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} p */
const load=p=>require(path.join(root,p));

/**
 * Conditioned source-printed Bunnelby/Jet/TM/Bench Oddish board.
 * Two physically paired hidden layouts exchange Gloom between the deck and
 * a face-down Prize, with all public game information held fixed.
 * This reuses the staged five-card target deck in the pinned Store and is not
 * a genuine shuffled rank-2 opening. A separate pure test checks source 60.
 * @param {boolean} prizeGloom
 */
function stage(prizeGloom) {
  const {fixture:f}=stageSourceBunnelbyBoard();
  f.attacker.bench.splice(1,1); // Avoid a second Pidgeotto search target.
  const gloom=f.attacker.deck.cards.find(c=>c.fullName==='Gloom UNB');
  assert.ok(gloom,'Conditioned evolution target absent');
  if(prizeGloom) {
    const firstPrize=f.attacker.prizes[0];
    const prior=firstPrize.cards[0];
    assert.ok(prior,'Face-down Prize slot lacks a physical card');
    const idx=f.attacker.deck.cards.indexOf(gloom);
    f.attacker.deck.cards.splice(idx,1,prior);
    firstPrize.cards.splice(0,1,gloom);
  }
  const state=f.store.state;
  const a=state.players.find(p=>p.id===f.attacker.id);
  const view={
    turn:state.turn,activeSeat:state.activePlayer,
    active:a.active.getPokemonCard().fullName,
    energies:a.active.energies.cards.map(c=>c.fullName),
    tools:a.active.tools.map(c=>c.fullName),
    bench:a.bench.map(slot=>slot.getPokemonCard().fullName),
    hand:a.hand.cards.map(c=>c.fullName),
    deckCount:a.deck.cards.length,
    prizeCount:a.prizes.length,
    noDeckSearchYet:true
  };
  return {f,state,a,view};
}

/** @returns {object} A real tactic proposal contrast on twin staged boards. */
function run() {
  const {defaultStateScores,defaultArbiterOptions}=load(
    'simple-bot/simple-bot-definitions');
  const Tactic=makeBunnelbyEvolutionTactic();
  const options={scores:defaultStateScores,arbiter:defaultArbiterOptions};
  const accessible=stage(false),hidden=stage(true);
  assert.deepEqual(accessible.view,hidden.view,
    'The bot must not receive distinguishable public observations');
  assert.equal(hasBenchEvolutionTarget(accessible.a),true);
  assert.equal(hasBenchEvolutionTarget(hidden.a),false);
  const a=new Tactic(options).useTactic(accessible.state,accessible.a);
  const b=new Tactic(options).useTactic(hidden.state,hidden.a);
  assert.equal(a?.constructor.name,'AttackAction',
    'Source stage chain should cause positive tactic to offer an attack');
  assert.equal(a?.name,'Evolution');
  const field=resolveManifestFile(path.resolve(__dirname,'../../results/aichi-2026/full-decklists.json'),{allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const rank2=field.decks.find(deck=>deck.rank===2);
  assert.ok(rank2?.playableUnderEngine);
  const manager=initializeCards();
  const sourceCards=rank2.cardIds.map(name=>manager.getCardByName(name));
  assert.equal(sourceCards.length,60);
  const possible=player=>hasK0PossibleBenchEvolutionTarget(player,sourceCards);
  assert.equal(possible(accessible.a),true);
  assert.equal(possible(hidden.a),true);
  const SafeTactic=makeBunnelbyEvolutionTactic(possible);
  const safeA=new SafeTactic(options).useTactic(accessible.state,accessible.a);
  const safeB=new SafeTactic(options).useTactic(hidden.state,hidden.a);
  assert.equal(safeA?.name,'Evolution');
  assert.equal(safeB?.name,'Evolution');
  assert.equal(b,undefined,
    'Moving only the hidden Gloom to Prizes suppresses the tactic');
  return {
    study:'Bunnelby K0 hidden-layout action proposal contrast',
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    publicState:accessible.view,
    withGloomInDeck:{predicate:true,action:a?.constructor.name,attack:a?.name},
    withGloomPrized:{predicate:false,action:null,attack:null},
    k0SafeSource60:{sourceRank:2,actionWithTarget:safeA?.name,
      actionWithPrizedTarget:safeB?.name},
    scope:'Conditioned board and one opt-in tactic call, no actual source 60 deal or bot full turn, no win rate'
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={stage,run};
