'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Read only face-up board and publicly attached Energy.
 * This is a necessary-resource census, not a legal attack announcement.
 * @param {object} state Genuine postdispatch Store state.
 * @param {0|1} mewSeat Original rank-5 owner.
 */
function publicMirrorOpportunity(state,mewSeat){
  const owner=state.players[mewSeat],opponent=state.players[1-mewSeat];
  const active=owner.active.getPokemonCard()?.fullName??null;
  const bench=owner.bench.map(slot=>slot.getPokemonCard()?.fullName??null);
  const opponentActive=opponent.active.getPokemonCard()?.fullName??null;
  const attached=owner.active.energies.cards.map(card=>card.fullName);
  const dual=active==='Mew VMAX FST'&&bench.includes('Mew VMAX FST');
  const paid=attached.includes('Double Colorless Energy SUM');
  const pal97=opponentActive==='Mimikyu PAL';
  const prompt=state.prompts.find(p=>p.result===undefined);
  const offered=prompt?.constructor.name==='ChooseAttackPrompt'&&
    prompt.playerId===owner.id&&
    prompt.cards?.some(card=>card.fullName==='Mew VMAX FST'&&
      card.attacks?.some(attack=>attack.name==='Max Miracle'&&
        !prompt.options?.blocked?.some(b=>b.attack==='Max Miracle')));
  return {active,bench,opponentActive,attached,
    dual,paid,pal97,allPublicBoardPieces:dual&&paid&&pal97,
    offeredMaxMiracle:Boolean(offered)};
}

/**
 * Trace post-accepted real Store states. Store reference identity excludes
 * hypothetical bot simulations; no hidden hand, deck or Prize is read.
 * @template T
 * @param {()=>T} run Execute one source-dealt original-vs-original game.
 * @param {0|1} mewSeat Physical seat of rank-5 Mew.
 * @param {{Store?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withPublicMirrorObserver(run,mewSeat,deps={}){
  assert.ok(mewSeat===0||mewSeat===1);
  const Store=deps.Store??require(path.join(ROOT,'game/store/store')).Store;
  const before=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof before?.value,'function');
  const audit={seenStoreActions:0,realTurnsObserved:0,
    dualBoard:0,dualWithDce:0,dualVsPal:0,fullPublicBoard:0,
    actualOfferedMirror:0,first:{},publicSnapshots:[],
    refusedHiddenReads:true,competitiveQualifiedGames:0};
  let real=null;
  function dispatch(action,...args){
    const result=before.value.apply(this,[action,...args]);
    if(action?.constructor?.name==='AddPlayerAction')real=this;
    const state=this.state;
    if(this!==real||state?.players?.length!==2)return result;
    audit.seenStoreActions++;
    // Setup boards are face-down, so never treat those choices as public.
    if(state.phase!==3)return result; // GamePhase.PLAYER_TURN in pinned Store.
    audit.realTurnsObserved++;
    const view=publicMirrorOpportunity(state,mewSeat);
    const flags={
      dualBoard:view.dual,
      dualWithDce:view.dual&&view.paid,
      dualVsPal:view.dual&&view.pal97,
      fullPublicBoard:view.allPublicBoardPieces,
      actualOfferedMirror:view.allPublicBoardPieces&&view.offeredMaxMiracle
    };
    for(const [name,yes] of Object.entries(flags)){
      if(!yes)continue;
      audit[name]++;
      if(!audit.first[name])audit.first[name]={
        turn:state.turn,action:action.constructor?.name??null,
        active:view.active,bench:view.bench,
        opposingActive:view.opponentActive,
        attached:view.attached
      };
    }
    if(view.dual&&audit.publicSnapshots.length<8&&
       !audit.publicSnapshots.some(x=>x.turn===state.turn&&
         x.opposingActive===view.opponentActive)){
      audit.publicSnapshots.push({turn:state.turn,
        active:view.active,bench:view.bench,
        opposingActive:view.opponentActive,attached:view.attached});
    }
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...before,value:dispatch});
  try{return {result:run(),audit};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',before);
  }
}
module.exports={publicMirrorOpportunity,withPublicMirrorObserver};
