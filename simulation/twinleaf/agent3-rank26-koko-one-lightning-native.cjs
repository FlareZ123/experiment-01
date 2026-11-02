'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {runSeat}=require('./rank26-unown-starter-source-fixture.cjs');
const {physical,prepareCard}=
  require('./rank26-unown-full-crisis-native.cjs');
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const engine=p=>require(path.join(OUTPUT,p));
const {PlayCardAction,PlayerType,SlotType}=
  engine('game/store/actions/play-card-action');
const {UseAbilityAction,AttackAction}=
  engine('game/store/actions/game-actions');
const {ResolvePromptAction}=
  engine('game/store/actions/resolve-prompt-action');
const {GamePhase}=engine('game/store/state/state');
const bench=i=>({player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:i});
const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
const ids=p=>physical(p).map(c=>c.id).sort((a,b)=>a-b);

/** @param {object} f @param {string} name @param {object} target */
function playNative(f,name,target){
  const index=f.own.hand.cards.findIndex(c=>c.name===name);
  assert.ok(index>=0,'Prepared source must own '+name);
  const card=f.own.hand.cards[index];
  f.store.dispatch(new PlayCardAction(f.own.id,index,target));
  assert.equal(f.own.hand.cards.includes(card),false);
  return card;
}

/** @param {object} f */
function readWait(f) {
  const resolved=[];
  for(let i=0;i<12;i++){
    const prompt=f.state.prompts.find(p=>p.result===undefined);
    if(prompt?.constructor.name!=='WaitPrompt')break;
    resolved.push({name:prompt.constructor.name,owner:prompt.playerId});
    f.store.dispatch(new ResolvePromptAction(prompt.id,null));
  }
  return resolved;
}

/**
 * Starts only after a real full-original-60 source 2+2+1 five self-KO
 * prepared original source turn 1 board. ONE source Lightning is moved to
 * discard. The other Lightning remains in the original physical deck zone.
 * @param {object} f
 */
