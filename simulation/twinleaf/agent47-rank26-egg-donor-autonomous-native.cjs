'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {stage} = require('./agent47-rank26-zero-unown-one-lightning-native.cjs');
const {physical} = require('./rank26-unown-full-crisis-native.cjs');
const {installDamagePumpSingleSourceHook} =
  require('./damage-pump-single-source-hook.cjs');
const {withRank26ExeggcutePump} =
  require('./rank26-exeggcute-pump-policy.cjs');
const {withRank26PropagationLoop} =
  require('./rank26-propagation-loop.cjs');
const {withEggDonorRecovery} =
  require('./agent47-rank26-egg-donor-recovery-optin.cjs');

const OUTPUT = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const engine = name => require(path.join(OUTPUT,name));
const {SimpleTacticsAi} = engine('simple-bot/simple-tactics-ai');
const {ResolvePromptAction} =
  engine('game/store/actions/resolve-prompt-action');
const {GamePhase} = engine('game/store/state/state');

/**
 * Runs exactly one staged original source 60 from a prepared first-turn
 * native board. Every source action is a genuine Store-tested action
 * selected by the nested, owner-visible opt-in policies. The only explicit
 * opposing actions are mandatory Prize selection prompts.
 * @param {0|1} seat
 * @returns {object}
 */
function runSeat(seat) {
  const {f,sourceIds,opponentIds} = stage(seat);
  const restore = installDamagePumpSingleSourceHook();
  try {
    const policy = withRank26ExeggcutePump(seat,() =>
      withRank26PropagationLoop(seat,() =>
        withEggDonorRecovery(seat,() => {
          const source = f.own;
          const opponent = f.opponent;
          const actor = {client:{id:source.id}};
          const actions = [], prizeReceipts = [];
          for(let i=0;i<64;i++) {
            if(opponent.getPrizeLeft()===1) break;
            const pending = f.state.prompts.find(p => p.result === undefined);
            if (pending?.constructor.name === 'ChoosePrizePrompt') {
              assert.equal(pending.playerId,opponent.id);
              const choices = opponent.prizes.filter(p => p.cards.length)
                .slice(0,pending.options.count);
              assert.equal(pending.validate(choices,f.state),true);
              f.store.dispatch(new ResolvePromptAction(pending.id,choices));
              prizeReceipts.push({
                count:choices.length,
                opposingPrizesAfter:opponent.getPrizeLeft()
              });
              continue;
            }
            assert.equal(f.state.phase,GamePhase.PLAYER_TURN);
            assert.equal(f.state.activePlayer,seat);
            const action = SimpleTacticsAi.prototype.decodeNextAction.call(
              actor,f.state);
            const type = action?.constructor.name;
            assert.ok(['PlayCardAction','ResolvePromptAction','UseAbilityAction']
              .includes(type),'Unmanaged source action: '+type);
            const held = type === 'PlayCardAction'
              ? source.hand.cards[action.handIndex]?.name ?? null : null;
            const activeDiscard = source.discard.cards.filter(c =>
              c.name==='Exeggcute').length;
            const prizesBefore = opponent.getPrizeLeft();
            f.store.dispatch(action);
            actions.push({
              type, held, name:action.name ?? null, prizesBefore,
              sourceEggsDiscardBefore:activeDiscard,
              sourceBenchEggsAfter:source.bench.filter(slot =>
                slot.getPokemonCard()?.name==='Exeggcute').length,
              pendingAfter:f.state.prompts.find(p =>
                p.result===undefined)?.constructor.name ?? null
            });
          }
          assert.deepEqual(prizeReceipts.map(x=>x.opposingPrizesAfter),
            [4,2,1],'owner policy must produce exactly 2+2+1 Prize ladder');
          assert.equal(f.state.phase,GamePhase.PLAYER_TURN);
          assert.equal(opponent.getPrizeLeft(),1);
          assert.equal(source.bench.filter(slot =>
            slot.getPokemonCard()?.name==='Exeggcute').length,1);
          assert.ok(source.bench.some(slot =>
            slot.getPokemonCard()?.name==='Exeggcute'&&slot.damage===10));
          assert.equal(source.bench.some(slot =>
            slot.getPokemonCard()?.name==='Unown'),false);
          assert.deepEqual(physical(source).map(c=>c.id).sort((a,b)=>a-b),
            sourceIds);
          assert.deepEqual(physical(opponent).map(c=>c.id).sort((a,b)=>a-b),
            opponentIds);
          return {actions,prizeReceipts,
            sourceOriginal60Conserved:true,
            opponentOriginal60Conserved:true};
        })
      ),
      {allowEggToEggFifthKo:true,requireOpponentSoloActive:true}
    );
    const pump = policy.policyAudit;
    const recovery = policy.result.policyAudit;
    const bridge = policy.result.result.policyAudit;
    const raw = policy.result.result.result;
    assert.equal(pump.actions.length,6);
    assert.equal(pump.actions.filter(a=>a.kind==='egg-to-egg-fifth-KO'
      ||a.kind==='ready-egg-to-egg-fifth-KO').length,2);
    assert.equal(recovery.actions.length,4,
      'first two Propagation/re-Bench pairs before the final 2-Prize root');
    assert.equal(bridge.actions.length,4,
      'the two Egg donor recovery Propagation/re-Bench actions');
    assert.deepEqual(raw.prizeReceipts.map(x=>x.opposingPrizesAfter),[4,2,1]);
    assert.equal(raw.actions.length,14,
      '3 Pump plays, 3 Pump responses, 4 Propagation and 4 Bench actions');
    return {
      seat,originalSource60:true,sourceUnownInPlay:0,
      realSourceOwnerActions:raw.actions,
      actualOriginalOwnerPrizeSelections:raw.prizeReceipts,
      pumpAudit:pump,baselineRecoveryAudit:recovery,
      eggDonorBridgeAudit:bridge,
      originalPhysicalCardsConservedBothSides:true,
      stagedSourceSetup:true,naturalGame:false,
      competitiveGameQualified:false
    };
  } finally { restore(); }
}
function run() {
  return {schema:'agent47-rank26-egg-donor-recovery-native-owner-roots-v1',
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    originalRank26Source:60, originalRank6Defender:60,
    samples:[runSeat(0),runSeat(1)],
    originalRandomDeal:false,competitiveQualifiedGames:0};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,runSeat};
