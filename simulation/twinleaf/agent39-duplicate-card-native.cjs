'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('./agent11-native-last-bench-locked-dedenne.cjs');
const {withDistinctPhysicalCardSelectionVeto,VERSION}=require(
  './agent39-paper-distinct-selection.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=p=>require(path.join(base,p));

/** @param {0|1} seat @returns {object} */
function prepare(seat){
  const scene=stage(seat);
  const {ChooseCardsPrompt}=load('game/store/prompts/choose-cards-prompt');
  const {GameMessage}=load('game/game-message');
  const cards=scene.owner.deck.cards;
  assert.ok(cards.length>=2&&cards[0]!==cards[1]);
  assert.equal(cards[0].fullName,cards[1].fullName,
    'Two same-name physical cards must have distinct references');
  const chosen=[cards[0],cards[1]];
  let settlements=0;
  const prompt=new ChooseCardsPrompt(scene.owner,GameMessage.CHOOSE_CARD_FROM_DECK,
    scene.owner.deck,{}, {min:2,max:2,allowCancel:false});
  scene.store.prompt(scene.state,prompt,(answer)=>{
    settlements++;
    scene.owner.deck.moveCardsTo(answer??[],scene.owner.hand);
  });
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  return {...scene,chosen,prompt,ResolvePromptAction,
    settled:()=>settlements};
}
/**
 * Real pinned Store: validate duplicate references as native permitted,
 * settle only one physical copy despite submitting two, and check paper veto.
 * @param {0|1} seat
 * @returns {object} Staged diagnostic only.
 */
function exercise(seat){
  const baseline=prepare(seat),[original,second]=baseline.chosen;
  assert.equal(baseline.prompt.validate([original,original]),true);
  assert.equal(baseline.prompt.validate([original,second]),true);
  baseline.store.dispatch(new baseline.ResolvePromptAction(
    baseline.prompt.id,[original,original]));
  assert.equal(baseline.settled(),1);
  assert.equal(baseline.owner.hand.cards.includes(original),true);
  assert.equal(baseline.owner.hand.cards.includes(second),false);
  assert.equal(baseline.owner.deck.cards.includes(original),false);
  assert.equal(baseline.owner.deck.cards.includes(second),true);
  const guarded=prepare(seat),[a,b]=guarded.chosen;
  const handStart=guarded.owner.hand.cards.length;
  const deckStart=guarded.owner.deck.cards.length;
  const evaluated=withDistinctPhysicalCardSelectionVeto(()=>{
    assert.throws(()=>guarded.store.dispatch(new guarded.ResolvePromptAction(
      guarded.prompt.id,[a,a])),
      /PAPER_PROMPT_INVALID:DUPLICATE_PHYSICAL_CARD_SELECTION/);
    assert.equal(guarded.owner.hand.cards.length,handStart);
    assert.equal(guarded.owner.deck.cards.length,deckStart);
    assert.equal(guarded.prompt.result,undefined);
    guarded.store.dispatch(new guarded.ResolvePromptAction(
      guarded.prompt.id,[a,b]));
    assert.equal(guarded.owner.hand.cards.length,handStart+2);
    assert.equal(guarded.owner.deck.cards.length,deckStart-2);
    assert.equal(guarded.settled(),1);
    return true;
  });
  assert.equal(evaluated.result,true);
  assert.equal(evaluated.audit.negativePaperVetoes,1);
  return {seat,nativePromptValidatesDuplicateReferences:true,
    unguardedSubmitsTwoButPhysicallyMovesOne:true,
    guardedRejectsDuplicateBeforeMutation:true,
    guardedDistinctSameNameCardsAccepted:true,
    originalPrintedEffectSource:null,
    naturalFieldGame:false,competitiveQualifiedGames:0};
}
function run(){
  return {schema:VERSION,enginePin:PIN,
    cases:[exercise(0),exercise(1)],
    stagedNativeStore:true,printedSourceUnattributed:true,
    competitiveQualifiedGames:0};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={prepare,exercise,run};