function oneLightningAfterFiveKOs(f,{ownerColognePolicy=false}={}){
  const own=f.own,opp=f.opponent;
  const ownIds=ids(own),opponentIds=ids(opp);
  assert.equal(ownIds.length,60);
  assert.equal(opponentIds.length,60);
  assert.equal(new Set(ownIds).size,60);
  assert.equal(new Set(opponentIds).size,60);
  assert.equal(f.state.turn,1);
  assert.equal(opp.getPrizeLeft(),1);
  assert.equal(own.active.getPokemonCard()?.name,'Unown');
  assert.equal(own.bench[0].getPokemonCard()?.name,'Meloetta ex');
  assert.equal(own.bench[1].getPokemonCard()?.name,'Tapu Koko Prism Star');
  assert.equal(opp.active.getPokemonCard()?.name,'Iron Thorns ex');
  assert.equal(opp.bench.filter(s=>s.getPokemonCard()).length,0);
  for(const name of ['Canceling Cologne','Double Colorless Energy',
    'Technical Machine: Crisis Punch','Escape Rope'])
    prepareCard(own,name,own.hand);
  prepareCard(own,'Lightning Energy',own.discard);
  const first=own.discard.cards.filter(c=>c.name==='Lightning Energy');
  assert.equal(first.length,1,'Exactly one source Lightning before Koko');
  assert.deepEqual(ids(own),ownIds);
  const receipts=[];

  let cologne;
  if(ownerColognePolicy){
    const {withRank26CologneOpener}=
      require('./rank26-cologne-opener.cjs');
    const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
    const policy=withRank26CologneOpener(f.sourceSeat,()=>{
      const actor={client:{id:own.id}};
      const selected=SimpleTacticsAi.prototype.decodeNextAction.call(actor,f.state);
      assert.equal(selected?.constructor.name,'PlayCardAction');
      const chosen=own.hand.cards[selected.handIndex];
      assert.equal(chosen?.name,'Canceling Cologne');
      f.store.dispatch(selected);
      return chosen;
    },{unlockBenchedKoko:true,minimumDiscardLightning:1});
    assert.equal(policy.policyAudit.version,
      'rank26-cologne-pre-koko-single-lightning-v3');
    assert.equal(policy.policyAudit.opportunitiesSelected,1);
    cologne=policy.result;
    receipts.push({step:'SourceOwnerOneLightningColognePolicy',
      version:policy.policyAudit.version,opportunities:1});
  }else{
    cologne=playNative(f,'Canceling Cologne',board);
  }
  assert.equal(own.discard.cards.includes(cologne),true);
  receipts.push({step:'Cologne',card:cologne.fullName,id:cologne.id,
    physicallyDiscarded:true});

  const koko=own.bench[1].getPokemonCard();
  f.store.dispatch(new UseAbilityAction(own.id,'Dance of the Ancients',bench(1)));
  receipts.push({step:'KokoWait',prompts:readWait(f)});
  const prompt=f.state.prompts.find(p=>p.result===undefined);
  assert.equal(prompt?.constructor.name,'AttachEnergyPrompt',
    'Expected genuine one-Lightning native owner Koko AttachEnergyPrompt');
  assert.equal(prompt.playerId,own.id);
  const chosen=[{card:first[0],to:bench(0)}];
  const nativeValidated=prompt.validate(chosen,f.state);
  assert.equal(nativeValidated,true,
    'Pinned engine rejects paper-legal single Lightning Koko attachment');
  f.store.dispatch(new ResolvePromptAction(prompt.id,chosen));
  assert.equal(own.bench[0].energies.cards.includes(first[0]),true,
    'Koko did not put the single source Lightning on Meloetta');
  assert.equal(own.discard.cards.includes(first[0]),false);
  assert.equal(own.lostzone.cards.includes(koko),true);
  receipts.push({step:'OneLightningKoko',singleMove:true,
    energyId:first[0].id,recipient:'Meloetta ex',
    kokoLostZoneId:koko.id,paperOneLightning:true});

  const dce=playNative(f,'Double Colorless Energy',bench(0));
  const tm=playNative(f,'Technical Machine: Crisis Punch',bench(0));
  assert.equal(own.bench[0].energies.cards.includes(dce),true);
  assert.equal(own.bench[0].tools.includes(tm),true);
  const attackEnergy=own.bench[0].energies.cards.map(c=>c.name);
  assert.deepEqual(attackEnergy.sort(),
    ['Double Colorless Energy','Lightning Energy'].sort());
  receipts.push({step:'MeloTwoCardsThreeEnergy',energyNames:attackEnergy});

  const escape=playNative(f,'Escape Rope',board);
  const promote=f.state.prompts.find(p=>p.result===undefined);
  assert.equal(promote?.constructor.name,'ChoosePokemonPrompt');
  assert.equal(promote.playerId,own.id);
  assert.equal(promote.validate([own.bench[0]],f.state),true);
  f.store.dispatch(new ResolvePromptAction(promote.id,[own.bench[0]]));
  assert.equal(own.active.getPokemonCard()?.name,'Meloetta ex');
  assert.equal(own.active.energies.cards.includes(dce),true);
  receipts.push({step:'PromoteMelo',escapeCardId:escape.id});

  f.store.dispatch(new AttackAction(own.id,'Crisis Punch'));
  receipts.push({step:'Attack',attack:'Crisis Punch',
    opponentPrizeBefore:opp.getPrizeLeft()});
  for(let i=0;i<12;i++){
    const waiting=f.state.prompts.find(p=>p.result===undefined);
    if(!waiting)break;
    if(waiting.constructor.name==='WaitPrompt'){
      f.store.dispatch(new ResolvePromptAction(waiting.id,null));
      continue;
    }
    if(waiting.constructor.name==='ChoosePrizePrompt'&&waiting.playerId===own.id){
      const prizes=own.prizes.filter(p=>p.cards.length)
        .slice(0,waiting.options.count);
      assert.equal(waiting.validate(prizes,f.state),true);
      f.store.dispatch(new ResolvePromptAction(waiting.id,prizes));
      continue;
    }
    throw Error('Unexpected attack continuation prompt: '+waiting.constructor.name);
  }
  assert.equal(f.state.phase,GamePhase.FINISHED);
  assert.equal(f.state.winner,f.sourceSeat);
  assert.equal(opp.active.getPokemonCard(),undefined);
  assert.deepEqual(ids(own),ownIds);
  assert.deepEqual(ids(opp),opponentIds);
  return {paperClaim:'One discarded Lightning can accelerate to Meloetta',
    sourceSeat:f.sourceSeat,pinnedNativePromptAcceptedOneLightning:true,
    originalPhysical60ConservedBothSeats:true,
    opponentPrizesBeforeAttack:1,ownerTurn:1,
    firstturnCrisisPunchNativeAttack:true,
    originalSecondLightningNotRequiredForAttack:true,
    stagedSourceHand:true,stagedSourceLightning:true,
    randomizedOriginalSourceDeal:false,competitiveGameQualified:false,
    ownerColognePolicy,receipts};
}

/** @returns {object} */
function run(){
  return {schema:'agent3-koko-one-basic-lightning-native-source60-v1',
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    opponentRank:6,sourceRank:26,
    cases:[runSeat(0,oneLightningAfterFiveKOs),
      runSeat(1,oneLightningAfterFiveKOs)],
    exactOriginal60BothSeats:true,conditionalStaged:true,
    competitiveGameQualified:false};
}
module.exports={run,oneLightningAfterFiveKOs};
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
