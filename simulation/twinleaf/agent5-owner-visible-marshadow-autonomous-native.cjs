'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {stageForcedActive}=require('./agent5-forced-active-marshadow-chain-native.cjs');
const {chooseMarshadowCounterRoot,chooseMarshadowFogTarget,VERSION}=
  require('./agent5-owner-visible-marshadow-chain-policy.cjs');

const LOAD=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(LOAD,name));
const SHADOW='Shadow Rider Calyrex V CRE';
const MARSHADOW='Marshadow UNB';
const THUNDER='Thunder Mountain Prism Star LOT';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * Resolve only the actual newly exposed and correctly owner-addressed native
 * prompts. Source owner decisions use a fresh allowed actor-only observation,
 * with offered searchable native cards and original prompt validation.
 * Opponent-facing disclosure and deterministic synthetic deck permutation
 * carry zero competitive decision authority.
 *
 * @param {object} x Genuine staged original native Store.
 * @returns {object[]}
 */
function resolveStagedNativePrompts(x){
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const audit=[];
  for(let n=0;n<32;n++){
    const prompt=x.state.prompts.find(p=>p.result===undefined);
    if(!prompt)return audit;
    const kind=prompt.constructor.name;
    let result=null,selected=null;
    if(kind==='ChooseCardsPrompt') {
      assert.equal(prompt.playerId,x.owner.id);
      assert.equal(prompt.cards,x.owner.deck);
      const view=actorObservation(x.state,x.seat);
      const offered=prompt.cards.cards.map(card=>({
        printing:card.fullName,
        permitted:prompt.validate([card])
      }));
      const name=chooseMarshadowFogTarget(view,offered);
      assert.equal(name,SHADOW);
      const card=prompt.cards.cards.find(c=>c.fullName===name);
      assert.ok(card&&prompt.validate([card]));
      selected=name;
      result=[card];
    } else if(kind==='ShowCardsPrompt') {
      assert.equal(prompt.playerId,x.opponent.id);
      assert.deepEqual(prompt.cards.map(c=>c.fullName),[SHADOW]);
      result=true;
    } else if(kind==='ShuffleDeckPrompt') {
      assert.equal(prompt.playerId,x.owner.id);
      result=Array.from({length:x.owner.deck.cards.length},
        (_,i)=>x.owner.deck.cards.length-1-i);
      assert.equal(prompt.validate(result,x.state),true);
    } else if(kind!=='WaitPrompt') {
      throw Error('Unsupported actual native prompt: '+kind);
    }
    x.store.dispatch(new ResolvePromptAction(prompt.id,result));
    audit.push({kind,seat:prompt.playerId===x.owner.id?x.seat:1-x.seat,
      chosenPrinting:selected,shuffleSize:kind==='ShuffleDeckPrompt'?
        result.length:null});
  }
  throw Error('Native prompt loop exceeded 32 stages');
}

/**
 * Translate one pure owner-visible source root into exact native action and
 * immediately submit it to the Store. Never report an action as accepted
 * without comparing postdispatch physical cards/board in the caller.
 * @param {object} x
 * @param {object} intent
 */
function dispatchOwnerIntent(x,intent){
  const {PlayerType,SlotType,PlayCardAction}=
    native('game/store/actions/play-card-action');
  const {RetreatAction,UseAbilityAction}=
    native('game/store/actions/game-actions');
  const hand=x.owner.hand.cards;
  const physical=intent.handIndex===undefined?null:hand[intent.handIndex];
  if(intent.handIndex!==undefined)
    assert.equal(physical?.fullName,intent.printing,
      'Actor-visible hand and actual native card index disagree');
  const active={player:PlayerType.BOTTOM_PLAYER,
    slot:SlotType.ACTIVE,index:0};
  const bench={player:PlayerType.BOTTOM_PLAYER,
    slot:SlotType.BENCH,index:intent.benchIndex??0};
  const item={player:PlayerType.ANY,
    slot:SlotType.BOARD,index:0};
  switch(intent.kind){
    case 'fog-search-shadow':
      x.store.dispatch(new PlayCardAction(x.owner.id,intent.handIndex,item));
      break;
    case 'bench-shadow':
      x.store.dispatch(new PlayCardAction(x.owner.id,intent.handIndex,bench));
      break;
    case 'attach-floatstone':
    case 'attach-psychic':
      x.store.dispatch(new PlayCardAction(x.owner.id,intent.handIndex,active));
      break;
    case 'retreat-marshadow':
      x.store.dispatch(new RetreatAction(x.owner.id,intent.benchIndex));
      break;
    case 'marshadow-resetting-hole':
      x.store.dispatch(new UseAbilityAction(x.owner.id,
        'Resetting Hole',bench));
      break;
    default:throw Error('Policy proposed unsupported native root '+intent.kind);
  }
}

