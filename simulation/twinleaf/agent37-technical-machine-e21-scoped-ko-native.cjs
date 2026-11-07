'use strict';
const assert=require('node:assert/strict');
const {inspectPowerglassWinningKo}=
  require('./agent37-powerglass-winning-ko-native.cjs');
const {withInstanceScopedPaperKoBeforeEndTurn,VERSION,PINNED}=
  require('./agent37-paper-ko-instance-scoped-hook.cjs');

const TOOL='Technical Machine: Devolution PAR';

/**
 * Native Tool discard is an automatic end-of-turn effect. A nonterminal attack
 * should still discard it after KO resolution; a winning attack should end
 * the game without running later endturn Tool effects.
 * @returns {object} Physical card custody and KO order in both seats.
 */
function auditTechnicalMachineEndturn(){
  const cases=[
    {label:'pass',actionKind:'pass'},
    {label:'noKo',targetDamage:0},
    {label:'singleKo'},
    {label:'threePrizeKo',targetPrinting:'Trevenant & Dusknoir-GX SMP',
      targetDamage:260},
    {label:'winLastPrize',lastPrize:true},
    {label:'winNoPokemon',opponentHasBench:false}
  ].flatMap(({label,...args})=>[0,1].map(actorSeat=>{
    const common={...args,actorSeat,toolPrinting:TOOL,settleAll:true};
    const baseline=inspectPowerglassWinningKo(common);
    const treatment=inspectPowerglassWinningKo({
      ...common,withStoreHook:withInstanceScopedPaperKoBeforeEndTurn
    });
    const b=baseline.finalState,t=treatment.finalState;
    const terminal=label==='winLastPrize'||label==='winNoPokemon';
    const knockout=label==='singleKo'||label==='threePrizeKo';
    assert.equal(b.openPrompts.length,0);
    assert.equal(t.openPrompts.length,0);
    assert.equal(treatment.scopedHookAudit.originalRestored,true);
    assert.equal(treatment.scopedHookAudit.otherStoresUnmodified,true);
    assert.equal(treatment.scopedHookAudit.intercepted,label==='pass'?0:1);
    assert.equal(b.ownerDiscard.includes(TOOL),true,
      'Original pinned engine discards Technical Machine on all tested turns');
    if(terminal){
      assert.equal(b.finished,true);
      assert.equal(t.finished,true);
      assert.equal(b.winner,actorSeat);
      assert.equal(t.winner,actorSeat);
      assert.equal(treatment.scopedHookAudit.terminalSuppressed,1);
      assert.deepEqual(t.ownerActiveTools,[TOOL],
        'A game-ending KO skips later end-of-turn Tool discard');
      assert.equal(t.ownerDiscard.includes(TOOL),false);
    }else{
      assert.equal(b.finished,false);
      assert.equal(t.finished,false);
      assert.equal(t.ownerDiscard.includes(TOOL),true);
      assert.equal(t.ownerActiveTools.length,0);
    }
    assert.equal(b.ownerPrizesRemaining,t.ownerPrizesRemaining);
    if(knockout){
      assert.equal(baseline.firstChoicePrompt,'ChoosePrizePrompt');
      assert.equal(treatment.firstChoicePrompt,'ChoosePrizePrompt');
      assert.equal(baseline.firstChoiceSnapshot.ownerTools.includes(TOOL),false,
        'Original Store already discards TM before KO Prize choice');
      assert.equal(treatment.firstChoiceSnapshot.ownerTools.includes(TOOL),true,
        'KO-first scoped hook holds TM until after Prize choice');
    }
    return {label,actorSeat,
      baseline:{
        firstChoice:baseline.firstChoicePrompt,
        toolAtFirstChoice:baseline.firstChoiceSnapshot?.ownerTools??null,
        finalTools:b.ownerActiveTools,finalDiscard:b.ownerDiscard,
        winner:b.winner,prizes:b.ownerPrizesRemaining
      },
      scoped:{
        firstChoice:treatment.firstChoicePrompt,
        toolAtFirstChoice:treatment.firstChoiceSnapshot?.ownerTools??null,
        finalTools:t.ownerActiveTools,finalDiscard:t.ownerDiscard,
        winner:t.winner,prizes:t.ownerPrizesRemaining,
        callbackCount:treatment.scopedHookAudit.callbacks
      }};
  }));
  return {schema:'agent37-technical-machine-e21-native-v1',
    paperHook:VERSION,pinnedTwinleaf:PINNED,
    twelveTwoSeatPhysicalA_BPairs:true,
    noCompetitiveGamesQualified:0,cases};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(auditTechnicalMachineEndturn(),null,2)+'\n');
module.exports={auditTechnicalMachineEndturn};
