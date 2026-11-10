'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const path=require('node:path');
const {stagedPainfulSpoons}=
  require('../simulation/twinleaf/agent4-rank31-alakazam-movesource-native.cjs');
const {withOriginal29PrintedFidelity}=
  require('../simulation/twinleaf/agent50-original29-printed-fidelity-hook.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {audit:printedFieldAudit,numberKey,auditOriginalNonPokemonAvailability}=
  require('../simulation/evaluation/agent50-aichi29-native-printed-attack-parity.cjs');


const OUTPUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name Actual compiled pinned module. */
const native=name=>require(path.join(OUTPUT,name));
const {AttackAction}=native('game/store/actions/game-actions');
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
const {PlayerType,SlotType}=native('game/store/actions/play-card-action');

/**
 * Native two-seat printed Resistance counterfactual against an undamaged
 * Mew V. One external Strength-free 10-damage Fighting attack.
 *
 * @param {0|1} seat Physical attacking seat.
 * @param {boolean} corrected Whether to install the reversible paper hook.
 */
function resistanceReceipt(seat,corrected){
  const execute=()=>{
    const f=stagedPainfulSpoons(seat);
    const {source,opponent,store,state}=f;
    const fighter=f.card('Timburr BLW');
    const basic=f.card('Fighting Energy SVE');
    const mew=f.card('Mew V FST');
    source.active.cards.splice(0,source.active.cards.length,fighter,basic);
    source.active.energies.cards.splice(0,source.active.energies.cards.length,basic);
    opponent.active.cards.splice(0,opponent.active.cards.length,mew);
    opponent.active.damage=0;
    source.hand.cards.splice(0,source.hand.cards.length);
    assert.equal(fighter.attacks[0].name,'Pound');
    assert.equal(fighter.attacks[0].damage,10);
    store.dispatch(new AttackAction(source.id,'Pound'));
    const prompts=[];
    for(let k=0;k<20;k++){
      const p=state.prompts.find(x=>x.result===undefined);
      if(!p)break;
      assert.equal(p.constructor.name,'WaitPrompt');
      prompts.push(p.constructor.name);
      store.dispatch(new ResolvePromptAction(p.id,null));
    }
    assert.equal(state.prompts.filter(x=>x.result===undefined).length,0);
    return {
      seat,corrected,sourcePrinting:fighter.fullName,
      defenderPrinting:mew.fullName,
      defenderPrintedResistance:mew.resistance,
      finalDamage:opponent.active.damage,
      beforePrizes:source.getPrizeLeft(),
      prompts,
      qualifiedGame:false,competitiveGamesQualified:0
    };
  };
  return corrected?withOriginal29PrintedFidelity(execute).result:execute();
}

/**
 * Exact source attack name, not the native misspelling. A physical Lightning
 * Energy is discarded from the corrected pinned CES48 GX effect.
 *
 * @param {0|1} seat Actual native attacking seat.
 */
function electrodeReceipt(seat){
  return withOriginal29PrintedFidelity(()=>{
    const f=stagedPainfulSpoons(seat);
    const {source,opponent,store,state}=f;
    const electrode=f.card('Electrode-GX CES');
    const first=f.card('Lightning Energy SVE');
    const second=f.card('Lightning Energy SVE');
    source.active.cards.splice(0,source.active.cards.length,
      electrode,first,second);
    source.active.energies.cards.splice(0,source.active.energies.cards.length,
      first,second);
    source.hand.cards.splice(0,source.hand.cards.length);
    opponent.active.damage=0;
    assert.equal(electrode.attacks[1].name,'Crush and Burn-GX');
    store.dispatch(new AttackAction(source.id,'Crush and Burn-GX'));
    let spent=false;
    const prompts=[];
    for(let k=0;k<20;k++){
      const p=state.prompts.find(x=>x.result===undefined);
      if(!p)break;
      const kind=p.constructor.name;
      let answer;
      if(kind==='WaitPrompt')answer=null;
      else if(kind==='DiscardEnergyPrompt'){
        assert.equal(spent,false);
        const requested=[{
          from:{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0},
          index:1
        }];
        answer=p.decode(requested,state);
        assert.equal(p.validate(answer),true);
        spent=true;
      }else assert.fail('Unknown Electrode-GX pinned native prompt '+kind);
      prompts.push(kind);
      store.dispatch(new ResolvePromptAction(p.id,answer));
    }
    assert.equal(state.prompts.filter(p=>p.result===undefined).length,0);
    assert.equal(spent,true);
    assert.equal(ownerHasUsedGx(source),true);
    assert.equal(source.discard.cards.includes(first),true);
    assert.equal(source.discard.cards.includes(second),false);
    return {seat,sourcePrinting:electrode.fullName,
      actionName:'Crush and Burn-GX',physicalEnergyDiscarded:1,
      observedDamage:opponent.active.damage,
      prompts,qualifiedGame:false,competitiveGamesQualified:0};
  }).result;
}
/** @param {object} player Native player. */
function ownerHasUsedGx(player){return player.usedGX===true;}


/**
 * Original rank9 PAR17 Toedscruel printed attack heals 30 after hitting.
 * The pinned baseline names it Scratch and has no attack healing branch.
 *
 * @param {0|1} seat Native physical seat.
 * @param {boolean} corrected Whether to install the paper print/effect hook.
 */
function toedscruelReceipt(seat,corrected){
  const execute=()=>{
    const f=stagedPainfulSpoons(seat);
    const {source,opponent,store,state}=f;
    const basic=f.card('Toedscool PAR');
    const evolution=f.card('Toedscruel PAR');
    const energies=Array.from({length:3},()=>
      f.card('Grass Energy SVE'));
    source.active.cards.splice(0,source.active.cards.length,
      basic,evolution,...energies);
    source.active.energies.cards.splice(0,
      source.active.energies.cards.length,...energies);
    source.active.damage=70;
    source.hand.cards.splice(0,source.hand.cards.length);
    opponent.active.damage=0;
    const name=corrected?'Mushroom Drain':'Scratch';
    assert.equal(evolution.attacks[0].name,name);
    store.dispatch(new AttackAction(source.id,name));
    const prompts=[];
    for(let k=0;k<20;k++){
      const p=state.prompts.find(x=>x.result===undefined);
      if(!p)break;
      assert.equal(p.constructor.name,'WaitPrompt');
      prompts.push(p.constructor.name);
      store.dispatch(new ResolvePromptAction(p.id,null));
    }
    assert.equal(state.prompts.filter(p=>p.result===undefined).length,0);
    return {seat,corrected,sourcePrinting:evolution.fullName,
      physicalAttack:name,damageBefore:70,damageAfter:source.active.damage,
      opponentDamage:opponent.active.damage,prompts,
      competitivelyQualifiedGames:0};
  };
  return corrected?withOriginal29PrintedFidelity(execute).result:execute();
}


/**
 * Re-enable the genuine pinned MEG86 Mega Absol ex class that is otherwise
 * hidden by its mismatched M1L fullName index. Resolve actual Terminal Period
 * against an opponent at exactly six damage counters and settle two Prizes.
 *
 * @param {0|1} seat Acting physical seat.
 */
function megaAbsolAliasKoReceipt(seat){
  return withOriginal29PrintedFidelity(()=>{
    const f=stagedPainfulSpoons(seat);
    const {store,state,source,opponent}=f;
    const card=f.card('Mega Absol ex MEG');
    const dark=Array.from({length:2},()=>f.card('Darkness Energy SVE'));
    source.active.cards.splice(0,source.active.cards.length,card,...dark);
    source.active.energies.cards.splice(0,
      source.active.energies.cards.length,...dark);
    source.hand.cards.splice(0,source.hand.cards.length);
    const victim=opponent.active.getPokemonCard();
    assert.equal(victim.fullName,'Shadow Rider Calyrex V CRE');
    opponent.active.damage=60;
    assert.equal(card.name,'Mega Absol ex');
    assert.equal(card.set,'MEG');
    assert.equal(card.setNumber,'86');
    assert.equal(card.attacks[0].name,'Terminal Period');
    const before=source.getPrizeLeft();
    store.dispatch(new AttackAction(source.id,'Terminal Period'));
    const prompts=[];
    for(let k=0;k<30;k++){
      const p=state.prompts.find(x=>x.result===undefined);
      if(!p)break;
      const kind=p.constructor.name;
      let answer;
      if(kind==='WaitPrompt')answer=null;
      else if(kind==='ChoosePrizePrompt'&&p.playerId===source.id)
        answer=source.prizes.filter(row=>row.cards.length)
          .slice(0,p.options.count);
      else if(kind==='ChoosePokemonPrompt'&&p.playerId===opponent.id)
        answer=[opponent.bench[0]];
      else assert.fail('Unrecognized native terminal KO prompt '+kind);
      assert.equal(p.validate(answer,state),true,kind+' native validate');
      prompts.push(kind);
      store.dispatch(new ResolvePromptAction(p.id,answer));
    }
    assert.equal(state.prompts.filter(x=>x.result===undefined).length,0);
    assert.equal(opponent.discard.cards.includes(victim),true);
    return {seat,requestedPrinting:'Mega Absol ex MEG',
      authenticNativeFullName:card.fullName,authenticNativeSet:card.set,
      printedAttack:'Terminal Period',defenderAt60CountersKo:true,
      prizesBefore:before,prizesAfter:source.getPrizeLeft(),
      promptTypes:prompts,qualifiedGame:false,competitivelyQualifiedGames:0};
  }).result;
}

for(const seat of [0,1]){
  test(`original Aichi printed Fighting Resistance changes physical Mew V attack in seat ${seat}`,()=>{
    const unpatched=resistanceReceipt(seat,false);
    const corrected=resistanceReceipt(seat,true);
    assert.deepEqual(unpatched.defenderPrintedResistance,[]);
    assert.deepEqual(corrected.defenderPrintedResistance,
      [{type:6,value:-30}]);
    assert.equal(unpatched.finalDamage,10);
    assert.equal(corrected.finalDamage,0);
    assert.equal(corrected.beforePrizes,6);
    console.log('AGENT50_NATIVE_PAPER_RESISTANCE '+JSON.stringify({
      seat,unpatched,corrected,competitiveGamesQualified:0
    }));
  });
  test(`original rank8/9/11 Mega Absol MEG alias enables real native Terminal Period KO in seat ${seat}`,()=>{
    const r=megaAbsolAliasKoReceipt(seat);
    assert.equal(r.requestedPrinting,'Mega Absol ex MEG');
    assert.equal(r.authenticNativeFullName,'Mega Absol ex M1L');
    assert.equal(r.authenticNativeSet,'MEG');
    assert.equal(r.defenderAt60CountersKo,true);
    assert.equal(r.prizesBefore,6);
    assert.equal(r.prizesAfter,4);
    assert.equal(r.competitivelyQualifiedGames,0);
    console.log('AGENT50_NATIVE_MEGA_ABSOL_ALIASED_KO '+JSON.stringify(r));
  });
  test(`original rank9 Toedscruel Mushroom Drain heals 30 after native attack in seat ${seat}`,()=>{
    const baseline=toedscruelReceipt(seat,false);
    const corrected=toedscruelReceipt(seat,true);
    assert.equal(baseline.physicalAttack,'Scratch');
    assert.equal(corrected.physicalAttack,'Mushroom Drain');
    assert.equal(baseline.damageAfter,70);
    assert.equal(corrected.damageAfter,40);
    assert.equal(baseline.opponentDamage,80);
    assert.equal(corrected.opponentDamage,80);
    console.log('AGENT50_NATIVE_PAPER_TOEDSCRUEL_HEAL '+JSON.stringify({
      seat,baseline,corrected,competitivelyQualifiedGames:0
    }));
  });
  test(`original CES48 printed Crush and Burn-GX name is accepted by native engine in seat ${seat}`,()=>{
    const r=electrodeReceipt(seat);
    assert.equal(r.actionName,'Crush and Burn-GX');
    assert.equal(r.physicalEnergyDiscarded,1);
    assert.equal(r.observedDamage,80);
    assert.equal(r.qualifiedGame,false);
    console.log('AGENT50_NATIVE_PAPER_ELECTRODE_NAME '+JSON.stringify(r));
  });
}

test('all eleven genuine pinned original Aichi native set aliases now instantiate as real card clones',()=>{
  const baseline=printedFieldAudit();
  const aliases=baseline.findings.filter(x=>x.nativeAlias);
  assert.equal(aliases.length,11);
  assert.equal(baseline.missingNativePrintings,0);
  const corrected=withOriginal29PrintedFidelity(()=>{
    const manager=initializeCards();
    return aliases.map(row=>{
      const original=manager.getCardByName(row.requestedFullName);
      assert.ok(original,'Unresolved registered native printed card '+
        row.requestedFullName);
      assert.equal(original.name,row.name);
      assert.equal(original.set,row.set);
      assert.equal(numberKey(original.setNumber),numberKey(row.number));
      assert.equal(original.fullName,row.nativeFullName);
      return {source:row.requestedFullName,
        pinnedFullName:original.fullName,
        ranks:row.ranks};
    });
  });
  assert.equal(corrected.audit.aliases.length,11);
  assert.equal(corrected.result.length,11);
  assert.equal(corrected.audit.competitiveGamesQualified,0);
  console.log('AGENT50_ALL_ORIGINAL_NATIVE_ALIASES '+JSON.stringify({
    aliasCount:11,
    nativeMissingPrintings:0,
    allClonesResolved:true,
    aliases:corrected.result,
    competitiveGamesQualified:0
  }));
});

test('all nine original non-Pokémon Trainer/Energy native aliases instantiate exact printed clones',()=>{
  const census=auditOriginalNonPokemonAvailability();
  const aliases=census.nativePrintAliases;
  assert.equal(census.total,146);
  assert.equal(aliases.length,9);
  assert.equal(census.exactMatches,136);
  const base=initializeCards();
  for(const row of aliases)
    assert.ok(!base.getCardByName(row.requested),
      'Original request unexpectedly resolved before scoped alias bridge');
  const scoped=withOriginal29PrintedFidelity(()=>{
    const manager=initializeCards();
    return aliases.map(row=>{
      const card=manager.getCardByName(row.requested);
      assert.ok(card,'Unresolved original Aichi Trainer/Energy '+row.requested);
      assert.equal(card.name,row.name);
      assert.equal(card.set,row.set);
      assert.equal(numberKey(card.setNumber),numberKey(row.number));
      assert.equal(card.fullName,row.canonicalNativeName);
      return {original:row.requested,native:card.fullName,
        category:row.category,ranks:row.ranks};
    });
  });
  assert.equal(scoped.result.length,9);
  assert.equal(scoped.audit.aliases.length,9);
  assert.equal(scoped.audit.paperLegalityCertified,false);
  assert.equal(scoped.audit.competitiveGamesQualified,0);
  assert.ok(scoped.result.some(x=>x.category==='Trainer'));
  assert.ok(scoped.result.some(x=>x.category==='Energy'));
  for(const row of aliases)
    assert.ok(!base.getCardByName(row.requested),
      'Original request unexpectedly resolved before scoped alias bridge');
  console.log('AGENT50_ALL_ORIGINAL_NONPOKEMON_ALIASES '+JSON.stringify({
    nativeAliases:scoped.result,
    originalNonPokemonPrintings:census.total,
    missingExactPrintedIdentity:census.missingExactPrintedIdentity.length,
    competitiveGamesQualified:0
  }));
});

/**
 * Apply the genuine original-rank9/30/31 POR88 Telepathic Psychic Energy
 * through the pinned Store, retaining the original source lookup string.
 * This staged scene is only a mechanical custody and owner-prompt witness.
 * @param {0|1} seat Actual acting native seat.
 * @returns {object} The paid attachment and native prompt identity.
 */
function originalTelepathSourceAttachment(seat){
  return withOriginal29PrintedFidelity(()=>{
    const f=stagedPainfulSpoons(seat);
    const {PlayCardAction,PlayerType,SlotType}=
      native('game/store/actions/play-card-action');
    const energy=f.card('Telepathic Psychic Energy POR');
    assert.equal(energy.fullName,'Telepath [P] Energy M3');
    const searchable=f.card('Duskull VIV');
    f.source.deck.cards.push(searchable);
    assert.ok(f.source.deck.cards.includes(searchable));
    f.source.hand.cards.splice(0,f.source.hand.cards.length,energy);
    f.source.energyPlayedTurn=0;
    f.store.dispatch(new PlayCardAction(f.source.id,0,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    const prompts=f.state.prompts.filter(p=>p.result===undefined);
    assert.ok(f.source.active.energies.cards.includes(energy),
      'Original source alias must physically attach the real native Energy');
    assert.equal(f.source.energyPlayedTurn,f.state.turn);
    assert.equal(f.source.hand.cards.includes(energy),false);
    assert.ok(prompts.some(p=>p.constructor.name==='ChooseCardsPrompt'),
      'Original source Energy must produce its genuine Psychic search prompt');
    return {seat,registeredPrinting:'Telepathic Psychic Energy POR',
      nativeFullName:energy.fullName,owner:f.source.id,
      physicalAttached:true,ownerHandEnergyRemoved:true,
      nativePromptTypes:prompts.map(p=>p.constructor.name),
      paperQualified:false,competitiveGamesQualified:0};
  }).result;
}

for(const seat of [0,1]){
  test('original POR88 native Telepath attachment opens owner-only Psychic search in seat '+seat,()=>{
    const receipt=originalTelepathSourceAttachment(seat);
    assert.equal(receipt.physicalAttached,true);
    assert.ok(receipt.nativePromptTypes.includes('ChooseCardsPrompt'));
    assert.equal(receipt.paperQualified,false);
    console.log('AGENT50_ORIGINAL_POR88_NATIVE_ATTACHMENT '+JSON.stringify(receipt));
  });
}
