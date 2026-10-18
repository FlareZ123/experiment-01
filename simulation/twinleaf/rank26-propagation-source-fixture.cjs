'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {fixture}=require('./rank26-pump-source-conserved-fixture.cjs');
const {withRank26ExeggcutePump}=
  require('./rank26-exeggcute-pump-policy.cjs');
const {withRank26PropagationLoop}=
  require('./rank26-propagation-loop.cjs');
const {installDamagePumpSingleSourceHook}=
  require('./damage-pump-single-source-hook.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const engine=name=>require(path.join(OUTPUT,name));

/**
 * Stage three registered Damage Pumps into the source player's own hand;
 * move their actual instances from deck to hand, preserving every source
 * card and its unique engine ID. Never call this a real opening deal.
 * @param {object} fixtureState
 */
function stagePumps(fixtureState){
  const p=fixtureState.own;
  const extra=p.deck.cards.filter(card=>card.name==='Damage Pump').slice(0,2);
  assert.equal(extra.length,2,'Registered rank26 must have the extra Pumps');
  for(const card of extra)p.deck.moveCardTo(card,p.hand);
  const owned=[...p.active.cards,...p.bench.flatMap(slot=>slot.cards),
    ...p.stadium.cards,...p.hand.cards,...p.prizes.flatMap(slot=>slot.cards),
    ...p.deck.cards,...p.discard.cards];
  assert.equal(owned.length,60,'Rank26 printed inventory must remain conserved');
  assert.equal(new Set(owned.map(card=>card.id)).size,60);
}

/** Execute autonomous 2+2+1 source-Pump loop with real Store effects and
 * mandatory opponent Prize selection, in a *prepared* source-conserved state.
 * @param {0|1} sourceSeat
 * @returns {object}
 */
function runSeat(sourceSeat) {
  const f=fixture(sourceSeat);
  stagePumps(f);
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {GamePhase}=engine('game/store/state/state');
  const restore=installDamagePumpSingleSourceHook();
  try{
    const pump=withRank26ExeggcutePump(sourceSeat,()=>{
      return withRank26PropagationLoop(sourceSeat,()=>{
        const actor={client:{id:f.own.id}};
        const actualActions=[];
        const prizeProgress=[];
        for(let step=0;step<48;step++){
          const remaining=f.opponent.getPrizeLeft();
          if(remaining===1)break;
          const pending=f.state.prompts.find(x=>x.result===undefined);
          if(pending?.constructor.name==='ChoosePrizePrompt'){
            assert.equal(pending.playerId,f.opponent.id);
            const choices=f.opponent.prizes.filter(s=>s.cards.length)
              .slice(0,pending.options.count);
            assert.equal(pending.validate(choices,f.state),true);
            f.store.dispatch(new ResolvePromptAction(pending.id,choices));
            prizeProgress.push(f.opponent.getPrizeLeft());
            continue;
          }
          const action=SimpleTacticsAi.prototype.decodeNextAction.call(actor,f.state);
          assert.ok(action,'Policy did not select an action at live root');
          assert.ok(['PlayCardAction','ResolvePromptAction',
            'UseAbilityAction'].includes(action.constructor.name),
            'Unexpected fallback action: '+action.constructor.name);
          actualActions.push({
            type:action.constructor.name,
            beforeOpponentPrizes:remaining,
            pendingPrompt:pending?.constructor.name??null
          });
          f.store.dispatch(action);
        }
        assert.equal(f.opponent.getPrizeLeft(),1);
        assert.deepEqual(prizeProgress,[4,2,1]);
        assert.equal(f.state.phase,GamePhase.PLAYER_TURN);
        assert.equal(f.own.discard.cards.filter(card=>card.name==='Exeggcute').length,2);
        assert.equal(actualActions.filter(action=>action.type==='PlayCardAction').length,6,
          'Expected three Pump and three Exeggcute Bench plays');
        assert.equal(actualActions.filter(action=>action.type==='UseAbilityAction').length,3);
        assert.equal(actualActions.filter(action=>action.type==='ResolvePromptAction').length,3);
        return {sourceSeat,prizeProgress,actualActions,
          full60ConservedAtStart:true,actualStoreActions:true,
          reachedFifthSelfKO:true};
      });
    });
    assert.equal(pump.policyAudit.actions.length,6);
    assert.deepEqual(pump.result.policyAudit.actions.map(x=>x.kind),[
      'propagate','bench','propagate','bench','propagate','bench'
    ]);
    return {
      ...pump.result.result,
      pumpPolicyAudit:pump.policyAudit,
      propagationPolicyAudit:pump.result.policyAudit
    };
  }finally{restore();}
}

/** @returns {object} */
function run(){
  return {
    schema:'rank26-autonomous-source-conserved-2plus2plus1-v1',
    examples:[runSeat(0),runSeat(1)],
    pinnedTwinleaf:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    originalRandomDeal:false,
    manualPrizeSelection:true,
    source60Conserved:true,
    energyOrAttackQualified:false,
    opponentPolicyQualified:false,
    competitiveGameQualified:false
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={stagePumps,runSeat,run};