/**
 * One staged owner decision program, with the same four scenarios as the
 * original native scripted proof, but every root and search choice comes
 * from a new actor-only policy call.
 *
 * @param {0|1} seat
 * @param {'floatstone'|'psychic-energy'} payment
 */
function runArm(seat,payment){
  const x=stageForcedActive(seat,payment);
  const initialRoot=actorObservation(x.state,seat);
  const firstTurn=x.state.turn;
  assert.equal(initialRoot.ownPublic.active.printing,MARSHADOW);
  const roots=[];
  let terminal=false;
  for(let n=0;n<8;n++){
    assert.equal(x.state.activePlayer,seat);
    assert.equal(x.state.turn,firstTurn);
    assert.equal(x.state.prompts.some(p=>p.result===undefined),false);
    const view=actorObservation(x.state,seat);
    const intent=chooseMarshadowCounterRoot(view);
    if(intent===null) {
      terminal=true;break;
    }
    const before={
      active:view.ownPublic.active?.printing??null,
      bench:view.ownPublic.bench.map(c=>c?.printing??null),
      hand:view.ownHand,
      stadium:view.opponentPublic.stadium
    };
    dispatchOwnerIntent(x,intent);
    const prompts=resolveStagedNativePrompts(x);
    const afterView=actorObservation(x.state,seat);
    roots.push({ordinal:n,intent,before,prompts,
      nativeBoardAfter:{
        ownerActive:afterView.ownPublic.active?.printing??null,
        ownerBench:afterView.ownPublic.bench.map(c=>c?.printing??null),
        ownDiscard:afterView.ownPublic.discard,
        opponentStadium:afterView.opponentPublic.stadium,
        opponentLostZone:afterView.opponentPublic.lostZone
      }});
  }
  assert.equal(terminal,true,'Policy did not stop after the five-root sequence');
  const names=roots.map(r=>r.intent.kind);
  assert.deepEqual(names,['fog-search-shadow','bench-shadow',
    payment==='floatstone'?'attach-floatstone':'attach-psychic',
    'retreat-marshadow','marshadow-resetting-hole']);
  assert.equal(x.owner.active.getPokemonCard()?.fullName,SHADOW);
  assert.equal(x.owner.bench[0].getPokemonCard(),undefined);
  assert.ok(x.owner.discard.cards.some(c=>c.fullName===MARSHADOW));
  assert.equal(x.opponent.stadium.cards.some(c=>c.fullName===THUNDER),false);
  assert.ok(x.opponent.lostzone.cards.some(c=>c.fullName===THUNDER));
  assert.equal(x.opponent.discard.cards.some(c=>c.fullName===THUNDER),false);
  assert.equal(x.state.activePlayer,seat);
  assert.equal(x.state.turn,firstTurn);
  const resource=payment==='floatstone'?'Float Stone BKT':'Psychic Energy SVE';
  assert.ok(x.owner.discard.cards.some(c=>c.fullName===resource));
  return {seat,payment,success:true,policyVersion:VERSION,
    nativeRootCount:roots.length,roots,
    originalTurnPreserved:true,
    finalActive:x.owner.active.getPokemonCard()?.fullName,
    ownerDiscard:x.owner.discard.cards.map(c=>c.fullName),
    opponentLostZone:x.opponent.lostzone.cards.map(c=>c.fullName)};
}
function run(){
  const rows=[];
  for(const seat of [0,1]) {
    for(const payment of ['floatstone','psychic-energy']) {
      try{rows.push(runArm(seat,payment));}
      catch(error){rows.push({seat,payment,
        success:false,error:String(error?.stack??error)});}
    }
  }
  return {schema:'agent5-owner-visible-marshadow-native-five-root-policy-v1',
    enginePin:PIN,policyVersion:VERSION,
    preregistration:
      'results/aichi-2026/registrations/agent5-marshadow-owner-visible-native-policy-20261102.md',
    attemptedArms:4,actualNativePolicySuccesses:rows.filter(r=>r.success).length,
    rows,competitiveQualifiedGames:0,
    caveat:'Staged independent native Stores, pure owner/public tactical proposals and native prompts; no original sixty natural deal, opponent decisions or paper clock.'};
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={resolveStagedNativePrompts,dispatchOwnerIntent,runArm,run};
