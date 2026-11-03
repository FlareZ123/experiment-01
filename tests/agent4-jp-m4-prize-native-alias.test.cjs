'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {PRINT_RULES,publicPrizeTrainerPrerequisite}=
  require('../simulation/evaluation/agent30-public-prize-trainer-necessary.cjs');
const {screenOwnerTrainerPaperNecessity,VERSION}=
  require('../simulation/twinleaf/agent4-owner-paper-trainer-necessary-screen.cjs');

/**
 * Actual Japanese M4 was released 13 March 2026, before the 10 May Aichi
 * event; English Chaos Rising (CRI) was released 22 May 2026.
 * Both printings share the same necessary public Prize threshold.
 * Complete post-play effects and cross-print eligibility remain unproven.
 * @param {string[]} hand
 * @param {number} opponentPrizes
 */
function owner(hand,opponentPrizes){
  return {
    decisionKind:'owner-root',actorSeat:1,globalTurn:3,
    ownHand:[...hand],
    ownPublic:{prizeCount:6,
      active:{printing:'Mew V FST',tools:[]},bench:[],stadium:[]},
    opponentPublic:{prizeCount:opponentPrizes,
      active:{printing:'Mew V FST',tools:[]},bench:[],stadium:[]},
    ownTurnResources:{itemPlayLocked:false,supporterPlayLocked:false,
      supporterPlayedTurn:0,stadiumPlayedTurn:0}
  };
}

const row=(printing,index=0)=>({
  handIndex:index,printing,type:'Item',
  publicBlocker:null,nativeEnumeratorOffered:true
});

test('exact Japanese native M4 card is distinct from later English CRI source',()=>{
  assert.notEqual(PRINT_RULES['Special Red Card M4'].id,
    PRINT_RULES['Special Red Card CRI'].id);
  assert.equal(PRINT_RULES['Special Red Card M4'].id,'jp/M4/72');
  assert.equal(PRINT_RULES['Special Red Card CRI'].id,'me4-82');
  assert.equal(VERSION,
    'agent4-owner-paper-trainer-necessary-screen-v7-jp-m4-prize-printing');
  for(const printing of ['Special Red Card M4','Special Red Card CRI']){
    const v=owner([printing],6);
    const x=publicPrizeTrainerPrerequisite(v,row(printing));
    assert.equal(x.knownPrintedPrerequisite,true);
    assert.equal(x.blocked,true);
    assert.equal(x.paperPlayable,false);
    assert.equal(x.observedOpponentPrizeCount,6);
    assert.equal(x.printedPrerequisite,'opponent-prizes-at-most-3');
  }
});

test('native-offered original M4 at six opponent Prizes is proven blocked',()=>{
  const v=owner(['Special Red Card M4','Psychic Energy SVE'],6);
  const before=structuredClone(v);
  const x=screenOwnerTrainerPaperNecessity(v,[row(v.ownHand[0])]);
  assert.equal(x.heldTrainerCopies,1);
  assert.equal(x.enumeratorOfferedCopies,1);
  assert.equal(x.provenNecessaryConditionFailures,1);
  assert.equal(x.remainingUnresolvedCopies,0);
  assert.deepEqual(x.rows[0].necessaryBlockers,[
    'printed-prize:public-prize-prerequisite-failed'
  ]);
  assert.equal(x.rows[0].paperPlayable,false);
  assert.equal(x.rows[0].printedPrizeCertificate.exactSourceCardId,
    'jp/M4/72');
  assert.deepEqual(v,before);
});

test('M4 public threshold satisfied at three remains UNKNOWN paper playability',()=>{
  for(const opponentPrizes of [0,1,2,3]){
    const v=owner(['Special Red Card M4'],opponentPrizes);
    const x=screenOwnerTrainerPaperNecessity(v,[row(v.ownHand[0])]);
    assert.equal(x.provenNecessaryConditionFailures,0);
    assert.equal(x.remainingUnresolvedCopies,1);
    assert.equal(x.rows[0].paperPlayable,null);
    assert.equal(x.rows[0].printedPrizePrerequisite,
      'public-prize-predicate-satisfied-other-conditions-unknown');
  }
  for(const opponentPrizes of [4,5,6]){
    const v=owner(['Special Red Card M4'],opponentPrizes);
    const x=screenOwnerTrainerPaperNecessity(v,[row(v.ownHand[0])]);
    assert.equal(x.provenNecessaryConditionFailures,1);
  }
});

test('unknown Japanese set alias and concealed rival data cannot influence proof',()=>{
  const v=owner(['Special Red Card M4'],6);
  const withHidden=owner(['Special Red Card M4'],6);
  Object.defineProperty(withHidden,'opponentDeck',{get(){
    throw Error('Must never inspect concealed opponent deck');
  }});
  withHidden.opponentHand=['PRIVATE'];
  assert.deepEqual(
    screenOwnerTrainerPaperNecessity(v,[row('Special Red Card M4')]),
    screenOwnerTrainerPaperNecessity(withHidden,[row('Special Red Card M4')])
  );
  const notRegistered=owner(['Special Red Card M4 106'],6);
  const x=screenOwnerTrainerPaperNecessity(notRegistered,[
    row('Special Red Card M4 106')
  ]);
  assert.equal(x.provenNecessaryConditionFailures,0);
  assert.equal(x.rows[0].printedPrizePrerequisite,'not-modeled');
  assert.equal(x.rows[0].paperPlayable,null);
});
