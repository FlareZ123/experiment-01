'use strict';

const assert=require('node:assert/strict');
const {chooseActorSingleSearch}=
  require('../agent41-actor-owner-single-search.cjs');
const {chooseMewGenesectQuickBallSearch}=
  require('./mew-genesect-quickball-search.cjs');

const VERSION='agent37-source-mew-ultraball-evolution-v1';
const MEW_V='Mew V FST';
const MEW_VMAX='Mew VMAX FST';
const ULTRA=new Set(['Ultra Ball MEG','Ultra Ball SVI','Ultra Ball SUM']);
const PROTECTED_PAYMENT=new Set([
  'Double Colorless Energy SUM','Secret Box TWM','Forest Seal Stone SIT',
  MEW_VMAX,MEW_V,'Genesect V FST'
]);

/**
 * A deliberately conservative public-board original-Mew evolution line.
 * Ultra Ball's two physical discard cards and deck search must still
 * resolve through the actual native Store and owner prompt validators.
 * No concealed deck or Prize access informs the root decision.
 * @param {object} view Detached original owner's root observation.
 * @returns {{kind:string,handIndex:number,printing:string}|null}
 */
function chooseMewUltraBallEvolutionRoot(view){
  assert.equal(view.decisionKind,'owner-root');
  const hand=view.ownHand;
  const own=view.ownPublic;
  const resources=view.ownTurnResources;
  const index=hand.findIndex(p=>ULTRA.has(p));
  if(index<0||!own||!resources||own.deckCount<1||
      resources.itemPlayLocked===true||
      resources.pokemonPlayLocked===true||
      hand.includes(MEW_VMAX)||
      view.globalTurn<3)return null;
  const board=[own.active,...own.bench];
  if(!board.some(p=>p?.printing===MEW_V)||
     board.some(p=>p?.printing===MEW_VMAX))return null;
  const payment=hand.filter((p,i)=>i!==index&&
    !ULTRA.has(p)&&!PROTECTED_PAYMENT.has(p));
  if(payment.length<2)return null;
  return {kind:'play-mew-ultra-ball',
    printing:hand[index],handIndex:index,policy:VERSION};
}

/**
 * Resolve Ultra Ball's genuinely offered Mew VMAX as a single chosen
 * physical printing, using the owner-visible deck search only. Quick
 * Ball can retain its independent prior Mew/Genesect priority.
 * @param {object} input Detached native owner search prompt.
 * @param {0|1} ownerSeat Physical original-source actor seat.
 * @param {{prioritizeQuickBall?:boolean}} [options]
 * @returns {object|null} Native owner prompt choice.
 */
function chooseMewUltraBallSearch(input,ownerSeat,options={}){
  assert.ok(ownerSeat===0||ownerSeat===1);
  const fallback=()=>options.prioritizeQuickBall===true?
    chooseMewGenesectQuickBallSearch(input,ownerSeat):
    chooseActorSingleSearch(input);
  const actor=input.actor,prompt=input.prompt;
  if(actor.actorSeat!==ownerSeat||prompt.source!=='own-deck'||
      prompt.message!=='CHOOSE_CARD_TO_HAND'||
      prompt.bundles!==undefined||
      !actor.ownPublic.resolvingSupporter.some(x=>ULTRA.has(x))){
    return fallback();
  }
  const board=[actor.ownPublic.active,...actor.ownPublic.bench];
  if(!board.some(p=>p?.printing===MEW_V)||
      board.some(p=>p?.printing===MEW_VMAX))return fallback();
  const card=prompt.offered.find(x=>
    x.printing===MEW_VMAX&&x.selectableAlone===true);
  return card?{indices:[card.index]}:fallback();
}

module.exports={VERSION,chooseMewUltraBallEvolutionRoot,
  chooseMewUltraBallSearch};
