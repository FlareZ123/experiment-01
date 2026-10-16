'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { sourceState } = require('./hidden-source-deck-policy.cjs');
const { installSupporterDecisionHook } =
  require('./supporter-decision-hook.cjs');
const { installOwnDeckDeterminizationHook } =
  require('./own-deck-determinization-hook.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} relativePath */
const engine = relativePath => require(path.join(output, relativePath));

/** @returns {object} A limited experimental result, not a full-information-set policy. */
function auditOwnDeckSampling() {
  const a = sourceState(false, 14);
  const b = sourceState(true, 14);
  const {PlaySupporterTactic} =
    engine('simple-bot/simple-tactics/play-supporter-tactic');
  const {SimpleTacticsAi} = engine('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType} =
    engine('game/store/actions/play-card-action');
  const defs = engine('simple-bot/simple-bot-definitions');
  const options = {
    tactics:[PlaySupporterTactic],
    promptResolvers:defs.allPromptResolvers,
    scores:defs.defaultStateScores,
    arbiter:defs.defaultArbiterOptions
  };
  /** @param {ReturnType<typeof sourceState>} data */
  function action(data) {
    const f=data.fixture;
    return new SimpleTacticsAi({id:f.a.id}, options, null)
      .decodeNextAction(f.state)?.constructor.name ?? null;
  }
  /** @param {ReturnType<typeof sourceState>} data */
  function score(data) {
    const f=data.fixture;
    return new PlaySupporterTactic(options).evaluateAction(
      f.state,f.a.id,new PlayCardAction(f.a.id,0,
        {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
  }
  const originalA=a.fixture.a.deck.cards.slice();
  const originalB=b.fixture.a.deck.cards.slice();
  const restoreSupporter=installSupporterDecisionHook();
  let originalActions, sampledActions, sampledScores;
  try {
    originalActions=[action(a),action(b)];
    assert.deepEqual(originalActions,['PassTurnAction','PlayCardAction'],
      'Known hidden-order failure must reproduce before experimental sampling');
    const restoreSampling=installOwnDeckDeterminizationHook({
      seed:20261016,samples:12,assumeNoKnownDeckOrder:true
    });
    try {
      sampledScores=[score(a),score(b)];
      sampledActions=[action(a),action(b)];
    } finally {
      restoreSampling();
    }
  } finally {
    restoreSupporter();
  }
  assert.equal(sampledScores[0],sampledScores[1],
    'Equal unseen-deck multisets should yield matching sampled values');
  assert.equal(sampledActions[0],sampledActions[1],
    'Actual action must be invariant under the paired unseen permutation');
  assert.deepEqual(a.fixture.a.deck.cards,originalA,
    'The real first deck must be restored by the diagnostic wrapper');
  assert.deepEqual(b.fixture.a.deck.cards,originalB,
    'The real second deck must be restored by the diagnostic wrapper');
  return {
    sourceRank:10,sourceDeckCount:60,deckCardsRemaining:14,
    originalActions,sampledActions,sampledScores,
    originalRealDeckOrdersRestored:true,
    experimentalPolicy:'sample-own-unseen-deck-order-12-v1',
    unaddressed:'K0 prize ignorance, known top cards, opponent hidden information, full action policy, and simulator competence',
    scope:'One-tactic action-invariance demonstration on artificial source-complete states; do not use as competitive match evidence'
  };
}
if(require.main===module){
  console.log(JSON.stringify(auditOwnDeckSampling(),null,2));
}
module.exports={auditOwnDeckSampling};
