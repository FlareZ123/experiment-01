'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {fixture}=require('../simulation/twinleaf/hidden-deck-order-audit.cjs');
const {initializeCards,seededRandom}=require('../simulation/twinleaf/headless.cjs');
const {resolveManifestFile}=
  require('../simulation/twinleaf/resolve-field.cjs');
const {actorObservation}=
  require('../simulation/twinleaf/actor-observation-contract.cjs');
const {classifyNativeTrainerAfterPass}=
  require('../simulation/twinleaf/agent50-native-owner-trainer-pass-bridge.cjs');

const ROOT=path.resolve(__dirname,'..');
const engine=name=>require(path.join(ROOT,
  'vendor/twinleaf/ptcg-server/output',name));
const TRAINER="Trainers' Mail ROS";
const SUPPORTER='Guzma BUS';
const NON_TRAINER='Genesect V FST';
const ACTIVE='Mew V FST';

/**
 * Build a physically complete owner original-rank-5 registered 60-card
 * inventory. This is an injected global-turn-four root, not a game transcript.
 * The six Prizes and both visible positions are identical in both worlds.
 * Only the still-unrevealed deck order changes.
 *
 * @param {boolean} hiddenGuzmaWithinMailWindow
 * @returns {{state:object,source60:string[]}}
 */
function sourceRank5MailFixture(hiddenGuzmaWithinMailWindow) {
  const manager=initializeCards();
  const manifest=resolveManifestFile(path.join(ROOT,
    'results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,
      allowJapanesePromoHooks:true
    });
  const source=manifest.decks.find(row=>row.rank===5);
  assert.ok(source?.playableUnderEngine===true);
  assert.equal(source.cardIds.length,60);
  const remaining=source.cardIds.slice();
  function remove(name) {
    const index=remaining.indexOf(name);
    assert.ok(index>=0,'Source rank 5 missing exact printing '+name);
    return remaining.splice(index,1)[0];
  }
  const ownActive=remove(ACTIVE);
  const ownMail=remove(TRAINER);
  // Prize six of the remaining 58 actual source cards in a fixed order;
  // preserve the same six cards across both concealed worlds.
  const prizes=remaining.splice(remaining.length-6,6);
  const heldSupporter=remove(SUPPORTER);
  const fourPokemon=Array.from({length:4},()=>remove(NON_TRAINER));
  assert.equal(remaining.length,47);
  const orderedDeck=hiddenGuzmaWithinMailWindow?
    [heldSupporter,...fourPokemon.slice(0,3),...remaining,fourPokemon[3]]:
    [...fourPokemon,...remaining,heldSupporter];
  assert.equal(orderedDeck.length,52);
  const {Player}=engine('game/store/state/player');
  const {CardList}=engine('game/store/state/card-list');
  const state=fixture(true);
  const owner=new Player();
  owner.id=101;
  let nextCardId=10000;
  function card(printing) {
    const instance=manager.getCardByName(printing);
    assert.ok(instance,'Source printing unavailable: '+printing);
    instance.id=nextCardId++;
    return instance;
  }
  owner.active.cards.push(card(ownActive));
  owner.hand.cards.push(card(ownMail));
  for(const printing of prizes) {
    const zone=new CardList();
    zone.cards.push(card(printing));
    owner.prizes.push(zone);
  }
  owner.deck.cards.push(...orderedDeck.map(card));
  state.players[0]=owner;
  const total=[...owner.active.cards,...owner.hand.cards,
    ...owner.deck.cards,...owner.prizes.flatMap(zone=>zone.cards)]
    .map(c=>c.fullName).sort();
  assert.deepStrictEqual(total,source.cardIds.slice().sort(),
    'Injected owner zones must preserve all 60 original rank-5 cards');
  return {state,source60:source.cardIds.slice()};
}

