'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stageCopycat}=
  require('./agent46-mimikyu-apex-copycat-native.cjs');
const {runSeat:consecutiveApex}=
  require('./agent46-mimikyu-apex-consecutive-native.cjs');
const {initializeCards}=require('./headless.cjs');

const BASE=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=part=>require(path.join(BASE,part));
const {AttackAction}=native('game/store/actions/game-actions');
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');

/**
 * Positive original attack control: the same physical opponent who attempts
 * Regidrago Apex uses printed Dialga-GX UPR's Overclock directly with one
 * Metal Energy and an eight-card deck. Both have zero cards in hand before
 * attacking. The original attack should fill the hand to six.
 *
 * @param {0|1} mimikyuSeat Mimikyu owner seat, opposite printed attacker.
 * @returns {object} Direct source attack physical hand/deck transitions.
 */
function directOverclock(mimikyuSeat){
  const x=stageCopycat(mimikyuSeat,'apex').x;
  const manager=initializeCards();
  let id=970001;
  const c=fullName=>{
    const card=manager.getCardByName(fullName);
    assert.ok(card,fullName);
    card.id=id++;
    return card;
  };
  x.opponent.active.cards.length=0;
  x.opponent.active.energies.cards.length=0;
  const dialga=c('Dialga-GX UPR'),metal=c('Metal Energy SVE');
  x.opponent.active.cards.push(dialga,metal);
  x.opponent.active.energies.cards.push(metal);
  x.state.playerLastAttack={};
  x.state.lastAttack=undefined;
  x.state.activePlayer=1-mimikyuSeat;
  x.state.turn=2;
  const beforeHand=x.opponent.hand.cards.length;
  const beforeDeck=x.opponent.deck.cards.length;
  const promptTypes=[];
  let error=null;
  try{
    x.store.dispatch(new AttackAction(x.opponent.id,'Overclock'));
    for(let i=0;i<12;i++){
      const p=x.state.prompts.find(q=>q.result===undefined);
      if(!p)break;
      promptTypes.push(p.constructor.name);
      assert.equal(p.constructor.name,'WaitPrompt',
        'Overclock needs no discretionary choice');
      x.store.dispatch(new ResolvePromptAction(p.id,null));
    }
  }catch(e){error=String(e?.stack??e).slice(0,2500);}
  return {mimikyuSeat,error,beforeHand,beforeDeck,
    afterHand:x.opponent.hand.cards.length,
    afterDeck:x.opponent.deck.cards.length,
    prompts:promptTypes,
    pending:x.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    printedSourceCard:dialga.fullName};
}

function run(){
  const rows=[];
  for(const seat of [0,1]){
    const direct=directOverclock(seat);
    assert.equal(direct.error,null);
    assert.equal(direct.beforeHand,0);
    assert.equal(direct.beforeDeck,8);
    assert.equal(direct.afterHand,6,
      'Direct printed Dialga GX Overclock should fill own hand to six');
    assert.equal(direct.afterDeck,2);
    const apex=consecutiveApex(seat);
    assert.equal(apex.error,null);
    assert.equal(apex.sourceChooseAttackPromptSeen,true);
    assert.equal(apex.originalSourceLastAttackAfterResolvedApex?.attack,
      'Apex Dragon');
    assert.equal(apex.sourceHandImmediatelyAfterApex,6,
      'Prompt-validated native Apex Overclock should draw to six');
    assert.equal(apex.sourceDeckImmediatelyAfterApex,2,
      'Copied Overclock should consume the same six cards as direct Overclock');
    rows.push({seat,direct,
      apex:{sourceChooseAttackPromptSeen:apex.sourceChooseAttackPromptSeen,
        lastAttack:apex.originalSourceLastAttackAfterResolvedApex,
        handImmediatelyAfterApex:apex.sourceHandImmediatelyAfterApex,
        deckImmediatelyAfterApex:apex.sourceDeckImmediatelyAfterApex,
        sourceTurnAfterMimikyu:apex.globalTurnAfter,
        nativeError:apex.error,
        sourcePromptSequence:apex.history.filter(h=>
          h.during==='source-apex')}});
  }
  const out={schema:'agent46-regidrago-apex-delegated-overclock-vs-direct-v1',
    nativeStore:true,sourceGameBoardStaged:true,
    selectedDragonCopiedAttack:'Dialga-GX UPR Overclock',
    noGXAttackInEitherBranch:true,
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    qualifiedCompetitiveGames:0,rows};
  console.log('AGENT46_APEX_OVERCLOCK_NATIVE '+JSON.stringify(out));
  return out;
}
if(require.main===module)run();
module.exports={directOverclock,run};
