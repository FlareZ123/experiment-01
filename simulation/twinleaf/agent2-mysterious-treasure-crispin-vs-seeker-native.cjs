'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const OUTPUT=path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');
function native(relative){return require(path.join(OUTPUT,relative));}
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
const REPO_ROOT=path.resolve(__dirname,'../..');
const SOURCE_PATHS=[
  'simulation/twinleaf/agent2-mysterious-treasure-crispin-vs-seeker-native.cjs',
  'simulation/twinleaf/agent5-attack-special-arbitration-native.cjs',
  'simulation/twinleaf/agent46-treasure-cleanup-native-observer.cjs',
  'simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs',
  'simulation/twinleaf/agent49-mysterious-treasure-native-probe.cjs',
  'results/aichi-2026/full-decklists.json'
];
function gitRevision(cwd){return execFileSync('git',['rev-parse','HEAD'],
  {cwd,encoding:'utf8'}).trim();}
function hashFile(relative){
  return {path:relative,sha256:crypto.createHash('sha256')
    .update(fs.readFileSync(path.join(REPO_ROOT,relative))).digest('hex')};
}

const {stage}=require('./agent5-attack-special-arbitration-native.cjs');
const {finishStagedNativeItem}=require('./agent46-treasure-cleanup-native-observer.cjs');
const {withPaperPromptContractPortfolio}=
  require('./agent41-paper-prompt-contract-portfolio.cjs');

const ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const TREASURE='Mysterious Treasure FLI';
const CRISPIN='Crispin SCR';
const VS_SEEKER='VS Seeker PHF';
const BATTLE_COMPRESSOR='Battle Compressor PHF';
const TARGET='Regidrago VSTAR SIT';
const DONOR_PRINTINGS=[
  'Noivern ex PAL',
  'Dragapult ex TWM',
  'Dialga-GX UPR'
];

/**
 * @param {object} x Staged native Store.
 * @param {object} prompt Native ChooseCardsPrompt.
 * @param {object} expectedCards Expected owner zone backing the prompt.
 * @param {string} sourcePrinting Exact source Item printing.
 * @param {object} selected Physical card object selected by the owner.
 * @returns {object} Owner-only prompt receipt.
 */
function resolveOneOwnerCardPrompt(x,prompt,expectedCards,sourcePrinting,selected){
  assert.equal(prompt.constructor.name,'ChooseCardsPrompt');
  assert.equal(prompt.playerId,x.owner.id);
  assert.equal(prompt.sourceCard?.fullName,sourcePrinting);
  assert.strictEqual(prompt.cards,expectedCards,
    'Prompt must expose only the expected owner-controlled zone');
  assert.ok(prompt.cards.cards.includes(selected),
    'Selected physical card must be present in the owner prompt');
  const answer=[selected];
  assert.equal(prompt.validate(answer,x.store.state),true,
    'Pinned native prompt validator must accept the exact owner selection');
  x.store.dispatch(new (native('game/store/actions/resolve-prompt-action')
    .ResolvePromptAction)(prompt.id,answer));
  return {
    promptKind:prompt.constructor.name,
    promptMessage:prompt.message??null,
    ownerMatched:prompt.playerId===x.owner.id,
    sourcePrinting:prompt.sourceCard.fullName,
    selectedPrinting:selected.fullName,
    selectedPhysicalObjectPreserved:true,
    nativePromptValidatorAccepted:true
  };
}

/**
 * Resolve Battle Compressor's native choose-up-to-three deck prompt.
 * @param {object} x Staged native Store.
 * @param {object} prompt Native ChooseCardsPrompt.
 * @param {object} expectedCards Expected owner deck backing the prompt.
 * @param {string} sourcePrinting Exact printed Item.
 * @param {Array<object>} selectedCards Exact physical donor objects.
 * @returns {object} Native selection and physical identity receipt.
 */
function resolveOwnerMultiCardPrompt(x,prompt,expectedCards,sourcePrinting,selectedCards){
  assert.equal(prompt.constructor.name,'ChooseCardsPrompt');
  assert.equal(prompt.playerId,x.owner.id);
  assert.equal(prompt.sourceCard?.fullName,sourcePrinting);
  assert.strictEqual(prompt.cards,expectedCards,
    'Prompt must expose only the expected owner-controlled deck');
  assert.equal(prompt.options?.min,0);
  assert.equal(prompt.options?.max,3);
  assert.equal(selectedCards.length,3);
  assert.equal(new Set(selectedCards).size,3);
  assert.ok(selectedCards.every(card=>prompt.cards.cards.includes(card)));
  const answer=selectedCards;
  assert.equal(prompt.validate(answer,x.store.state),true,
    'Pinned native prompt validator must accept the exact three donor objects');
  x.store.dispatch(new ResolvePromptAction(prompt.id,answer));
  return {
    promptKind:prompt.constructor.name,
    promptMessage:prompt.message??null,
    ownerMatched:prompt.playerId===x.owner.id,
    sourcePrinting:prompt.sourceCard.fullName,
    min:prompt.options.min,
    max:prompt.options.max,
    selectedPrintings:selectedCards.map(card=>card.fullName),
    selectedCardIds:selectedCards.map(card=>card.id),
    selectedPhysicalObjectsPreserved:true,
    nativePromptValidatorAccepted:true
  };
}

