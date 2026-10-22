'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {compareRank4BombCampaigns, firstDifferentIndex, sourceRaichuAttackBoards} =
  require('../scripts/agent45-rank4-bomb-compare.cjs');

const energyBoard = (seat, cards) => [0,1].map((slot) => ({
  active: {name: slot===seat?'Alolan Raichu':'Other', energyCards: slot===seat?cards:[]}
}));
function campaign(on) {
  const make = (i) => {
    const seat = i%2===0 ? 'A':'B';
    const source = seat==='A'?1:0;
    const changed=on&&i===0;
    const attackBoard = {
      triggerPlayerSlot:source, actionOrdinal:42, turnBefore:4,
      declarations:[{attackName:changed?'Electro Rain':'Electric Ball'}],
      before:energyBoard(source,changed?['Reversal Energy','Counter Energy']:['Unit Energy']),
      after:energyBoard(source,changed?['Reversal Energy','Counter Energy']:['Unit Energy'])
    };
    const roots=[{actionOrdinal:1,playerSlot:source,ability:'Extra Energy Bomb'}];
    if(changed)roots.push({actionOrdinal:42,action:'AttackAction',attack:'Electro Rain'});
    else roots.push({actionOrdinal:42,action:'AttackAction',attack:'Electric Ball'});
    return {
      trialId:'fixture:'+i,candidateId:'candidate',candidateDigest:'A',
      opponentRank:4,opponentDigest:'B',seed:i,candidateEngineSlot:seat,
      candidateActualTurn:'first',turnEvidence:{firstTurnSlot:i%2},
      engineRevision:'pin',rules:{},randomnessProtocol:'fixed',
      engineDeckHashes:['one','two'],planDigest:'p',status:'completed-engine-game',
      actions:10,winnerIndex:0,opponentAttackDeclarations:1,
      traceSummary:{rootActionLedger:roots,
        rootActionLedgerSha256:changed?'different':'base',
        publicAttackTransitions:[attackBoard],
        prizesRemaining:[6,6],chronologicalActionTraceSha256:'same',finalState:[]}
    };
  };
  return {selectedPilotRanks:[4],planDigest:'p',seedProtocol:'v3',
    maxActions:600,totalScheduled:8,policyFlags:{rank4RaichuBombRecipientSource:on},
    researchRevision:'pin',records:Array.from({length:8},(_,i)=>make(i))};
}

test('first-difference preserves equal-prefix and length distinctions', () => {
  assert.equal(firstDifferentIndex([1,2],[1,2]),null);
  assert.equal(firstDifferentIndex([1,2],[1,3]),1);
  assert.equal(firstDifferentIndex([1],[1,2]),1);
});
test('source attack geometry follows actual source physical seat', () => {
  const c=campaign(false);
  assert.deepEqual(sourceRaichuAttackBoards(c.records[0])[0].activeEnergyCardsBefore,
    ['Unit Energy']);
  assert.equal(sourceRaichuAttackBoards(c.records[1])[0].name[0],'Electric Ball');
});
test('all eight trials and the sole intended toggle are audited', () => {
  const result=compareRank4BombCampaigns(campaign(false),campaign(true));
  assert.equal(result.totalPairs,8);
  assert.equal(result.totalChangedPublicAttackBoards,1);
  assert.equal(result.totalChangedRootLabelDigests,1);
  assert.equal(result.totalChangedWinners,0);
  assert.equal(result.competitiveQualifiedGames,0);
  assert.equal(result.rows[0].firstRootLabelDifference.index,1);
});
test('reject changed seed, hidden option drift or missing trial', () => {
  const off=campaign(false);
  const on=campaign(true);
  on.records[0].seed++;
  assert.throws(()=>compareRank4BombCampaigns(off,on),/Identity drift/);
  on.records[0].seed--;
  on.policyFlags.other=true;
  assert.throws(()=>compareRank4BombCampaigns(off,on),/Only the intended/);
  delete on.policyFlags.other;
  on.records.pop();
  assert.throws(()=>compareRank4BombCampaigns(off,on));
});