test('original rank-5 source 60: Trainer Mail full-bot and fallback are concealed-order sensitive',()=>{
  const a=sourceRank5MailFixture(true);
  const b=sourceRank5MailFixture(false);
  assert.deepStrictEqual(a.source60,b.source60);
  const decks=[a,b].map(row=>
    row.state.players[0].deck.cards.map(card=>card.fullName).sort());
  assert.deepStrictEqual(decks[0],decks[1],
    'Full 52-card owner deck multiset changed');
  const views=[a,b].map(row=>actorObservation(row.state,0));
  assert.deepStrictEqual(views[0],views[1],
    'Owner private hand and both public boards changed');
  assert.deepStrictEqual(views[0].ownHand,[TRAINER]);
  const definitions=engine('simple-bot/simple-bot-definitions');
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {PlayCardAction}=engine('game/store/actions/play-card-action');
  const options={tactics:definitions.allSimpleTactics,
    promptResolvers:definitions.allPromptResolvers,
    scores:definitions.defaultStateScores,
    arbiter:definitions.defaultArbiterOptions};
  const actions=[a,b].map(row=>
    new SimpleTacticsAi({id:101},options,null)
      .decodeNextAction(row.state));
  const actionTypes=actions.map(action=>action?.constructor.name??'NoAction');
  assert.deepStrictEqual(actionTypes,['PlayCardAction','PassTurnAction'],
    'Original source rank-5 concealed-order policy reversal was absent');
  const catalog=new Map([[TRAINER,{name:"Trainers' Mail",type:'Item'}]]);
  const selected=actions.map((action,i)=>
    classifyNativeTrainerAfterPass(views[i],action,catalog,PlayCardAction));
  assert.deepStrictEqual(selected.map(row=>row.selected),[true,false],
    'Existing generic Trainer filter inherited different native proposals');
  assert.equal(selected[0].reason,
    'native-proposed-generic-unblocked-trainer');
  assert.equal(selected[1].reason,'native-did-not-propose-play-card');
  // No actual Store action is dispatched in this deliberately injected root.
  assert.equal(selected[0].unqualifiedNativeDecision,true);
});


test('coupled seeded policy RNG: original rank-5 Mail decision can change with concealed deck order',()=>{
  const a=sourceRank5MailFixture(true);
  const b=sourceRank5MailFixture(false);
  const views=[a,b].map(row=>actorObservation(row.state,0));
  assert.deepStrictEqual(views[0],views[1]);
  const definitions=engine('simple-bot/simple-bot-definitions');
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const options={tactics:definitions.allSimpleTactics,
    promptResolvers:definitions.allPromptResolvers,
    scores:definitions.defaultStateScores,
    arbiter:definitions.defaultArbiterOptions};
  const seeds=Array.from({length:16},(_,i)=>i+1);
  const contrasts=[];
  for(const seed of seeds){
    const signatures=[a,b].map(row=>{
      const bot=new SimpleTacticsAi({id:101},options,null);
      const previous=Math.random;
      Math.random=seededRandom(seed);
      try{
        const action=bot.decodeNextAction(row.state);
        return action?.constructor?.name??'NoAction';
      }finally{
        Math.random=previous;
      }
    });
    contrasts.push({policyRngSeed:seed,signatures,
      changed:signatures[0]!==signatures[1]});
  }
  assert.ok(contrasts.some(row=>row.changed),
    'Concealed-world action reversal did not survive any matched 1..16 RNG tape');
  assert.ok(contrasts.every(row=>
    row.signatures.every(x=>['PlayCardAction','PassTurnAction'].includes(x))),
    'Unexpected actual pinned native action in coupled RNG test');
  process.stdout.write('AGENT9_SOURCE_RANK5_COUPLED_POLICY_TAPE '+
    JSON.stringify({pairedTapes:seeds.length,
      reversalCount:contrasts.filter(x=>x.changed).length,
      contrasts,competitiveGamesQualified:0})+'\\n');
});