/**
 * Resolve only known non-choice presentation prompts after VS Seeker.
 * Unknown prompt kinds fail rather than being guessed.
 * @param {object} x Staged native Store.
 * @returns {Array<object>} Accepted presentation prompt sequence.
 */
function finishVsSeekerPresentation(x){
  const accepted=[];
  for(let i=0;i<8;i++){
    const prompt=x.store.state.prompts.find(p=>p.result===undefined);
    if(!prompt)return accepted;
    const kind=prompt.constructor.name;
    let answer;
    if(kind==='ShowCardsPrompt')answer=true;
    else if(kind==='WaitPrompt')answer=null;
    else throw Error('UNHANDLED_VS_SEEKER_PRESENTATION_PROMPT:'+kind);
    if(typeof prompt.validate==='function')
      assert.equal(prompt.validate(answer,x.store.state),true,
        'Pinned native '+kind+' presentation response must validate');
    x.store.dispatch(new ResolvePromptAction(prompt.id,answer));
    accepted.push({kind,ownerMatched:prompt.playerId===x.owner.id,
      nativeDispatchAccepted:true});
  }
  throw Error('VS_SEEKER_PRESENTATION_PROMPTS_EXCEEDED_8');
}

/**
 * Stage the exact first-player Mysterious Treasure -> VS Seeker sequence.
 * This is a native card-effect fixture, not a full game or policy evaluation.
 * @param {0|1} seat Physical player seat.
 * @returns {object} Native prompt and physical-zone receipts.
 */
