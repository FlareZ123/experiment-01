'use strict';

const assert=require('node:assert/strict');
const {withPaperPromptContractPortfolio,VERSION}=
  require('./agent41-paper-prompt-contract-portfolio.cjs');
const {
  probeRoxieChoiceIndexShift
}=require('./agent4-rank31-roxie-koffing-spoons-native.cjs');


const path=require('node:path');
const {stagedPainfulSpoons}=
  require('./agent4-rank31-alakazam-movesource-native.cjs');
const native=file=>require(path.join(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',file));

/**
 * The shared paper portfolio preflights Roxie's played root. Give the
 * physical owner a genuine eligible Koffing alongside the forbidden GX:
 * the root is payable, making invalid GX/zero prompt replies reachable.
 * @param {0|1} seat @param {'gx'|'zero'} answer
 * @returns {object} Genuine Store prompt result and payment custody.
 */
function probePayableRoxiePrompt(seat,answer){
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const f=stagedPainfulSpoons(seat);
  const gx=f.card('Tapu Lele-GX GRI');
  const koffing=f.card('Koffing CEC');
  const roxie=f.card('Roxie CEC');
  f.source.hand.cards.push(gx,koffing,roxie);
  const deckBefore=f.source.deck.cards.length;
  f.store.dispatch(new PlayCardAction(f.source.id,2,
    {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
  const prompt=f.state.prompts.find(p=>p.result===undefined&&
    p.constructor.name==='ChooseCardsPrompt');
  assert.ok(prompt,'Roxie must expose a genuine owner discard prompt');
  assert.equal(prompt.playerId,f.source.id);
  const reply=answer==='gx'?[gx]:[];
  const validatorAccepted=prompt.validate(reply,f.state);
  let storeError=null;
  try{f.store.dispatch(new ResolvePromptAction(prompt.id,reply));}
  catch(e){storeError=String(e?.message??e);}
  return {seat,answer,validatorAccepted,
    nativeValidatorAccepted:validatorAccepted,storeError,
    promptSettled:prompt.result!==undefined,
    promptPending:prompt.result===undefined,
    gxPhysicallyDiscarded:f.source.discard.cards.includes(gx),
    eligibleKoffingStillInHand:f.source.hand.cards.includes(koffing),
    physicalCardsDrawn:deckBefore-f.source.deck.cards.length,
    paperRootPayable:true,qualifiedGame:false};
}

/**
 * Both physical-seat true native original Roxie CEC source-stamped
 * ChooseCardsPrompt tests under the integrated paper portfolio, including
 * forbidden Tapu Lele-GX, forbidden empty payment, and permitted Koffing.
 * Actual pinned Store prompts and printed card class instances are used.
 * @returns {object} Bounded native payment-contract results.
 */
function run(){
  const rows=[];
  for(const seat of [0,1]){
    const gx=withPaperPromptContractPortfolio(()=>
      probePayableRoxiePrompt(seat,'gx'));
    assert.equal(gx.result.validatorAccepted,false);
    assert.match(gx.result.storeError,
      /PAPER_PROMPT_INVALID:.*ROXIE_PRINTED_DISALLOWS_SELECTED_CARD/);
    assert.equal(gx.result.promptSettled,false);
    assert.equal(gx.result.gxPhysicallyDiscarded,false);
    assert.equal(gx.result.physicalCardsDrawn,0);
    assert.equal(gx.audit.inspectedRoxiePaymentPrompts,1);
    assert.equal(gx.audit.statusCounts.PAPER_PROMPT_INVALID,1);
    assert.equal(gx.audit.vetoedBeforeDispatch,1);

    const empty=withPaperPromptContractPortfolio(()=>
      probePayableRoxiePrompt(seat,'zero'));
    assert.equal(empty.result.nativeValidatorAccepted,true);
    assert.match(empty.result.storeError,
      /PAPER_PROMPT_INVALID:.*ROXIE_PRINTED_PAYMENT_REQUIRES_ONE_OR_TWO/);
    assert.equal(empty.result.promptPending,true);
    assert.equal(empty.audit.inspectedRoxiePaymentPrompts,1);
    assert.equal(empty.audit.statusCounts.PAPER_PROMPT_INVALID,1);

    const legal=[];
    for(const roxieFirst of [true,false]){
      const ok=withPaperPromptContractPortfolio(()=>
        probeRoxieChoiceIndexShift(roxieFirst,false,seat));
      assert.equal(ok.result.nativeStoreError,null);
      assert.equal(ok.result.physicalKoffingDiscarded,true);
      assert.equal(ok.result.promptSettled,true);
      assert.equal(ok.result.validatorAccepted,!roxieFirst,
        'Pinned Roxie validator shifts allowed indexes with hand order');
      assert.equal(ok.audit.inspectedRoxiePaymentPrompts,1);
      assert.equal(ok.audit.statusCounts.PAPER_PROMPT_INVALID,0);
      assert.equal(ok.audit.statusCounts.PAPER_PROMPT_UNVERIFIED>=1,true);
      legal.push({roxieFirst,result:ok.result,
        inspectedRoxiePaymentPrompts:ok.audit.inspectedRoxiePaymentPrompts});
    }
    for(const audit of [gx.audit,empty.audit]){
      assert.equal(audit.schema,VERSION);
      assert.equal(audit.statusCounts.PAPER_PROMPT_VERIFIED,0,
        'Only a negative paper eligibility clause is independently certified');
    }
    rows.push({seat,gx:{result:gx.result,
      vetoedBeforeDispatch:gx.audit.vetoedBeforeDispatch},
      empty:{result:empty.result,
        vetoedBeforeDispatch:empty.audit.vetoedBeforeDispatch},legal});
  }
  const out={enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    rank:31,sourcePrintings:['Roxie CEC 205','Koffing CEC 76',
      'Tapu Lele-GX GRI'],schema:VERSION,
    scope:'Original Store stamped ChooseCardsPrompt, staged board, no game',
    competitiveQualifiedGames:0,rows};
  console.log(JSON.stringify(out,null,2));
  return out;
}
if(require.main===module)run();
module.exports={run};
