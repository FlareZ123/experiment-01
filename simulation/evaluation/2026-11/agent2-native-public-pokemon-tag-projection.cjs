'use strict';
/*
 * Actor-only, board-only provenance recovery of native Twinleaf Card.tags.
 * Pinned PokemonCard has NO subtypes property; the current generic
 * actor-observation-contract.cjs projects pokemon.subtypes and therefore
 * loses every native printed Pokemon category. This opt-in repair
 * only reads already face-up board cards, never deck/hand/Prize identities.
 *
 * No vendor or default actor-observation mutation; callers may choose to
 * insert this after actorObservation and before worker input.
 */
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const VERSION='agent2-native-board-tags-projection-v1';
const TAG_TO_SUBTYPE=Object.freeze({
 'VMAX':'VMAX','VSTAR':'VSTAR','V-UNION':'V-UNION',
 'Tag Team':'TAG TEAM','Mega ex':'MEGA','Mega EX':'Mega EX',
 'GX':'GX','ex':'ex','EX':'EX','V':'V',
 'Radiant':'Radiant','Break':'BREAK','Prism Star':'Prism Star'
});
function fail(code,detail){throw Object.assign(new Error(detail),{code});}
function isRecord(o){return o!==null&&typeof o==='object'&&!Array.isArray(o);}
function projectOne(liveSlot,visible,zone){
 const native=liveSlot?.getPokemonCard?.()??null;
 if((native===null)!==(visible===null||visible===undefined))
  fail('NATIVE_PUBLIC_TAG_BOARD_MISMATCH','Active or Bench occupancy mismatch: '+zone);
 if(native===null)return visible??null;
 if(typeof native.fullName!=='string'||visible?.printing!==native.fullName||
    !isRecord(visible.printed)||!Array.isArray(visible.printed.subtypes)||
    !Array.isArray(native.tags)||native.tags.some(t=>typeof t!=='string'))
  fail('NATIVE_PUBLIC_TAG_IDENTITY_MISMATCH','Printed board card mismatch: '+zone);
 const mapped=[];
 for(const tag of native.tags){
  const subtype=TAG_TO_SUBTYPE[tag];
  if(subtype!==undefined&&!mapped.includes(subtype))mapped.push(subtype);
 }
 const prior=visible.printed.subtypes;
 const merged=[...prior];
 for(const label of mapped)if(!merged.includes(label))merged.push(label);
 const printed=Object.freeze({
  ...visible.printed,subtypes:Object.freeze(merged)
 });
 return Object.freeze({...visible,printed});
}
function enrichNativePublicPokemonTags({
 state,observation,actorSeat,enginePin
}={}){
 if(enginePin!==PIN)fail('NATIVE_PUBLIC_TAG_PIN','Wrong native engine revision');
 if(!Number.isSafeInteger(actorSeat)||(actorSeat!==0&&actorSeat!==1)||
    observation?.actorSeat!==actorSeat||!Array.isArray(state?.players)||
    state.players.length!==2||
    !Number.isSafeInteger(state.phase)||state.phase<2)
  fail('NATIVE_PUBLIC_TAG_CONTEXT','Not a face-up actor board observation');
 const before=observation;
 const own=before.ownPublic,opp=before.opponentPublic;
 if(!isRecord(own)||!isRecord(opp))
  fail('NATIVE_PUBLIC_TAG_BOARD_MISMATCH','Missing actor/public board');
 function copyBoard(board,player,side){
  const liveBench=player?.bench;
  if(!Array.isArray(liveBench)||!Array.isArray(board.bench)||
     board.bench.length!==liveBench.length)
   fail('NATIVE_PUBLIC_TAG_BOARD_MISMATCH','Bench alignment differs on '+side);
  const active=projectOne(player.active,board.active,side+'.active');
  const bench=board.bench.map((visible,i)=>
   projectOne(liveBench[i],visible,side+'.bench.'+i));
  return Object.freeze({...board,active,bench:Object.freeze(bench)});
 }
 return Object.freeze({
  ...before,
  ownPublic:copyBoard(own,state.players[actorSeat],'own'),
  opponentPublic:copyBoard(opp,state.players[1-actorSeat],'opponent')
 });
}
module.exports={PIN,VERSION,TAG_TO_SUBTYPE,projectOne,enrichNativePublicPokemonTags};
