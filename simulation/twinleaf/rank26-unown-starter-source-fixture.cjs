'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {fixture}=require('./rank26-pump-source-conserved-fixture.cjs');
const {stagePumps}=require('./rank26-propagation-source-fixture.cjs');
const {exchange}=require('./rank26-redeemable-ticket-source-fixture.cjs');
const {physical}=require('./rank26-dowsing-pump-source-fixture.cjs');
const {withRank26ExeggcutePump}=
  require('./rank26-exeggcute-pump-policy.cjs');
const {withRank26PropagationLoop}=
  require('./rank26-propagation-loop.cjs');
const {installDamagePumpSingleSourceHook}=
  require('./damage-pump-single-source-hook.cjs');
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const engine=name=>require(path.join(OUTPUT,name));

/** Swap printed Tapu from a real owner reserve to the existing Bench slot. */
function putPhysicalTapuOnBench(own,benchIndex){
  const reserves=[own.hand,own.deck,...own.prizes];
  for(const zone of reserves){
    const i=zone.cards.findIndex(card=>card.name?.startsWith('Tapu Koko'));
    if(i<0)continue;
    const old=own.bench[benchIndex].cards[0];
    assert.ok(old);
    const incoming=zone.cards[i];
    zone.cards[i]=old;
    own.bench[benchIndex].cards[0]=incoming;
    return incoming;
  }
  throw Error('Missing exact original rank26 Tapu Prism physical card');
}

/**
 * Make a prepared source board that uses Unown A as original Active and a
 * different printed Unown B as the damaged Benched donor. This deliberately
 * does not pretend a real root player Benched these cards in this order.
 */
function stageUnownStarter(f){
  const own=f.own;
  const activeMelo=own.active.cards.pop();
  const activeUnown=own.bench[0].cards.pop();
  assert.equal(activeMelo.name,'Meloetta ex');
  assert.equal(activeUnown.name,'Unown');
  assert.equal(own.active.damage,0);
  own.active.cards.push(activeUnown);
  own.bench[0].cards.push(activeMelo);
  assert.equal(own.bench[0].damage,20);
  const tapu=putPhysicalTapuOnBench(own,1);
  assert.ok(tapu.fullName?.includes('Tapu Koko'));
  exchange(own,'Unown',own.bench[2],0);
  assert.equal(own.bench[2].cards[0].name,'Unown');
  assert.notEqual(own.bench[2].cards[0].id,activeUnown.id);
  assert.deepEqual(own.bench.map(slot=>slot.getPokemonCard()?.name),
    ['Meloetta ex',tapu.name,'Unown','Exeggcute','Exeggcute']);
  stagePumps(f);
  const ids=physical(own).map(c=>c.id);
  assert.equal(ids.length,60);
  assert.equal(new Set(ids).size,60);
  return {ids:ids.sort((a,b)=>a-b),starter:activeUnown.id,
    donor:own.bench[2].cards[0].id,tapu:tapu.id};
}

/** Staged 3 original Pump 2+2+1 native source turn with Unown original Active. */
function runSeat(seat){
  const f=fixture(seat);
  const initial=stageUnownStarter(f);
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {GamePhase}=engine('game/store/state/state');
  const restore=installDamagePumpSingleSourceHook();
  try{
    const x=withRank26ExeggcutePump(seat,()=>
      withRank26PropagationLoop(seat,()=>{
        const actor={client:{id:f.own.id}};
        const prizes=[];
        const actions=[];
        for(let n=0;n<48;n++){
          if(f.opponent.getPrizeLeft()===1)break;
          const pending=f.state.prompts.find(p=>p.result===undefined);
          if(pending?.constructor.name==='ChoosePrizePrompt'){
            assert.equal(pending.playerId,f.opponent.id);
            const available=f.opponent.prizes.filter(s=>s.cards.length)
              .slice(0,pending.options.count);
            assert.equal(pending.validate(available,f.state),true);
            f.store.dispatch(new ResolvePromptAction(pending.id,available));
            prizes.push(f.opponent.getPrizeLeft());
            continue;
          }
          const action=SimpleTacticsAi.prototype.decodeNextAction.call(actor,f.state);
          assert.ok(action);
          assert.ok(['PlayCardAction','ResolvePromptAction','UseAbilityAction']
            .includes(action.constructor.name));
          actions.push(action.constructor.name);
          f.store.dispatch(action);
        }
        assert.deepEqual(prizes,[4,2,1]);
        assert.equal(f.opponent.getPrizeLeft(),1);
        assert.equal(f.state.phase,GamePhase.PLAYER_TURN);
        assert.equal(f.own.active.getPokemonCard()?.name,'Unown');
        assert.equal(f.own.active.cards[0].id,initial.starter);
        assert.equal(f.own.bench[2].getPokemonCard()?.name,'Unown');
        assert.equal(f.own.bench[2].cards[0].id,initial.donor);
        assert.equal(f.own.bench[2].damage,10,
          'Distinct Benched donor Unown paid the fifth self-KO counter');
        assert.deepEqual(physical(f.own).map(c=>c.id).sort((a,b)=>a-b),
          initial.ids);
        return {sourceSeat:seat,sourceActive:'Unown AOR30',
          distinctUnownActiveAndBench:true,
          sourceMeloAndTapuBenched:true,
          printedSource60Conserved:true,realStoreSelfKnockouts:5,
          opponentPrizeProgress:prizes,sourceRootActions:actions};
      }));
    assert.equal(x.policyAudit.actions.length,6);
    return {...x.result.result,pumpPolicyAudit:x.policyAudit,
      propagationPolicyAudit:x.result.policyAudit};
  }finally{restore();}
}
function run(){
  return {schema:'rank26-unown-original-active-staged-pump-v1',
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    cases:[runSeat(0),runSeat(1)],
    realOriginalSource60:true,actualFirstTurnDeal:false,
    wholeCrisisPunchAttackQualified:false,opponentPolicyQualified:false,
    competitiveGameQualified:false};
}
module.exports={stageUnownStarter,runSeat,run};
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
