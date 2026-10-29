'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent41-rank11-owner-pass-supporter-rescue-v1';
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const BLOCKED_CARMINE_COMPANIONS=new Set([
  'Garbodor','Boost Shake','Secret Box','Forest Seal Stone',
  'Muscle Band','Float Stone','Battle VIP Pass','Quick Ball'
]);

/**
 * The rank-11 opponent's owner-visible, strictly turn-limited Supporter
 * fallback. It is only considered when the already composed bot proposes
 * ending its turn, so higher-priority native legal lines retain control.
 * The policy never examines its opponent's hand, deck or Prize cards.
 *
 * @param {object} state Actual native Store state.
 * @param {object} source Acting source-side native Player.
 * @param {0|1} sourceSeat Known source physical seat.
 * @returns {{handIndex:number,card:string,reason:string}|null}
 */
function choosePassSupporter(state,source,sourceSeat){
  assert.ok(sourceSeat===0||sourceSeat===1);
  const {GamePhase}=require(path.join(output,'game/store/state/state'));
  if(state.activePlayer!==sourceSeat||
      state.phase!==GamePhase.PLAYER_TURN||
      state.prompts.some(p=>p.result===undefined)||
      source.supporterTurn!==0||
      source.cannotPlaySupporterCards||
      source.deck.cards.length===0)return null;

  const hand=source.hand.cards;
  if(hand.length===0)return null;
  const firstGoingFirst=state.turn===1;
  const eligibleMarnie=hand.findIndex(c=>c.fullName==='Marnie SSH');
  // Ordinary Supporters cannot be played in the opening player's first turn.
  if(!firstGoingFirst&&hand.length<=4&&eligibleMarnie>=0&&
      hand[eligibleMarnie].canPlay(null,state,source)===true){
    return {handIndex:eligibleMarnie,card:'Marnie',reason:'owner-low-hand-pass'};
  }

  const eligibleCarmine=hand.findIndex(c=>c.fullName==='Carmine TWM');
  if(eligibleCarmine<0||hand.length>2||
      hand.some((c,i)=>i!==eligibleCarmine&&
        BLOCKED_CARMINE_COMPANIONS.has(c.name))||
      hand[eligibleCarmine].canPlay(null,state,source)!==true)return null;
  return {handIndex:eligibleCarmine,card:'Carmine',
    reason:'owner-low-hand-no-protected-companion-pass'};
}

/**
 * Reversible native policy, rank-11 source seat only. A normal Card.canPlay
 * check and the paper-specific first-turn restriction both gate dispatch.
 * All rejected and unexposed opportunities remain diagnostics.
 * @template T
 * @param {0|1} sourceSeat
 * @param {()=>T} execute
 * @returns {{result:T,audit:object}}
 */
function withRank11SourcePassSupporter(sourceSeat,execute){
  assert.ok(sourceSeat===0||sourceSeat===1);
  assert.equal(typeof execute,'function');
  const {SimpleTacticsAi}=require(path.join(output,
    'simple-bot/simple-tactics-ai'));
  const {PassTurnAction}=require(path.join(output,
    'game/store/actions/game-actions'));
  const {PlayCardAction,PlayerType,SlotType}=require(path.join(output,
    'game/store/actions/play-card-action'));
  const previous=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof previous?.value,'function');
  const sourceId=sourceSeat===0?101:202;
  const actions=[];
  let sourcePassEvaluations=0;
  function patched(state){
    const baseline=previous.value.call(this,state);
    if(!(baseline instanceof PassTurnAction)||
        this.client?.id!==sourceId||
        state.activePlayer!==sourceSeat)return baseline;
    sourcePassEvaluations++;
    const source=state.players.find(p=>p.id===sourceId);
    if(!source)return baseline;
    const choice=choosePassSupporter(state,source,sourceSeat);
    if(!choice)return baseline;
    actions.push({turn:state.turn,sourceSeat,
      card:choice.card,reason:choice.reason,
      ownHandSize:source.hand.cards.length});
    return new PlayCardAction(sourceId,choice.handIndex,
      {player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...previous,value:patched});
  try{
    return {result:execute(),audit:{version:VERSION,sourceSeat,
      sourcePassEvaluations,issuedSupporters:actions,
      competitivePolicyQualified:false}};
  }finally{
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',previous);
  }
}

module.exports={VERSION,BLOCKED_CARMINE_COMPANIONS,
  choosePassSupporter,withRank11SourcePassSupporter};
