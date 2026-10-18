'use strict';

const {DISTINCT_TOOLS,SOURCE_V} = require('./rank11-held-seal-opportunity.cjs');

/**
 * Owner-visible extended first-turn plan for the exact rank11 opponent list.
 * Required Basic Pokémon may be in play, held, or potentially searchable by
 * Battle VIP Pass. Deck availability must be checked at genuine own prompts.
 *
 * @param {object} state Pinned Store state.
 * @param {object} player Acting source player.
 * @param {0|1} seat Physical source seat.
 * @param {number} turnPhase GamePhase.PLAYER_TURN.
 * @returns {{vRoute:string,vName:string|null,tRoute:string,tool:string,
 *   freeBenchBefore:number,needsVip:boolean,requiredBenchPlaces:number}|null}
 */
function extendedHeldSealOpportunity(state,player,seat,turnPhase) {
  if (![1,2].includes(state.turn)||state.activePlayer!==seat||
      state.phase!==turnPhase||player.usedVSTAR) return null;
  const hand=player.hand.cards.map(card=>card.name);
  if (!hand.includes('Forest Seal Stone')||hand.includes('Boost Shake')||
      hand.filter(name=>name==='Garbodor').length>=2) return null;
  const tool=DISTINCT_TOOLS.find(name=>hand.includes(name))??
    (hand.filter(name=>name==='Forest Seal Stone').length>=2?
      'Forest Seal Stone':null);
  if(!tool) return null;
  const empty=player.bench.filter(slot=>!slot.getPokemonCard()).length+
    Math.max(0,5-player.bench.length);
  let vRoute=null;
  let vName=null;
  if(SOURCE_V.has(player.active.getPokemonCard()?.name)&&player.active.tools.length===0){
    vRoute='active';vName=player.active.getPokemonCard().name;
  } else {
    const benched=player.bench.find(slot=>SOURCE_V.has(slot.getPokemonCard()?.name)&&
      slot.tools.length===0);
    if(benched) {
      vRoute='bench';vName=benched.getPokemonCard().name;
    } else {
      vName=['Oranguru V','Crobat V'].find(name=>hand.includes(name))??null;
      vRoute=vName?'hand':'vip';
    }
  }
  const tRoute=player.bench.some(slot=>slot.getPokemonCard()?.name==='Trubbish'&&
    slot.tools.length===0)?'bench':hand.includes('Trubbish')?'hand':'vip';
  const newBasics=(vRoute==='active'||vRoute==='bench'?0:1)+(tRoute==='bench'?0:1);
  if(newBasics>empty || ((vRoute==='vip'||tRoute==='vip')&&
      !hand.includes('Battle VIP Pass')))return null;
  return {vRoute,vName,tRoute,tool,freeBenchBefore:empty,
    needsVip:vRoute==='vip'||tRoute==='vip',requiredBenchPlaces:newBasics};
}
module.exports={extendedHeldSealOpportunity};
