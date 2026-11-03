'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('./agent47-rank26-zero-unown-one-lightning-native.cjs');
const {physical,prepareCard}=require('./rank26-unown-full-crisis-native.cjs');
const {withRank26CologneOpener}=require('./rank26-cologne-opener.cjs');
const {withRank26ConditionalFinisher}=
  require('./agent47-rank26-conditional-finisher-policy.cjs');
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const engine=name=>require(path.join(OUTPUT,name));
const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
const {GamePhase}=engine('game/store/state/state');

/** Prepared, original-60-conserved final-turn card/payment witness. */
function runSeat(seat){
  const {f,sourceIds,opponentIds}=stage(seat);
  const source=f.own,opp=f.opponent;
  // Retrospective final-window only: opponent five Prizes are synthetically
  // moved to its original hand. This never claims to reproduce five KOs.
  for(const slot of opp.prizes.slice(1)){
    opp.hand.cards.push(...slot.cards.splice(0));
  }
  assert.equal(opp.getPrizeLeft(),1);
  for(const name of ['Canceling Cologne','Double Colorless Energy',
    'Technical Machine: Crisis Punch','Escape Rope']){
    prepareCard(source,name,source.hand);
  }
  prepareCard(source,'Lightning Energy',source.discard);
  assert.equal(source.discard.cards.filter(c=>
    c.name==='Lightning Energy').length,1);
  assert.deepEqual(physical(source).map(c=>c.id).sort((a,b)=>a-b),sourceIds);
  assert.deepEqual(physical(opp).map(c=>c.id).sort((a,b)=>a-b),opponentIds);
  const selected=withRank26CologneOpener(seat,()=>
    withRank26ConditionalFinisher(seat,()=>{
      const actor=Object.create(SimpleTacticsAi.prototype);
      actor.client={id:source.id};actor.tactics=[];actor.resolvers=[];
      const actions=[],neutralPrompts=[];
      for(let i=0;i<45;i++){
        if(f.state.phase===GamePhase.FINISHED)break;
        const prompt=f.state.prompts.find(p=>p.result===undefined);
        if(prompt?.constructor.name==='WaitPrompt'){
          f.store.dispatch(new ResolvePromptAction(prompt.id,null));
          neutralPrompts.push({kind:'WaitPrompt',owner:prompt.playerId});
          continue;
        }
        if(prompt?.constructor.name==='ChoosePrizePrompt'){
          const player=f.state.players.find(p=>p.id===prompt.playerId);
          assert.ok(player);
          const selected=player.prizes.filter(p=>p.cards.length)
            .slice(0,prompt.options.count);
          assert.equal(prompt.validate(selected,f.state),true);
          f.store.dispatch(new ResolvePromptAction(prompt.id,selected));
          neutralPrompts.push({kind:'ChoosePrizePrompt',owner:prompt.playerId,
            count:selected.length});
          continue;
        }
        const action=SimpleTacticsAi.prototype.decodeNextAction.call(actor,
          f.state);
        const type=action?.constructor.name;
        assert.ok(['PlayCardAction','UseAbilityAction','ResolvePromptAction',
          'AttackAction'].includes(type),
          'Unmanaged finisher action '+type+' '+JSON.stringify({
            sourceHand:source.hand.cards.map(c=>c.name),
            bench:source.bench.map(s=>s.getPokemonCard()?.name),
            phase:f.state.phase,pending:prompt?.constructor.name??null}));
        const held=type==='PlayCardAction'?
          source.hand.cards[action.handIndex]?.name??null:null;
        f.store.dispatch(action);
        actions.push({type,held,pendingAfter:f.state.prompts.find(p=>
          p.result===undefined)?.constructor.name??null});
      }
      assert.equal(f.state.phase,GamePhase.FINISHED);
      assert.equal(f.state.winner,seat);
      assert.equal(opp.active.getPokemonCard(),undefined);
      assert.deepEqual(physical(source).map(c=>c.id).sort((a,b)=>a-b),
        sourceIds);
      assert.deepEqual(physical(opp).map(c=>c.id).sort((a,b)=>a-b),
        opponentIds);
      return {actualSourceActions:actions,neutralPrompts,
        original60PhysicalConserved:true};
    }),{unlockBenchedKoko:true,minimumDiscardLightning:1});
  assert.equal(selected.policyAudit.opportunitiesSelected,1);
  const fin=selected.result.policyAudit;
  assert.deepEqual(fin.actions.map(x=>x.kind),[
    'use-koko-one-lightning','one-lightning-koko-prompt',
    'attach-original-dce','attach-original-tool',
    'escape-rope-promote','promote-meloetta',
    'firstturn-crisis-punch'
  ]);
  return {seat,verifiedOriginal60BothPlayers:true,
    nativeFirstturnWinner:true,
    stagedOpponentPrizeAndSourceResources:true,
    sourceActionCount:selected.result.result.actualSourceActions.length,
    sourceActions:selected.result.result.actualSourceActions,
    cologneAudit:selected.policyAudit,finisherAudit:fin,
    competitiveGameQualified:false};
}
function run(){
  return {schema:'agent47-rank26-conditional-sole-defender-native-owner-finisher-v1',
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    samples:[runSeat(0),runSeat(1)],naturalGame:false,
    competitiveQualifiedGames:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,runSeat};
