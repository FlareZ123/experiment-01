'use strict';
const assert = require('node:assert/strict');

const SUPPORTED_NATIVE_ALIAS = new Map([
  ['Ditto Prism Star', 'Ditto ♢']
]);

/**
 * Census original Store roots for all controls and treatments separately.
 * The full immutable archive must already pass the source-pair audit.
 * Printed role classification comes solely from the authentic source 60s.
 * @param {object} archive Registered prior 38-arm native history.
 * @param {object} manifest Frozen original Aichi published field roster.
 * @returns {object} Descriptive native root counters, not legal-playability data.
 */
function censusOriginalActionRoots(archive,manifest) {
  assert.equal(archive.pairs.length,19);
  assert.equal(archive.attemptedNativeArms,38);
  assert.ok(Array.isArray(manifest.decks));
  const printed={};
  for(const [role,rank] of [['source',17],['reference',1]]) {
    const original=manifest.decks.find(entry=>entry.rank===rank);
    assert.ok(original&&Array.isArray(original.cards),`Missing original rank ${rank}`);
    assert.equal(original.cards.reduce((sum,c)=>sum+c.count,0),60);
    const names=new Map();
    for(const card of original.cards) {
      assert.ok(['Pokémon','Trainer','Energy'].includes(card.category));
      const prior=names.get(card.name);
      assert.ok(prior===undefined||prior===card.category,
        `Ambiguous printed card category: ${card.name}`);
      names.set(card.name,card.category);
    }
    printed[role]=names;
  }
  const zero=()=>({
    total:0,setupRootCount:0,gameRootCount:0,
    byAction:{},gameByAction:{},playedCards:{},
    playedByPrintedCategory:{'Pokémon':0,Trainer:0,Energy:0},
    attemptedAttacks:0,manualEnergyAttachments:0,
    acceptedPlayCardRoots:0
  });
  const roles={source:zero(),reference:zero()};
  const cohorts={
    'known-positive':{arms:0,sourceAttackRoots:0,sourceEnergyRoots:0},
    fresh:{arms:0,sourceAttackRoots:0,sourceEnergyRoots:0}
  };
  let completedArms=0;
  for(const pair of archive.pairs) {
    assert.ok(pair.sourceSeat===0||pair.sourceSeat===1);
    assert.ok(Object.hasOwn(cohorts,pair.cohort));
    for(const key of ['control','treatment']) {
      const arm=pair[key];
      assert.equal(arm.error,null);
      assert.ok(Array.isArray(arm.allNativeRootActions));
      completedArms++;
      cohorts[pair.cohort].arms++;
      for(const root of arm.allNativeRootActions) {
        const role=root.playerSlot===pair.sourceSeat?'source':'reference';
        assert.ok(root.playerSlot===0||root.playerSlot===1,
          'Root assigned to neither real physical player');
        assert.ok(Number.isInteger(root.turnBefore)&&root.turnBefore>=0);
        const entry=roles[role];
        entry.total++;
        entry.byAction[root.action]=(entry.byAction[root.action]??0)+1;
        if(root.turnBefore===0)entry.setupRootCount++;
        else{
          entry.gameRootCount++;
          entry.gameByAction[root.action]=(entry.gameByAction[root.action]??0)+1;
        }
        if(root.action==='AttackAction') {
          entry.attemptedAttacks++;
          if(role==='source')cohorts[pair.cohort].sourceAttackRoots++;
        }
        if(root.action==='PlayCardAction') {
          assert.equal(typeof root.card,'string');
          entry.acceptedPlayCardRoots++;
          entry.playedCards[root.card]=(entry.playedCards[root.card]??0)+1;
          const named=SUPPORTED_NATIVE_ALIAS.get(root.card)??root.card;
          const category=printed[role].get(named);
          assert.ok(category,`Unregistered ${role} played card: ${root.card}`);
          entry.playedByPrintedCategory[category]++;
          if(category==='Energy') {
            entry.manualEnergyAttachments++;
            if(role==='source')cohorts[pair.cohort].sourceEnergyRoots++;
          }
        }
      }
    }
  }
  assert.equal(completedArms,38);
  assert.equal(cohorts.fresh.arms,32);
  assert.equal(cohorts['known-positive'].arms,6);
  for(const entry of Object.values(roles)) {
    assert.equal(entry.total,entry.setupRootCount+entry.gameRootCount);
    assert.equal(entry.total,
      Object.values(entry.byAction).reduce((sum,n)=>sum+n,0));
    assert.equal(entry.gameRootCount,
      Object.values(entry.gameByAction).reduce((sum,n)=>sum+n,0));
    assert.equal(entry.acceptedPlayCardRoots,
      Object.values(entry.playedByPrintedCategory).reduce((sum,n)=>sum+n,0));
  }
  return {
    schema:'agent1-rank17-original-native-root-competence-census-v1',
    originalRanks:{source:17,reference:1},
    pairedPhysicalSeedGroups:19,attemptedNativeArms:38,
    roles,cohorts,
    legalAttackOpportunities:'UNVERIFIED',
    optimalEnergyRecipients:'UNVERIFIED',
    trainerAlternativesAndOwnership:'UNVERIFIED',
    competitivelyQualifiedGames:0
  };
}
module.exports={censusOriginalActionRoots,SUPPORTED_NATIVE_ALIAS};
