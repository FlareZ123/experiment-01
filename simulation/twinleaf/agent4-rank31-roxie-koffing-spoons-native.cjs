'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedPainfulSpoons}=require('./agent4-rank31-alakazam-movesource-native.cjs');
const {withPaperPainfulSpoonsSingleSource}=require('./agent4-painful-spoons-single-source-hook.cjs');
const {withRoxieTrainerDiscardType}=require('./agent4-roxie-original-effect-type-hook.cjs');
const {withPaperRoxiePayment}=require('./agent4-roxie-paper-payment-hook.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} filename @returns {any} */
const native=filename=>require(path.join(output,filename));

/**
 * @param {boolean} guarded
 * @param {0|1} [seat=0] Physical actor seat in the real Store.
 * @param {boolean} [guardRoxie=false] Enforce Roxie payment pre-dispatch.
 */
function runRank31RoxieSpoons(guarded,seat=0,guardRoxie=false){
  const {PlayCardAction,PlayerType,SlotType}=native('game/store/actions/play-card-action');
  const {UseAbilityAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const f=stagedPainfulSpoons(seat);
  f.opponent.active.damage=0;
  f.opponent.bench[0].damage=0;
  f.opponent.bench[1].damage=180;
  const victim=f.opponent.bench[1].getPokemonCard();
  const roxie=f.card('Roxie CEC');
  const koffing=f.card('Koffing CEC');
  f.source.hand.cards.push(koffing,roxie);
  const evidence=[];
  const pending=()=>f.state.prompts.find(p=>p.result===undefined);
  const execute=()=>{
    const before=f.source.getPrizeLeft();
    f.store.dispatch(new PlayCardAction(f.source.id,1,
      {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
    for(let k=0;k<16;k++){
      const prompt=pending();
      if(!prompt)break;
      const type=prompt.constructor.name;
      let answer;
      if(type==='ChooseCardsPrompt')answer=[koffing];
      else if(type==='ConfirmPrompt')answer=true;
      else if(type==='WaitPrompt')answer=null;
      else throw new Error('Unexpected native Roxie prompt '+type);
      // Original pinned Store does not call prompt.validate. Preserve that
      // independent paper-prompt witness without treating it as Store refusal.
      const nativeValidatorAccepted=prompt.validate(answer,f.state);
      evidence.push({phase:'Roxie',type,nativeValidatorAccepted,
        blocked:type==='ChooseCardsPrompt'?[...prompt.options.blocked]:null});
      f.store.dispatch(new ResolvePromptAction(prompt.id,answer));
    }
    assert.equal(pending(),undefined,'Roxie and Koffing must settle');
    assert.ok(f.source.discard.cards.includes(koffing));
    // Roxie's printed one-Pokémon payment must physically draw three.
    const roxieDrawnThree=
      f.source.hand.cards.length===3&&f.source.deck.cards.length===4;
    assert.equal(roxieDrawnThree,true,'Roxie must settle all three printed draws');
    const afterBomb=[f.opponent.active.damage,
      f.opponent.bench[0].damage,f.opponent.bench[1].damage];
    assert.deepEqual(afterBomb,[10,10,190]);

    f.store.dispatch(new UseAbilityAction(f.source.id,'Painful Spoons',
      {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0}));
    for(let k=0;k<4;k++){
      const wait=f.state.prompts.find(p=>p.result===undefined&&p.constructor.name==='WaitPrompt');
      if(!wait)break;
      f.store.dispatch(new ResolvePromptAction(wait.id,null));
    }
    const prompt=f.state.prompts.find(p=>p.result===undefined&&p.constructor.name==='MoveDamagePrompt');
    assert.ok(prompt,'Missing genuine SIT59 movement after native Koffing');
    const reply=[
      {from:{player:PlayerType.TOP_PLAYER,slot:SlotType.ACTIVE,index:0},
        to:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:1}},
      {from:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:0},
        to:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:1}}
    ];
    const allowed=prompt.validate(reply,f.state);
    let rejected=null;
    try{f.store.dispatch(new ResolvePromptAction(prompt.id,reply));}
    catch(e){rejected=String(e?.message??e);}
    if(!guarded){
      for(let k=0;k<10;k++){
        const p=pending();
        if(!p)break;
        const type=p.constructor.name;
        const answer=type==='WaitPrompt'?null:
          type==='ChoosePrizePrompt'?
            f.source.prizes.filter(x=>x.cards.length).slice(0,p.options.count):undefined;
        assert.notEqual(answer,undefined,'Unexpected native prize prompt '+type);
        assert.equal(p.validate(answer,f.state),true);
        f.store.dispatch(new ResolvePromptAction(p.id,answer));
        evidence.push({phase:'Prize',type});
      }
    }
    return {guarded,seat,guardRoxie,afterBomb,allowed,rejected,
      promptPending:prompt.result===undefined,
      physicalKoffingDiscarded:f.source.discard.cards.includes(koffing),
      roxieDiscarded:f.source.discard.cards.includes(roxie),
      roxieDrawnThree,
      victimInDiscard:f.opponent.discard.cards.includes(victim),
      prizesTaken:before-f.source.getPrizeLeft(),
      evidence,
      scope:'actual original rank31 printed line on a prepared Store board; not a source-dealt game'};
  };
  return withRoxieTrainerDiscardType(()=>{
    const run=()=>guarded?withPaperPainfulSpoonsSingleSource(execute):execute();
    return guardRoxie?withPaperRoxiePayment(run):run();
  });
}
/**
 * Inspect a real native Roxie ChooseCardsPrompt with exactly the same two
 * physical owner cards in different hand orders. A printed Koffing is valid
 * in both paper orders. Observe native option/index drift and actual Store
 * pre-dispatch acceptance independently of broader combo completion.
 * @param {boolean} roxieFirst
 * @returns {object}
 */
function probeRoxieChoiceIndexShift(roxieFirst){
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const f=stagedPainfulSpoons();
  const roxie=f.card('Roxie CEC'),koffing=f.card('Koffing CEC');
  f.source.hand.cards.push(...(roxieFirst?[roxie,koffing]:[koffing,roxie]));
  f.store.dispatch(new PlayCardAction(f.source.id,roxieFirst?0:1,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  const prompt=f.state.prompts.find(p=>p.result===undefined&&
    p.constructor.name==='ChooseCardsPrompt');
  assert.ok(prompt,'Original Roxie must prompt owner to discard a Pokémon');
  const validatorAccepted=prompt.validate([koffing],f.state);
  const blocked=[...prompt.options.blocked];
  const hand=f.source.hand.cards.map(c=>c.fullName);
  let nativeStoreError=null;
  try{withRoxieTrainerDiscardType(()=>
    f.store.dispatch(new ResolvePromptAction(prompt.id,[koffing])));}
  catch(e){nativeStoreError=String(e?.message??e);}
  return {roxieFirst,validatorAccepted,blocked,hand,
    nativeStoreError,promptSettled:prompt.result!==undefined,
    nativePrompts:f.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    scope:'Actual native owner Roxie CEC ChooseCards with real Koffing CEC, two physical hand orders'};
}

/**
 * Genuine native Roxie prompt with the actual rank31 singleton Tapu Lele-GX
 * as its proposed payment. Printed Roxie excludes Pokémon-GX explicitly.
 * Observe the original Store response; do not infer acceptance in advance.
 * @param {0|1} [seat=0]
 * @param {boolean} [guarded=false]
 * @returns {object}
 */
function probeRoxieForbiddenGXPayment(seat=0,guarded=false){
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const f=stagedPainfulSpoons(seat);
  const gx=f.card('Tapu Lele-GX GRI');
  const roxie=f.card('Roxie CEC');
  f.source.hand.cards.push(gx,roxie);
  f.store.dispatch(new PlayCardAction(f.source.id,1,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  const prompt=f.state.prompts.find(p=>p.result===undefined&&
    p.constructor.name==='ChooseCardsPrompt');
  assert.ok(prompt,'Original Roxie must create a native choose-cards prompt');
  const validatorAccepted=prompt.validate([gx],f.state);
  const blocked=[...prompt.options.blocked];
  const cardsBefore=f.source.deck.cards.length;
  let storeError=null;
  try{
    withRoxieTrainerDiscardType(()=>{
      const settle=()=>f.store.dispatch(new ResolvePromptAction(prompt.id,[gx]));
      return guarded?withPaperRoxiePayment(settle):settle();
    });
  }catch(e){storeError=String(e?.message??e);}
  return {
    seat,guarded,selectedPrinting:gx.fullName,
    printedRoxieDisallowsPokemonGX:true,
    validatorAccepted,blocked,
    sourceCardName:prompt.sourceCard?.fullName??null,
    storeError,
    promptSettled:prompt.result!==undefined,
    gxPhysicallyDiscarded:f.source.discard.cards.includes(gx),
    roxiePhysicallyDiscarded:f.source.discard.cards.includes(roxie),
    ownerHandAfter:f.source.hand.cards.map(x=>x.fullName),
    physicalCardsDrawn:cardsBefore-f.source.deck.cards.length,
    scope:'Actual original rank31 printed GX payment in staged Store, not original full game'
  };
}

if(require.main===module)console.log(JSON.stringify([
  runRank31RoxieSpoons(false),runRank31RoxieSpoons(true)
],null,2));
module.exports={runRank31RoxieSpoons,probeRoxieChoiceIndexShift,probeRoxieForbiddenGXPayment};
