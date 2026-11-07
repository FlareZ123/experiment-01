'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stageCopycat,probe}=
  require('./agent46-mimikyu-apex-copycat-native.cjs');
const {withMimikyuApexPaperHypothesis}=
  require('./agent46-mimikyu-apex-paper-hook.cjs');

const BASE=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=p=>require(path.join(BASE,p));
const {AttackAction}=native('game/store/actions/game-actions');
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');

/**
 * Resolve an opt-in exact-source nested attack in the real pinned Store.
 * Mimikyu already has its two printed Psychic/Colorless Energy units; both
 * players' deck/prizes and the owner's discarded Dragon Dialga GX are real.
 * The only synthetic input is the previous opponent non-GX Apex attack record.
 *
 * @param {0|1} seat Real physical seat.
 * @returns {object} Native prompted choice, damage, GX and turn handling.
 */
function hookedTrial(seat){
  const s=stageCopycat(seat,'apex'),x=s.x;
  const events=[];
  let error=null;
  let choseTimeless=false;
  try{
    x.store.dispatch(new AttackAction(x.owner.id,'Copycat'));
    for(let i=0;i<24;i++){
      const p=x.state.prompts.find(item=>item.result===undefined);
      if(!p)break;
      const kind=p.constructor.name;
      let answer;
      if(kind==='ChooseAttackPrompt'){
        const index=p.cards.findIndex(c=>c===s.target);
        assert.ok(index>=0,
          'Only Dragon Dialga-GX UPR must be the eligible owned discard payload');
        answer=p.cards[index].attacks.find(a=>a.name==='Timeless-GX');
        assert.ok(answer);
        assert.equal(p.validate(answer),true,
          'Native source choice must be exact Attack object');
        choseTimeless=true;
      }else if(kind==='WaitPrompt')answer=null;
      else if(kind==='ShowCardsPrompt')answer=true;
      else if(kind==='ShuffleDeckPrompt'){
        answer=Array.from({length:x.owner.deck.cards.length},(_,i)=>i);
      }else{
        throw Error('Unhandled real native prompt: '+kind);
      }
      x.store.dispatch(new ResolvePromptAction(p.id,answer));
      events.push({resolved:kind,chosen:kind==='ChooseAttackPrompt'?'Timeless-GX':null,
        sourceActive:x.owner.active.getPokemonCard()?.fullName??null,
        damageToOpponent:x.opponent.active.damage,
        ownerGXUsed:x.owner.usedGX===true,
        ownerTurnSkip:x.owner.usedTurnSkip===true,
        activeSeat:x.state.activePlayer,
        pending:x.state.prompts.filter(q=>q.result===undefined)
          .map(q=>q.constructor.name)});
    }
  }catch(e){error=String(e?.stack??e).slice(0,3500);}
  return {seat,error,choseTimeless,
    ownerGXUsed:x.owner.usedGX===true,
    ownerTurnSkip:x.owner.usedTurnSkip===true,
    ownerTurnSkipClearArmed:x.owner.usedTurnSkipClearArmed===true,
    opponentDamage:x.opponent.active.damage,
    victimOwnerActive:x.owner.active.getPokemonCard()?.fullName??null,
    opponentActive:x.opponent.active.getPokemonCard()?.fullName??null,
    pendingPrompts:x.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    activePlayerAfter:x.state.activePlayer,
    globalTurnAfter:x.state.turn,phaseAfter:x.state.phase,
    timeline:events,
    sourcePrintedOwnDiscardTarget:s.target.fullName,
    qualifiedCompetitiveGames:0};
}

function run(){
  const rows=[];
  for(const seat of [0,1]){
    const control=probe(seat,'apex');
    assert.equal(control.error,null);
    assert.equal(control.opponentDamageAfter,0);
    const {result,audit}=withMimikyuApexPaperHypothesis(()=>hookedTrial(seat));
    assert.equal(audit.intercepts,1,
      'Exact original Mimikyu Apex source should trigger one delegated attempt');
    assert.equal(audit.restored,true,
      'Opt-in source hook must fully restore pinned constructor after trial');
    // These are exploratory logs; compare paper effect and game-state evidence
    // before making a win-rate or complete-rules claim.
    rows.push({seat,baseline:{damage:control.opponentDamageAfter,
      previousIsNonGx:true,offered:control.copiedAttackOffered},
      hookAudit:audit,patched:result});
  }
  const out={schema:'agent46-mimikyu-nongx-apex-nested-timeless-gx-native-v1',
    pin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceAttack:'Mimikyu GRI Copycat',
    opponentPreviousAttack:'Regidrago VSTAR SIT Apex Dragon (non-GX)',
    ownDragonDiscardPayload:'Dialga-GX UPR Timeless-GX',
    realPhysicalStore:true,
    previousAttackRecordSynthetic:true,
    optInResearchPrototypeOnly:true,
    qualifiedCompetitiveGames:0,rows};
  console.log('AGENT46_MIMIKYU_APEX_TIMELESS_NATIVE '+JSON.stringify(out));
  return out;
}
if(require.main===module)run();
module.exports={hookedTrial,run};
