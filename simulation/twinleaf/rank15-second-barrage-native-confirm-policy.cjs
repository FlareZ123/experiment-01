'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Narrow, actor-owned Omega Barrage continuation gate, requiring the exact
 * observed original source Turn-16 post-Evolution public position.
 * This cannot access deck contents, Prize identities or opponent hand.
 * @param {object} state Pinned state, including pending actor prompt.
 * @param {object} actor Own public Bunnelby/Gloom position.
 * @param {0|1} seat Physical source seat.
 * @returns {object|null} The live native continuation confirmation prompt.
 */
function rank15SecondBarragePrompt(state,actor,seat) {
  if(state.turn!==16||state.activePlayer!==seat)return null;
  if(actor.active.getPokemonCard()?.fullName!=='Bunnelby PRC')return null;
  if(!actor.active.tools.some(c=>
    c.fullName==='Technical Machine: Evolution PAR')||
    actor.active.energies.cards.length===0)return null;
  if(actor.bench.filter(s=>s.getPokemonCard()?.fullName==='Gloom UNB')
    .length!==2)return null;
  const prompt=state.prompts.find(p=>p.result===undefined);
  if(!prompt||prompt.constructor.name!=='ConfirmPrompt'||
    prompt.playerId!==actor.id ||
    prompt.message!=='WANT_TO_USE_ABILITY')return null;
  if(!prompt.validate(true,state))return null;
  return prompt;
}

/**
 * Single real owner-visible confirmation choice after successful first TM
 * Evolution. Native Store, prompt and subsequent bot decisions remain intact.
 *
 * @template T
 * @param {()=>T} execute Match/other policy.
 * @param {0|1} sourceSeat Registered opponent seat.
 * @returns {{result:T,audit:object}}
 */
function withRank15SecondBarrageYes(execute,sourceSeat){
  assert.equal(typeof execute,'function');
  assert.ok(sourceSeat===0||sourceSeat===1);
  const {SimpleTacticsAi}=require(path.join(ROOT,
    'simple-bot/simple-tactics-ai'));
  const {ResolvePromptAction}=require(path.join(ROOT,
    'game/store/actions/resolve-prompt-action'));
  const original=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof original?.value,'function');
  const clientId=sourceSeat===0?101:202;
  let applied=false;
  const attempts=[];
  function chooseYes(state) {
    if(applied||this.client?.id!==clientId)
      return original.value.call(this,state);
    const player=state.players[sourceSeat];
    const prompt=rank15SecondBarragePrompt(state,player,sourceSeat);
    if(!prompt)return original.value.call(this,state);
    applied=true;
    attempts.push({
      turn:state.turn,promptId:String(prompt.id),
      message:prompt.message,
      sourceActive:player.active.getPokemonCard()?.fullName,
      benchedGloom:player.bench.filter(b=>
        b.getPokemonCard()?.fullName==='Gloom UNB').length,
      attachedTM:player.active.tools.map(c=>c.fullName),
      ownerChoice:true
    });
    return new ResolvePromptAction(prompt.id,true);
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...original,value:chooseYes});
  try{return {result:execute(),audit:{
    schema:'rank15-post-first-tm-native-barrage-confirm-yes-v1',
    attempts,competitivePolicyQualified:false
  }};}
  finally{Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',original);}
}

module.exports={rank15SecondBarragePrompt,withRank15SecondBarrageYes};
