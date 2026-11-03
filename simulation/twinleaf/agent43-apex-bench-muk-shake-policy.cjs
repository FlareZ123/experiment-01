'use strict';

const path = require('node:path');
const BASE = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * A deliberately narrow K0 owner-visible Apex Alchemy candidate action.
 * The only starting board accepted has Regidrago V Active and a Grimer
 * already on Bench. Muk may be discovered only after an actual owner
 * deck-search prompt; no opponent hidden zones or opponent Prize faces.
 * @param {{turn:number,activeName:string|null,benchNames:(string|null)[],handNames:string[],itemLocked:boolean,pending:boolean}} view
 * @returns {boolean}
 */
function shouldOfferHeldBenchMukShake(view) {
  return (view.turn === 1 || view.turn === 2)
    && !view.itemLocked && !view.pending
    && view.activeName === 'Regidrago V'
    && view.benchNames.includes('Alolan Grimer')
    && !view.benchNames.includes('Alolan Muk')
    && view.handNames.includes('Boost Shake');
}

/**
 * Native actual owner-Stack root and search/evolve/shuffle prompt continuation.
 * Default-off experimental policy, transparent to opposing actor. It only
 * inspects own K1 deck after native owner search has authorized that view.
 *
 * @template T
 * @param {()=>T} execute Synchronous pinned Store execution.
 * @returns {{result:T,audit:object}}
 */
function withApexBenchMukShake(execute) {
  const {SimpleTacticsAi} = require(path.join(BASE, 'simple-bot/simple-tactics-ai'));
  const {PlayCardAction, PlayerType, SlotType} =
    require(path.join(BASE, 'game/store/actions/play-card-action'));
  const {ResolvePromptAction} =
    require(path.join(BASE, 'game/store/actions/resolve-prompt-action'));
  const {GamePhase} = require(path.join(BASE, 'game/store/state/state'));
  const original = SimpleTacticsAi.prototype.decodeNextAction;
  const flows = new Map();
  const audit = {version:'agent43-apex-bench-muk-shake-v1',
    bothPhysicalSeats:true, ownerK0OnlyAtRoot:true,
    ownerK1OnlyDuringNativeSearch:true, opponentHiddenZonesRead:false,
    roots:[],prompts:[],complete:[],failures:[],qualifiedGames:0};

  /** @param {number} seat @param {object} state @param {string} reason */
  function fail(seat,state,reason) {
    flows.set(seat,{stage:'failed'});
    audit.failures.push({seat,turn:state.turn,reason});
  }
  SimpleTacticsAi.prototype.decodeNextAction = function(state) {
    const seat=state.players.findIndex(p=>p.id===this.client?.id);
    if(seat<0)return original.call(this,state);
    const owner=state.players[seat];
    const pending=state.prompts.find(p=>p.result===undefined);
    const flow=flows.get(seat);
    if(flow?.stage==='failed'||flow?.stage==='done')return original.call(this,state);

    if(!flow) {
      const view={
        turn:state.turn,
        activeName:owner.active.getPokemonCard()?.name??null,
        benchNames:owner.bench.map(x=>x.getPokemonCard()?.name??null),
        handNames:owner.hand.cards.map(x=>x.name),
        itemLocked:owner.cannotPlayItemCards===true,
        pending:Boolean(pending)
      };
      if(state.activePlayer!==seat||
         state.phase!==GamePhase.PLAYER_TURN||
         !shouldOfferHeldBenchMukShake(view))return original.call(this,state);
      const handIndex=owner.hand.cards.findIndex(c=>c.name==='Boost Shake');
      if(handIndex<0)return original.call(this,state);
      flows.set(seat,{stage:'muk-search'});
      audit.roots.push({seat,turn:state.turn,handIndex,
        activeName:view.activeName,benchNames:view.benchNames});
      return new PlayCardAction(owner.id,handIndex,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      });
    }

    if(!pending) {
      if(state.activePlayer!==seat&&flow.stage==='end-turn') {
        flows.set(seat,{stage:'done'});
        audit.complete.push({seat,turn:state.turn,
          nowActiveSeat:state.activePlayer});
      }
      return original.call(this,state);
    }
    if(pending.playerId!==owner.id)return original.call(this,state);
    if(flow.stage==='muk-search'&&
       pending.constructor?.name==='ChooseCardsPrompt') {
      if(pending.cards!==owner.deck) {
        fail(seat,state,'NATIVE_K1_OWNER_DECK_NOT_MATCHED');
        return original.call(this,state);
      }
      const muk=owner.deck.cards.find(c=>c.name==='Alolan Muk');
      if(!muk||pending.validate([muk],state)!==true) {
        fail(seat,state,'MUK_NOT_AVAILABLE_AFTER_K1');
        return original.call(this,state);
      }
      flows.set(seat,{stage:'grimer-target'});
      audit.prompts.push({seat,kind:'owner-deck-Muk-K1',
        mukPhysicalId:muk.id});
      return new ResolvePromptAction(pending.id,[muk]);
    }
    if(flow.stage==='grimer-target'&&
       pending.constructor?.name==='ChoosePokemonPrompt') {
      const grimer=owner.bench.find(x=>
        x.getPokemonCard()?.name==='Alolan Grimer');
      if(!grimer||pending.validate([grimer],state)!==true) {
        fail(seat,state,'NATIVE_GRIMER_TARGET_INVALID');
        return original.call(this,state);
      }
      flows.set(seat,{stage:'shuffle'});
      audit.prompts.push({seat,kind:'owner-Bench-Grimer-evolution',
        grimerPhysicalId:grimer.getPokemonCard()?.id});
      return new ResolvePromptAction(pending.id,[grimer]);
    }
    if(flow.stage==='shuffle'&&
       pending.constructor?.name==='ShuffleDeckPrompt') {
      const indices=owner.deck.cards.map((_,i)=>i);
      if(pending.validate(indices,state)!==true) {
        fail(seat,state,'NATIVE_SHUFFLE_INVALID');
        return original.call(this,state);
      }
      flows.set(seat,{stage:'end-turn'});
      audit.prompts.push({seat,kind:'owner-shuffle'});
      return new ResolvePromptAction(pending.id,indices);
    }
    return original.call(this,state);
  };
  try {
    const result=execute();
    return {result,audit};
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}

module.exports={shouldOfferHeldBenchMukShake,withApexBenchMukShake};
