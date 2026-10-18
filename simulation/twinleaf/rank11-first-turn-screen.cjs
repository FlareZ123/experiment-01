'use strict';

/**
 * An opt-in, first-decision *screen*, not a game simulation or policy.
 * Stops exactly before any first global-turn bot decision. It can classify
 * eligibility using only that turn's player's hand and public board.
 *
 * A follow-up full-game replay must independently verify the identical
 * starting deal; this screen deliberately does not return a Store to resume.
 *
 * @template T
 * @param {{sourceSeat:0|1,runMatch:()=>T,SimpleTacticsAi:{prototype:{decodeNextAction:Function}},
 *   playerTurnPhase:number,openingOpportunity:(state:object,player:object,seat:0|1,phase:number)=>boolean}} options
 * @returns {object} Source-first K0 screen; no terminal or win evidence.
 */
function screenRank11FirstTurn(options) {
  const {sourceSeat,runMatch,SimpleTacticsAi,playerTurnPhase,openingOpportunity}=options;
  if (![0,1].includes(sourceSeat) || typeof runMatch !== 'function' ||
      typeof openingOpportunity !== 'function' ||
      typeof SimpleTacticsAi?.prototype?.decodeNextAction !== 'function') {
    throw new TypeError('Provide source seat, valid pinned bot and callable source observer.');
  }
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const STOP=Symbol('rank11-first-turn-captured');
  let capture=null;
  SimpleTacticsAi.prototype.decodeNextAction=function classifyFirstTurn(state) {
    if(state?.turn===1 && state.phase===playerTurnPhase &&
       [0,1].includes(state.activePlayer) &&
       Array.isArray(state.players) &&
       Array.isArray(state.prompts) &&
       !state.prompts.some(p=>p.result===undefined)) {
      const sourceFirst=state.activePlayer===sourceSeat;
      const source=sourceFirst ? state.players[sourceSeat] : null;
      capture={
        schema:'rank11-live-predecision-screen-v1',
        actualFirstPlayerSeat:state.activePlayer,
        sourceFirst,
        eligibleK0:sourceFirst ? openingOpportunity(
          state,source,sourceSeat,playerTurnPhase)===true : false,
        sourceStarter:sourceFirst ? source.active.getPokemonCard()?.name??null : null,
        sourceOwnHand:sourceFirst ? source.hand.cards.map(c=>c.name) : null,
        observation:'original Store first-turn state before bot selects a turn action',
        startingOrderProof:'state phase only; separately corroborate actual first draw log',
        continuedGame:false,
        qualifiedForCompetitiveInference:false
      };
      throw STOP;
    }
    return original.call(this,state);
  };
  try {
    try {
      runMatch();
    } catch(error) {
      if(error===STOP && capture!==null) return capture;
      throw error;
    }
    throw new Error('Original Store did not reach an observable first-turn decision');
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}

module.exports={screenRank11FirstTurn};
