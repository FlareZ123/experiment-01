'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stageCopycat}=require('./agent46-mimikyu-apex-copycat-native.cjs');
const {initializeCards}=require('./headless.cjs');

const BASE=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=p=>require(path.join(BASE,p));
const {AttackAction}=native('game/store/actions/game-actions');
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');

/**
 * Execute the real original Regidrago VSTAR Apex Dragon Store attack and its
 * own native choose-attack prompt, then immediately let Mimikyu use Copycat.
 * Source was staged as already-evolved/funded, avoiding hypothetical deck
 * search, and both physical cards remain present in the original native Store.
 *
 * @param {0|1} seat Mimikyu source physical seat.
 * @param {{chooseMimikyuTimeless?:boolean}} [options] Opt-in second source prompt resolution.
 * @returns {object} Actual two consecutive native attacks and history.
 */
function runSeat(seat,options={}){
  const s=stageCopycat(seat,'apex'),x=s.x,manager=initializeCards();
  let id=950001;
  const make=fullName=>{
    const c=manager.getCardByName(fullName);
    assert.ok(c,fullName);
    c.id=id++;
    return c;
  };
  x.state.playerLastAttack={};
  x.state.lastAttack=undefined;
  x.state.activePlayer=1-seat;
  x.state.turn=2;
  const energyOne=make('Double Dragon Energy ROS');
  const energyTwo=make('Double Dragon Energy ROS');
  x.opponent.active.cards.push(energyOne,energyTwo);
  x.opponent.active.energies.cards.push(energyOne,energyTwo);
  const usedDragon=make('Dialga-GX UPR');
  x.opponent.discard.cards.push(usedDragon);
  if(typeof options.beforeApex==='function')
    options.beforeApex({x,usedDragon,sourceEnergy:[energyOne,energyTwo]});

  const history=[];
  let error=null;
  let seenChoose=false;
  let usedOriginalApex=false;
  let lastRecorded=null;
  let sourceHandAfterApex=null;
  let sourceDeckAfterApex=null;
  try{
    x.store.dispatch(new AttackAction(x.opponent.id,'Apex Dragon'));
    usedOriginalApex=true;
    for(let i=0;i<20;i++){
      const pending=x.state.prompts.find(p=>p.result===undefined);
      if(!pending)break;
      const family=pending.constructor.name;
      let answer;
      if(family==='ChooseAttackPrompt'){
        seenChoose=true;
        const ci=pending.cards.findIndex(c=>c===usedDragon);
        assert.ok(ci>=0,'Printed Dragon owner discard target must be offered');
        answer={index:ci,attack:'Overclock'};
      }else if(family==='WaitPrompt')answer=null;
      else if(family==='ShowCardsPrompt')answer=true;
      else throw Error('Unresolved genuine source prompt: '+family);
      x.store.dispatch(new ResolvePromptAction(pending.id,answer));
      const last=x.state.playerLastAttack?.[x.opponent.id];
      history.push({during:'source-apex',resolved:family,
        recordedLastAttack:last?.attack?.name??null,
        recordedSource:last?.sourceCard?.fullName??null,
        activeSeat:x.state.activePlayer,globalTurn:x.state.turn});
    }
    sourceHandAfterApex=x.opponent.hand.cards.length;
    sourceDeckAfterApex=x.opponent.deck.cards.length;
    const last=x.state.playerLastAttack?.[x.opponent.id];
    lastRecorded={attack:last?.attack?.name??null,
      source:last?.sourceCard?.fullName??null,
      copycatAttack:last?.attack?.copycatAttack===true,
      gxAttack:last?.attack?.gxAttack===true};
    assert.equal(x.state.prompts.filter(p=>p.result===undefined).length,0);
    // If the previous attack ended normally, original owner Mimikyu is now
    // the attacking side. Only then can an actual follow-up Copycat run.
    if(x.state.activePlayer===seat &&
       x.state.phase===x.GamePhase.PLAYER_TURN){
      x.store.dispatch(new AttackAction(x.owner.id,'Copycat'));
      for(let i=0;i<16;i++){
        const pending=x.state.prompts.find(p=>p.result===undefined);
        if(!pending)break;
        const family=pending.constructor.name;
        history.push({during:'mimikyu-copycat',pending:family,
          activeSeat:x.state.activePlayer,globalTurn:x.state.turn});
        if(family==='ChooseAttackPrompt'&&options.chooseMimikyuTimeless===true){
          const ci=pending.cards.findIndex(c=>
            c.fullName==='Dialga-GX UPR');
          assert.ok(ci>=0,
            'Native nested Apex should offer owner discarded Dragon Dialga GX');
          x.store.dispatch(new ResolvePromptAction(pending.id,
            {index:ci,attack:'Timeless-GX'}));
          history.push({during:'mimikyu-copycat',
            resolved:'ChooseAttackPrompt',chosen:'Timeless-GX',
            activeSeat:x.state.activePlayer,globalTurn:x.state.turn});
          continue;
        }
        if(family!=='WaitPrompt')break;
        x.store.dispatch(new ResolvePromptAction(pending.id,null));
      }
    }
  }catch(e){error=String(e?.stack??e).slice(0,3500);}
  const nativePending=x.state.prompts.filter(p=>p.result===undefined)
    .map(p=>p.constructor.name);
  const result={seat,error,sourceApexRootDispatched:usedOriginalApex,
    sourceChooseAttackPromptSeen:seenChoose,
    originalSourceLastAttackAfterResolvedApex:lastRecorded,
    sourceHandAfter:x.opponent.hand.cards.length,
    sourceHandImmediatelyAfterApex:sourceHandAfterApex,
    sourceDeckImmediatelyAfterApex:sourceDeckAfterApex,
    sourceActive:x.opponent.active.getPokemonCard()?.fullName,
    mimikyuActive:x.owner.active.getPokemonCard()?.fullName,
    mimikyuOwnerGXUsed:x.owner.usedGX===true,
    mimikyuOwnerTurnSkip:x.owner.usedTurnSkip===true,
    mimikyuOwnerTurnSkipClearArmed:x.owner.usedTurnSkipClearArmed===true,
    originalMimikyuDragonDiscard:x.owner.discard.cards.map(c=>c.fullName)
      .filter(n=>n==='Dialga-GX UPR'),
    mimikyuOpponentDamage:x.opponent.active.damage,
    nativePending,history,
    qualifiedCompetitiveGames:0,
    conclusionScope:'Staged but real two sequential native attacks; no natural opening or competitive policy'};
  console.log('AGENT46_MIMIKYU_APEX_CONSECUTIVE '+JSON.stringify(result));
  return result;
}
function run(){
  const out=[runSeat(0),runSeat(1)];
  return out;
}
if(require.main===module)run();
module.exports={runSeat,run};
