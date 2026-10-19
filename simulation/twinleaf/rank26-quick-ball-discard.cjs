'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Identify an owner-visible first-turn Quick Ball discard-cost card.
 * @param {object} state Native current state.
 * @param {object} own Acting source player.
 * @param {0|1} seat Source seat.
 * @param {object} prompt Actual pending owner-hand prompt.
 * @param {number} phase Native player turn phase.
 * @returns {object|null} Iono card reference or null.
 */
function preferredQuickBallIonoCost(state,own,seat,prompt,phase){
  if(state.turn!==1||state.activePlayer!==seat||state.phase!==phase||
    state.players[seat]!==own||
    prompt?.constructor?.name!=='ChooseCardsPrompt'||
    prompt.playerId!==own.id||prompt.cards===own.deck||
    !prompt.cards?.cards?.every(card=>own.hand.cards.includes(card))||
    !own.hand.cards.some(card=>card.name==='Dowsing Machine'))return null;
  const iono=prompt.cards.cards.find(card=>card.name==='Iono');
  return iono&&prompt.validate([iono],state)===true?iono:null;
}

/**
 * @template T
 * @param {0|1} seat Physical source seat.
 * @param {()=>T} execute Synchronous compiled source match.
 */
function withRank26QuickBallIonoCost(seat,execute){
  if(![0,1].includes(seat)||typeof execute!=='function')
    throw new TypeError('Source seat and synchronous match required');
  const load=file=>require(path.join(OUTPUT,file));
  const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {GamePhase}=load('game/store/state/state');
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const id=seat===0?101:202;
  const events=[];
  let armed=false;
  const override=function rank26QuickBallIonoCost(state){
    const own=state.players[seat];
    if(this.client?.id!==id||!own)return original.call(this,state);
    const prompt=state.prompts.find(p=>p.result===undefined);
    if(armed&&prompt){
      if(prompt.cards===own.deck)armed=false;
      else{
        const iono=preferredQuickBallIonoCost(state,own,seat,prompt,GamePhase.PLAYER_TURN);
        if(iono){
          events.push({kind:'cost-chosen',card:iono.fullName,turn:state.turn,
            sourceSeat:seat,promptId:prompt.id});
          return new ResolvePromptAction(prompt.id,[iono]);
        }
      }
    }
    const action=original.call(this,state);
    if(!prompt){
      armed=state.turn===1&&state.activePlayer===seat&&
        state.phase===GamePhase.PLAYER_TURN&&
        action?.type==='PLAY_CARD_ACTION'&&
        own.hand.cards[action.handIndex]?.name==='Quick Ball';
      if(armed)events.push({kind:'quick-ball-root',
        turn:state.turn,sourceSeat:seat,
        card:own.hand.cards[action.handIndex].fullName});
    }
    return action;
  };
  SimpleTacticsAi.prototype.decodeNextAction=override;
  try{
    return {result:execute(),audit:{
      version:'rank26-firstturn-quick-ball-Iono-cost-v1',
      sourceSeat:seat,events,competitiveGameQualified:false
    }};
  }finally{
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,override,
      'Quick Ball source-discard wrapper unexpectedly replaced');
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}
module.exports={preferredQuickBallIonoCost,withRank26QuickBallIonoCost};
