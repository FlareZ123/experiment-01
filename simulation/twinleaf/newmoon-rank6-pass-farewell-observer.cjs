'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Unown AOR Farewell Letter is an own-Bench public Ability. Identify an
 * eligible printed Pokémon without inspecting either player's hidden zones.
 * @param {object} player Own side of a pinned State.
 * @returns {number}
 */
function availableUnown(player) {
  return player.bench.findIndex(slot=>
    slot.getPokemonCard()?.fullName==='Unown AOR' &&
    slot.energies.cards.length===0 &&
    slot.tools.length===0);
}

/**
 * Observe a pass already selected by the existing policy, and only then
 * clone the Store to test whether the source-active Unown can use Farewell
 * Letter. The counterfactual draw's *identity* is never disclosed or used
 * by the actual bot. This does not certify strategic advantage.
 *
 * @template T
 * @param {()=>T} execute Synchronous live game.
 * @param {{seat:0|1,turn:number}} options Own seat and exact global turn.
 * @returns {{result:T,observations:object[]}}
 */
function withRank6UnownFarewellPassProbe(execute,{seat,turn}) {
  assert.equal(typeof execute,'function');
  assert.ok(seat===0||seat===1);
  assert.ok(Number.isSafeInteger(turn)&&turn>0);
  /** @param {string} p @returns {any} */
  const load=p=>require(path.join(OUTPUT,p));
  const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
  const {GamePhase}=load('game/store/state/state');
  const {deepClone}=load('utils');
  const {Store}=load('game/store/store');
  const {UseAbilityAction}=load('game/store/actions/game-actions');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {PlayerType,SlotType}=load('game/store/actions/play-card-action');
  const prior=SimpleTacticsAi.prototype.decodeNextAction;
  const observations=[];
  let observed=false;

  const handler=function probeAfterChosenPass(state) {
    const selected=prior.call(this,state);
    const player=state.players[seat];
    if(!observed && player && this.client?.id===player.id &&
       state.turn===turn && state.activePlayer===seat &&
       state.phase===GamePhase.PLAYER_TURN &&
       selected?.constructor.name==='PassTurnAction' &&
       !state.prompts.some(p=>p.result===undefined)) {
      observed=true;
      const benchIndex=availableUnown(player);
      const before={
        ownerActive:player.active.getPokemonCard()?.fullName??null,
        sourceActive:state.players[1-seat].active.getPokemonCard()?.fullName??null,
        eligibleBenchedUnownIndex:benchIndex,
        ownerDeckSize:player.deck.cards.length,
        ownerHandSize:player.hand.cards.length,
        ownBenchBefore:player.bench.map(slot=>
          slot.getPokemonCard()?.fullName??null)
      };
      let counterfactual=null;
      if(benchIndex>=0) {
        const copied=new Store({onStateChange() {}});
        copied.state=deepClone(state);
        const action=new UseAbilityAction(player.id,'Farewell Letter',{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:benchIndex
        });
        const oldRandom=Math.random;
        Math.random=()=>0.5;
        try {
          copied.dispatch(action);
          const waitResolutions=[];
          for(let step=0;step<3;step++) {
            const pending=copied.state.prompts
              .filter(prompt=>prompt.result===undefined);
            if(pending.length!==1||
               pending[0].constructor.name!=='WaitPrompt') break;
            const prompt=pending[0];
            const reply=new ResolvePromptAction(prompt.id,null);
            copied.dispatch(reply);
            waitResolutions.push('WaitPrompt resolved with null');
          }
          const after=copied.state.players[seat];
          counterfactual={
            dispatchReturnedWithoutThrow:true,
            waitPromptResolutions:waitResolutions.length,
            pendingPromptTypes:copied.state.prompts
              .filter(prompt=>prompt.result===undefined)
              .map(prompt=>prompt.constructor.name),
            unownLeavesBench:!after.bench[benchIndex].getPokemonCard(),
            ownerDeckDecrease:before.ownerDeckSize-after.deck.cards.length,
            ownerHandIncrease:after.hand.cards.length-before.ownerHandSize,
            opponentHandAccessed:false,
            drawnCardIdentityRecorded:false
          };
        } catch(error) {
          counterfactual={dispatchReturnedWithoutThrow:false,error:String(error?.message||error)};
        } finally {
          Math.random=oldRandom;
        }
      }
      observations.push({schema:'selected-pass-then-cloned-farewell-v1',
        turn,seat,chosenAction:'PassTurnAction',before,counterfactual,
        caveat:'One policy-selected source Pass and detached Store; no public information was changed in the played game.'});
    }
    return selected;
  };
  SimpleTacticsAi.prototype.decodeNextAction=handler;
  try {
    return {result:execute(),observations};
  } finally {
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,handler);
    SimpleTacticsAi.prototype.decodeNextAction=prior;
  }
}

module.exports={availableUnown,withRank6UnownFarewellPassProbe};