function observeSeat(seat){
  const {result,audit}=withPaperPromptContractPortfolio(()=>{
    const x=stage(seat);
    x.state.turn=1;
    x.state.phase=x.GamePhase.PLAYER_TURN;
    x.state.activePlayer=seat;
    const {CardManager}=native('game/cards/card-manager');
    const manager=CardManager.getInstance();
    let nextId=10000;
    const card=printing=>{
      const c=manager.getCardByName(printing);
      assert.ok(c,'Missing pinned native printing '+printing);
      c.id=nextId++;
      return c;
    };
    const treasure=card(TREASURE);
    const crispin=card(CRISPIN);
    const vsSeeker=card(VS_SEEKER);
    const battleCompressor=card(BATTLE_COMPRESSOR);
    const target=card(TARGET);
    const donors=DONOR_PRINTINGS.map(printing=>card(printing));
    x.owner.hand.cards.length=0;
    x.owner.hand.cards.push(treasure,crispin,vsSeeker,battleCompressor);
    x.owner.deck.cards.length=0;
    x.owner.deck.cards.push(target,...donors);
    assert.equal(x.owner.discard.cards.length,0);
    const {PlayCardAction,PlayerType,SlotType}=
      native('game/store/actions/play-card-action');
    // Mysterious Treasure payment: the owner chooses Crispin from their hand.
    x.store.dispatch(new PlayCardAction(x.owner.id,0,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    const paymentPrompt=x.state.prompts.find(p=>p.result===undefined);
    const payment=resolveOneOwnerCardPrompt(
      x,paymentPrompt,x.owner.hand,TREASURE,crispin);
    assert.ok(x.owner.discard.cards.includes(crispin),
      'Crispin payment must move the same physical card into owner discard');

    // Mysterious Treasure search: choose Regidrago VSTAR from own deck.
    const searchPrompt=x.state.prompts.find(p=>p.result===undefined);
    const search=resolveOneOwnerCardPrompt(
      x,searchPrompt,x.owner.deck,TREASURE,target);
    assert.ok(x.owner.hand.cards.includes(target),
      'Selected Dragon Pokémon must move from own deck into own hand');

    const cleanup=finishStagedNativeItem(x);
    assert.equal(cleanup.unresolvedPrompts,0);
    assert.equal(cleanup.itemInOwnerDiscard,true);
    assert.equal(cleanup.printedShufflePaperCertified,false);

    // VS Seeker recovers the exact physical Crispin card from own discard.
    const vsIndex=x.owner.hand.cards.indexOf(vsSeeker);
    assert.ok(vsIndex>=0,'VS Seeker must remain in owner hand after Treasure');
    x.store.dispatch(new PlayCardAction(x.owner.id,vsIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    const recoveryPrompt=x.state.prompts.find(p=>p.result===undefined);
    const recovery=resolveOneOwnerCardPrompt(
      x,recoveryPrompt,x.owner.discard,VS_SEEKER,crispin);
    const presentation=finishVsSeekerPresentation(x);

    assert.ok(x.owner.hand.cards.includes(crispin),
      'VS Seeker must return the same physical Crispin card to owner hand');
    assert.ok(!x.owner.discard.cards.includes(crispin),
      'Recovered Crispin must leave owner discard');
    assert.ok(x.owner.hand.cards.includes(target));
    assert.ok(x.owner.discard.cards.includes(treasure));
    assert.ok(x.owner.discard.cards.includes(vsSeeker));

    const battleCompressorIndex=x.owner.hand.cards.indexOf(battleCompressor);
    assert.notEqual(battleCompressorIndex,-1,
      'Battle Compressor remains in hand after VS Seeker recovery');
    x.store.dispatch(new PlayCardAction(x.owner.id,battleCompressorIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    const battleCompressorPrompt=x.state.prompts.find(p=>p.result===undefined);
    assert.ok(battleCompressorPrompt,'Battle Compressor opens a native deck-selection prompt');
    const battleCompressorSelection=resolveOwnerMultiCardPrompt(
      x,battleCompressorPrompt,x.owner.deck,BATTLE_COMPRESSOR,donors
    );
    const battleCompressorCleanup=finishStagedNativeItem(x,BATTLE_COMPRESSOR);
    assert.equal(battleCompressorCleanup.unresolvedPrompts,0);
    assert.equal(battleCompressorCleanup.itemInOwnerDiscard,true);
    assert.equal(battleCompressorCleanup.printedShufflePaperCertified,false);
    assert.ok(x.owner.discard.cards.includes(battleCompressor));
    assert.ok(donors.every(card=>x.owner.discard.cards.includes(card)),
      'all three exact Dragon donor physical objects reach discard');
    assert.ok(donors.every(card=>!x.owner.deck.cards.includes(card)),
      'no selected Dragon donor remains in deck');
    assert.equal(x.owner.deck.cards.length,0,
      'all four staged deck cards are accounted for');

    return {
      seat,firstPlayerSeat:seat,globalTurn:x.state.turn,
      startingHand:[TREASURE,CRISPIN,VS_SEEKER,BATTLE_COMPRESSOR],
      startingDeck:[TARGET,...DONOR_PRINTINGS],
      treasurePayment:payment,treasureSearch:search,
      treasureCleanup:cleanup,vsSeekerRecovery:recovery,
      vsSeekerPresentationPrompts:presentation,
      battleCompressorSelection,battleCompressorCleanup,
      finalPhysicalZones:{
        crispinInHand:x.owner.hand.cards.includes(crispin),
        crispinInDiscard:x.owner.discard.cards.includes(crispin),
        treasureInDiscard:x.owner.discard.cards.includes(treasure),
        vsSeekerInDiscard:x.owner.discard.cards.includes(vsSeeker),
        battleCompressorInDiscard:x.owner.discard.cards.includes(battleCompressor),
        regidragoVstarInHand:x.owner.hand.cards.includes(target),
        donorPrintingsInDiscard:donors.filter(card=>x.owner.discard.cards.includes(card))
          .map(card=>card.fullName),
        allThreeDonorsInDiscard:donors.every(card=>x.owner.discard.cards.includes(card)),
        deckEmpty:x.owner.deck.cards.length===0
      },
      physicalCardIds:{
        crispin:crispin.id,
        regidragoVstar:target.id,
        battleCompressor:battleCompressor.id,
        donors:donors.map(card=>({fullName:card.fullName,id:card.id}))
      },
      sameCrispinPhysicalCardHandToDiscardToHand:true,
      actualGameRootOrdinalsClaimed:false,
      fullPaperShuffleCertified:false,
      entirePaperGameQualified:false,
      competitiveQualifiedGames:0
    };
  });
  assert.equal(audit.inspectedTreasurePlayCardRoots,1);
  assert.equal(audit.inspectedTreasurePaymentPrompts,1);
  assert.equal(audit.vetoedTreasureInsufficientRoots,0);
  assert.equal(audit.statusCounts.PAPER_PROMPT_INVALID,0);
  assert.equal(result.finalPhysicalZones.crispinInHand,true);
  assert.equal(result.finalPhysicalZones.crispinInDiscard,false);
  assert.equal(result.finalPhysicalZones.treasureInDiscard,true);
  assert.equal(result.finalPhysicalZones.vsSeekerInDiscard,true);
  assert.equal(result.finalPhysicalZones.regidragoVstarInHand,true);
  return {
    schema:'agent2-crispin-vs-seeker-treasure-battle-compressor-sequence-v2',
    nativeEnginePinned:ENGINE_PIN,
    onlyNativeAcceptedStoreDispatches:true,
    noOpponentPrivateInformationRead:true,
    paperPromptPortfolio:audit,
    ...result
  };
}

function run(){
  const twinleafRevision=execFileSync('git',['-C','vendor/twinleaf','rev-parse','HEAD'],
    {cwd:REPO_ROOT,encoding:'utf8'}).trim();
  assert.equal(twinleafRevision,ENGINE_PIN);
  const report={
    schema:'agent2-crispin-vs-seeker-treasure-battle-compressor-report-v2',
    sourceCodeCommit:gitRevision(REPO_ROOT),
    nativeEnginePinned:ENGINE_PIN,twinleafRevision,
    resolvedSourceAndPolicyHashes:SOURCE_PATHS.map(hashFile),
    seats:[observeSeat(0),observeSeat(1)],
    qualifiedCompetitiveGames:0
  };
  return report;
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\\n');
module.exports={resolveOwnerMultiCardPrompt,observeSeat,run};
