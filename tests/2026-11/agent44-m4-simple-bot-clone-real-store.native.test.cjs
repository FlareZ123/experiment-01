'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards,deckPermutation}=
  require('../../simulation/twinleaf/headless.cjs');
const {withM4PaperOwnerRoot}=
  require('../../simulation/twinleaf/agent44-m4-owner-root-preselection.cjs');
const {dispatchSpecialRedCardPaperRoot}=
  require('../../simulation/twinleaf/agent44-special-red-card-empty-hand-hook.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const {SimpleTacticsAi}=require(path.join(output,'simple-bot/simple-tactics-ai'));
const {PlayTrainerTactic}=
  require(path.join(output,'simple-bot/simple-tactics/play-trainer-tactic'));
const definitions=require(path.join(output,'simple-bot/simple-bot-definitions'));
const {BotFlipMode,BotShuffleMode}=require(path.join(output,'game/bots/bot-arbiter'));
const {PlayCardAction,PlayerType,SlotType}=
  require(path.join(output,'game/store/actions/play-card-action'));
const {SpecialRedCard}=
  require(path.join(output,'sets/11-mega-evolution/set-chaos-rising/special-red-card'));

const target={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};

/** Force the same legal Item through the real bot's second validation clone. */
class ForceM4Tactic {
  /** @param {object} state @param {object} player */
  useTactic(state,player) {
    const index=player.hand.cards.findIndex(c=>c.fullName==='Special Red Card M4');
    return index<0?undefined:new PlayCardAction(player.id,index,target);
  }
}

/** @param {0|1} seat @param {number} prizes @param {number} count */
function fixture(seat,prizes,count) {
  const x=stage(seat),manager=initializeCards();
  const m4=manager.getCardByName('Special Red Card M4');
  assert.ok(m4);
  m4.id=990100+seat;
  x.owner.hand.cards.unshift(m4);
  for(let i=prizes;i<6;i++)x.opponent.prizes[i].moveTo(x.opponent.deck);
  const names=['Psychic Energy SVE','Double Dragon Energy ROS','Fog Crystal CRE'];
  for(let i=0;i<count;i++){
    const card=manager.getCardByName(names[i]);
    assert.ok(card,names[i]);
    card.id=990200+seat*10+i;
    x.opponent.hand.cards.push(card);
  }
  assert.equal(x.opponent.prizes.filter(p=>p.cards.length).length,prizes);
  assert.equal(x.opponent.hand.cards.length,count);
  return {...x,m4,heldNames:x.opponent.hand.cards.map(c=>c.fullName)};
}

/** @param {object} x */
function bot(x) {
  const options={
    tactics:[PlayTrainerTactic,ForceM4Tactic],
    promptResolvers:definitions.allPromptResolvers,
    scores:definitions.defaultStateScores,
    arbiter:{flipMode:BotFlipMode.RANDOM,shuffleMode:BotShuffleMode.RANDOM}
  };
  return new SimpleTacticsAi({id:x.owner.id},options,null);
}

for(const seat of [0,1]){
  test('actual SimpleTacticsAi M4 scores, validates, and physically settles, seat '+seat,()=>{
    const x=fixture(seat,3,3),agent=bot(x);
    const beforeDeckLength=x.opponent.deck.cards.length;
    const originalHand=x.heldNames.slice();
    const originalReduce=SpecialRedCard.prototype.reduceEffect;
    const policyDraws=[];
    const physicalDraws=[];
    let reducerCalls=0;
    SpecialRedCard.prototype.reduceEffect=function(...args){
      reducerCalls++;
      return originalReduce.apply(this,args);
    };
    try {
      const audit=[];
      const selected=withM4PaperOwnerRoot(x.store.state,seat,
        ()=>agent.decodeNextAction(x.store.state),a=>audit.push(a),
        ()=>{policyDraws.push(0);return 0;});
      assert.ok(selected instanceof PlayCardAction,
        'The bot must return a native M4 Item selection');
      assert.equal(selected.handIndex,0);
      assert.equal(audit.length,1);
      assert.equal(audit[0].speculativeShuffleHookInstalled,true);
      assert.ok(reducerCalls>=2,
        'Both candidate scoring and final action validation must simulate M4');
      assert.equal(policyDraws.length,reducerCalls*2,
        'Each speculative 3-card permutation must use the actor policy stream');
      assert.equal(x.store.state.players[seat].hand.cards[0],x.m4,
        'Speculative evaluation must leave the physical M4 in hand');
      assert.deepEqual(x.store.state.players[1-seat].hand.cards
        .map(c=>c.fullName),originalHand,
      'Speculative evaluation must not alter the real opponent hand');
      assert.equal(x.store.state.players[1-seat].deck.cards.length,
        beforeDeckLength,'Speculative evaluation must not alter real deck');

      const expectedBottom=deckPermutation(3,()=>0).map(i=>originalHand[i]);
      const callsBeforePhysical=reducerCalls;
      const drawsBeforePhysical=policyDraws.length;
      dispatchSpecialRedCardPaperRoot(x.store,selected,()=>{
        physicalDraws.push(0);
        return 0;
      });
      assert.equal(reducerCalls,callsBeforePhysical+1,
        'Real Store executes one further paper-correct M4 reducer');
      assert.equal(policyDraws.length,drawsBeforePhysical,
        'Real Store dispatch does not consume the actor policy RNG');
      assert.equal(physicalDraws.length,2,
        'Physical M4 shuffle consumes affected-hand-owner physical RNG');
      const opponent=x.store.state.players[1-seat];
      assert.deepEqual(opponent.deck.cards.slice(-3).map(c=>c.fullName),
        expectedBottom);
      assert.equal(opponent.hand.cards.length,3,
        'M4 draws three replacement cards after bottoming previous hand');
      assert.equal(opponent.deck.cards.length,beforeDeckLength,
        'Putting three on bottom then drawing three preserves deck count');
      console.log('AGENT44_M4_BOT_CLONE_AND_REAL_STORE',JSON.stringify({
        seat,clones:callsBeforePhysical,
        policyDraws:drawsBeforePhysical,physicalDraws:physicalDraws.length,
        selectedItem:'Special Red Card M4',stagedOnly:true,
        competitivelyQualifiedGames:0
      }));
    }finally{
      assert.equal(SpecialRedCard.prototype.reduceEffect!==originalReduce,true,
        'Test-controlled reducer wrapper must still be installed');
      SpecialRedCard.prototype.reduceEffect=originalReduce;
    }
  });
  for(const [prizes,handSize,reason] of [[3,0,'empty hand'],[4,3,'more than three Prizes']]){
    test('actual SimpleTacticsAi M4 cannot select '+reason+', seat '+seat,()=>{
      const x=fixture(seat,prizes,handSize),agent=bot(x),draws=[];
      const selected=withM4PaperOwnerRoot(x.store.state,seat,
        ()=>agent.decodeNextAction(x.store.state),undefined,
        ()=>{draws.push(0);return 0;});
      assert.notEqual(selected?.constructor?.name,'PlayCardAction',
        'No M4 native Store action may escape the public paper gate');
      assert.equal(draws.length,0,'Ineligible M4 must never shuffle any hand');
      assert.equal(x.store.state.players[seat].hand.cards[0],x.m4);
    });
  }
}
