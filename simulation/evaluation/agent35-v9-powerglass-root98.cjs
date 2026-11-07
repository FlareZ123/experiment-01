'use strict';
/**
 * Read-only paper-conditional root98 Powerglass => end-turn Basic Energy =>
 * next-turn Unown Hidden Power. This never executes the counterfactual Store.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const VERSION='agent35-v9-root98-powerglass-conditional-one-prize-v1';
const CARDS=path.resolve(__dirname,'../../resources/cards/en');

/** @param {string} set @param {string} id */
function printing(set,id){
  const card=require(path.join(CARDS,set+'.json')).find(x=>x.id===id);
  assert.ok(card,'Missing exact printed card '+id);
  return card;
}

/** @param {object} artifact Genuine original exposed-seed Lillie native result. */
function certificate(artifact){
  const attempt=artifact.nativeAttempt;
  assert.equal(attempt.id,'11:1000:B:new-moon-lockbreaker-v1');
  assert.equal(attempt.sourceSeat,0);
  assert.equal(attempt.candidateSeat,1);
  assert.equal(attempt.status,'native-terminal-unqualified');
  assert.equal(attempt.sourceDealFingerprint,
    'a6e4ba442cc784498de9d2938b47e8e42b6e9591fc07558e505ac2cd9094b317');
  assert.equal(attempt.fullPhysicalDealFingerprint,
    '94526e4b7eecefa78cbb7db5bc053cb593e90d20310a680e6510a00c11e702d7');

  const unown=printing('xy7','xy7-30');
  const trubbish=printing('swsh8','swsh8-168');
  const powerglass=printing('sv6pt5','sv6pt5-63');
  assert.equal(unown.hp,'60');
  assert.equal(trubbish.hp,'70');
  assert.deepEqual(unown.types,['Psychic']);
  assert.deepEqual(trubbish.types,['Darkness']);
  assert.equal(unown.weaknesses[0]?.type,'Psychic',
    'Printed Darkness Trubbish cannot exploit Unown Psychic Weakness');
  assert.deepEqual(unown.attacks[0].cost,['Colorless']);
  assert.equal(Number(unown.attacks[0].damage),10);
  assert.deepEqual(trubbish.attacks[1].cost,['Darkness','Colorless']);
  assert.equal(Number(trubbish.attacks[1].damage),20);
  assert.match(powerglass.rules[0],/At the end of your turn \(after your attack\)/);
  assert.match(powerglass.rules[0],/Basic Energy card from your discard pile/);
  assert.match(powerglass.rules[0],/Active Spot/);

  const ko=attempt.sourceAttackSettlement.attacks.find(x=>x.actionOrdinal===86);
  assert.ok(ko);
  assert.equal(ko.attackName,'Super Poison Breath');
  assert.deepEqual(ko.prizesBefore,[6,6]);
  assert.deepEqual(ko.prizesAfter,[5,6]);
  assert.equal(ko.publicBoardBefore[1].active.printing,'Unown AOR');
  assert.deepEqual(ko.publicBoardBefore[1].active.energyCards,
    ['Psychic Energy','Psychic Energy']);
  assert.equal(ko.publicBoardAfter[1].active.printing,'Unown AOR');
  assert.deepEqual(ko.publicBoardAfter[1].active.energyCards,[]);

  const roots=attempt.rootActionLedger;
  const interveningCards=roots.filter(x=>x.actionOrdinal>86&&
    x.actionOrdinal<98&&x.playerSlot===1&&x.action==='PlayCardAction')
    .map(x=>x.card);
  assert.deepEqual(interveningCards,
    ['Mewtwo & Mew-GX',"Lillie's Determination",'Squawkabilly ex']);
  assert.equal(roots[98].action,'PassTurnAction');
  assert.equal(roots[98].playerSlot,1);
  const pass=attempt.nativeAllOwnerPassFrontier.receipts.find(r=>
    r.actionOrdinal===98&&r.actorSeat===1&&r.turn===14);
  assert.ok(pass);
  assert.ok(pass.ownerHandAtChosenPass.includes('Powerglass SFA'));
  const board=pass.publicBoardBeforePass;
  const candidate=board[1].active,source=board[0].active;
  assert.equal(candidate.printing,'Unown AOR');
  assert.equal(candidate.damage,0);
  assert.deepEqual(candidate.energyCards,[]);
  assert.deepEqual(candidate.toolCards,[]);
  assert.equal(source.printing,'Trubbish FST');
  assert.equal(source.damage,60);
  assert.deepEqual(source.toolCards,[]);
  assert.equal(board[0].stadium.length,0);
  assert.equal(board[1].stadium.length,0);
  assert.equal(board[1].bench.length,5);
  assert.equal(board[0].bench.length,5);
  assert.ok(board[0].bench.every(p=>p.printing!=='Garbodor BKP'));
  assert.ok(board[0].bench.every(p=>p.printing!=='Vileplume AOR'));
  assert.equal(source.damage+Number(unown.attacks[0].damage),Number(trubbish.hp));
  assert.ok(Number(trubbish.attacks[1].damage)+10<Number(unown.hp),
    'One Super Poison Breath and ordinary Poison check should not KO Unown');
  return {
    schema:VERSION,trialId:attempt.id,actualPassOrdinal:98,globalTurn:14,
    realBoardAtPass:{
      candidateActive:candidate.printing,candidateDamage:0,
      candidateEnergyCount:0,candidateToolCount:0,
      sourceActive:source.printing,sourceDamage:source.damage,
      sourcePrintedHP:Number(trubbish.hp),sourceToolCount:0,
      ownerHeldTool:'Powerglass SFA',benchSize:5
    },
    priorPhysicalKoEvidence:{
      ordinal:86,sourcePrizeReduction:1,previousUnownPhysicalBasicPsychicAttached:2,
      paperKoDiscardInference:true,ownerDiscardDirectlyObserved:false,
      interveningCandidateAcceptedCardPlays:interveningCards
    },
    conditionalPrintedLine:[
      'Attach held Powerglass to Tool-free Active Unown on candidate turn14',
      'End turn without attack; rulebook E-21 permits a Basic Psychic from own discard',
      'If Trubbish stays Active and next Super Poison Breath resolves, Unown survives 20 damage plus one ordinary Poison check',
      'Next candidate turn, that Psychic pays one-Colorless Hidden Power cost; 10 damage can KO 60-damaged 70-HP Trubbish'
    ],
    nativeMechanicPreviouslyStagedBy:'simulation/twinleaf/agent41-powerglass-after-pass-native.cjs',
    executionOfThisCounterfactual:false,
    nativePowerglassAcceptanceOnThisRootVerified:false,
    actualOpponentResponseKnownForCounterfactual:false,
    originalSourceWinRateImplication:false,competitivelyQualifiedGames:0
  };
}

if(require.main===module){
  assert.equal(process.argv.length,3);
  process.stdout.write(JSON.stringify(certificate(JSON.parse(
    fs.readFileSync(process.argv[2],'utf8'))),null,2)+'\n');
}
module.exports={VERSION,certificate,printing};
