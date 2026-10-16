'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch}=require('./headless.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {liveCardDamageSnapshots}=require('./simulator-leak-observer.cjs');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine=name=>require(path.join(root,name));

/**
 * Read only the live State's Card histories immediately around already
 * scheduled speculative evaluations. Never simulate additional actions.
 * @param {()=>object} play Source-ranked headless game.
 * @returns {{game:object,observation:object}}
 */
function observeSpeculativeMutation(play) {
  const {SimpleTactic}=engine('simple-bot/simple-tactics/simple-tactics');
  const {Card}=engine('game/store/card/card');
  const original=SimpleTactic.prototype.evaluateAction;
  const observation={profile:'passive-live-evaluation-card-history-v1',
    evaluations:0,changedCardEvents:0,changedCardNames:{},samples:[]};
  try {
    SimpleTactic.prototype.evaluateAction=function(state,id,action,passScore) {
      const before=liveCardDamageSnapshots(state,Card);
      const result=original.call(this,state,id,action,passScore);
      observation.evaluations++;
      for(const [card,value] of before) {
        const after=card.damageTakenLastTurn;
        if(Object.is(after,value))continue;
        observation.changedCardEvents++;
        const name=card.fullName||card.name||'?';
        observation.changedCardNames[name]=
          (observation.changedCardNames[name]||0)+1;
        if(observation.samples.length<8) {
          observation.samples.push({name,before:value,after,
            attemptedAction:action?.constructor?.name||null,
            attemptedAttack:action?.name||null});
        }
      }
      return result;
    };
    return {game:play(),observation};
  } finally {
    SimpleTactic.prototype.evaluateAction=original;
  }
}

/** @returns {object} */
function audit() {
  const manifest=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const byRank=new Map(manifest.decks.map(d=>[d.rank,d]));
  const rank1=byRank.get(1),rank10=byRank.get(10);
  assert.ok(rank1?.playableUnderEngine&&rank10?.playableUnderEngine);
  const request={deckA:rank1.cardIds,deckB:rank10.cardIds,
    seed:20261049,maxActions:350,
    label:'agent16-source-ranked-passive-mutation-audit',
    strictPromptValidation:true,forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,doubleDragonRecovery:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true};

  /** @param {boolean} repaired */
  function pair(repaired) {
    const options={...request,postSuperAliasRepairIsolation:repaired};
    const baseline=runMatch(options);
    const observed=observeSpeculativeMutation(()=>runMatch(options));
    assert.deepEqual(observed.game,baseline,
      'Passive Card-history observer changed deterministic source game');
    assert.equal(baseline.verifiedByDrawLog,true);
    return {
      profile:repaired?'post-super-v2':'pinned-original',
      policy:baseline.policy,actions:baseline.actions,
      finished:baseline.finished,winner:baseline.winner,
      firstTurnSlot:baseline.firstTurnSlot,
      deckHashes:baseline.deckHashes,
      meaningfulActions:baseline.decisionTrace.length,
      observation:observed.observation,
      observerNoninterference:true
    };
  }
  const original=pair(false),repaired=pair(true);
  assert.deepEqual(original.deckHashes,repaired.deckHashes);
  assert.equal(original.firstTurnSlot,repaired.firstTurnSlot);
  assert.equal(original.observation.profile,repaired.observation.profile);
  return {experiment:'natural rank1/rank10 speculative live-Card mutation',
    sourceSeed:request.seed,pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    original,repaired,qualifiedForCompetitiveInference:false};
}
if(require.main===module)console.log(JSON.stringify(audit(),null,2));
module.exports={audit,observeSpeculativeMutation};
