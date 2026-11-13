'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stageCopycat}=require('./agent46-mimikyu-apex-copycat-native.cjs');
const {initializeCards}=require('./headless.cjs');
const {installMimikyuNonGxCopycatHook}=require('./copycat-compat.cjs');
const {installDeclaredCopyHistoryHook}=require('./copycat-declared-history-hook.cjs');

const PIN=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=part=>require(path.join(PIN,part));

function resolvePending(x,{opponentDialga,ownerDialga},limit=40){
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const resolved=[];
  for(let i=0;i<limit;i++){
    const p=x.state.prompts.find(q=>q.result===undefined);
    if(!p)return resolved;
    const family=p.constructor.name;
    if(family==='ChooseAttackPrompt'){
      const source=p.cards.includes(opponentDialga)?opponentDialga:ownerDialga;
      const name=source===opponentDialga?'Overclock':'Timeless-GX';
      assert.ok(p.cards.includes(source),'Expected physical Dragon discard donor in native prompt');
      const attack=source.attacks.find(a=>a.name===name);
      assert.ok(attack,'Expected printed '+name+' attack');
      assert.equal(p.validate(attack),true,'Native prompt must receive the exact Attack object');
      x.store.dispatch(new ResolvePromptAction(p.id,attack));
      resolved.push({family,playerId:p.playerId,choice:name});
    }else if(family==='ChoosePrizePrompt'){
      if(p.playerId!==undefined)assert.equal(p.playerId,x.owner.id,'Only the Mimikyu owner should take prizes');
      const count=p.options.count;
      const chosen=x.owner.prizes.filter(prize=>prize.cards.length>0).slice(0,count);
      assert.equal(chosen.length,count);
      x.store.dispatch(new ResolvePromptAction(p.id,chosen));
      resolved.push({family,count});
    }else if(family==='ChoosePokemonPrompt'){
      if(p.playerId!==undefined)assert.equal(p.playerId,x.opponent.id,'Only the opponent should promote after a Knock Out');
      const slot=x.opponent.bench.find(candidate=>candidate.cards.length>0);
      assert.ok(slot,'Opponent must have a replacement Basic available');
      x.store.dispatch(new ResolvePromptAction(p.id,[slot]));
      resolved.push({family,promoted:slot.getPokemonCard()?.fullName??null});
    }else if(family==='WaitPrompt'){
      x.store.dispatch(new ResolvePromptAction(p.id,null));
      resolved.push({family});
    }else if(family==='ShowCardsPrompt'){
      x.store.dispatch(new ResolvePromptAction(p.id,true));
      resolved.push({family});
    }else{
      assert.fail('Unexpected native prompt in post-Copycat Max Geist chain: '+family);
    }
  }
  assert.fail('Native prompt chain exceeded '+limit+' resolutions');
}

/**
 * Full staged native Store sequence in both physical seats:
 * Regidrago Apex Dragon -> Mimikyu Copycat -> Dialga Timeless-GX ->
 * actual extra turn -> Latias ex / Skyliner free Retreat -> Shadow Rider
 * Calyrex VMAX Max Geist. Fairy Zone doubles both Psychic attacks against
 * Dragon targets. The two Psychic Energy left on Mimikyu must still count
 * toward Max Geist after the free Retreat.
 */
function runSeat(seat){
  const clearCopyAttackSessionsForTests=native('game/store/prefabs/copy-attack-delegation')
    .clearCopyAttackSessionsForTests;
  clearCopyAttackSessionsForTests();
  const restoreCopy=installMimikyuNonGxCopycatHook();
  const restoreHistory=installDeclaredCopyHistoryHook({mimikyu:true,regidrago:true});
  try{
    const staged=stageCopycat(seat,'apex'),x=staged.x,manager=initializeCards();
    let id=940001;
    const make=fullName=>{
      const card=manager.getCardByName(fullName);
      assert.ok(card,'Missing pinned card '+fullName);
      card.id=id++;
      return card;
    };
    const {AttackAction,RetreatAction}=native('game/store/actions/game-actions');

    const shadowRider=make('Shadow Rider Calyrex VMAX CRE');
    const latias=make('Latias ex SSP');
    const clefairy=make("Lillie's Clefairy ex JTG");
    const dratiniOne=make('Dratini OBF');
    const dratiniTwo=make('Dratini OBF');
    assert.notStrictEqual(dratiniOne,dratiniTwo,'Each physical Dratini must be a distinct card instance');
    const vmaxEnergy=[make('Psychic Energy SVE'),make('Psychic Energy SVE'),
      make('Psychic Energy SVE')];
    const sourceEnergy=[make('Double Dragon Energy ROS'),make('Double Dragon Energy ROS')];
    const opponentDialga=make('Dialga-GX UPR');
    const ownerDialga=staged.target;
    assert.ok(ownerDialga,'Owner Dialga-GX UPR must begin in the own discard');
    assert.equal(shadowRider.attacks.some(a=>a.name==='Max Geist'),true);
    assert.equal(latias.powers.some(p=>p.name==='Skyliner'),true);
    assert.equal(clefairy.powers.some(p=>p.name==='Fairy Zone'),true);
    assert.equal(dratiniOne.cardType.includes(native('game/store/card/card-types').CardType.DRAGON),true);

    // stageCopycat preallocates five Bench slots; slot 1 intentionally retains
    // the rank-1 fixture's Regidrago V. Use the other empty slots.
    const vmaxSlot=x.owner.bench[0];
    const latiasSlot=x.owner.bench[2];
    const clefairySlot=x.owner.bench[3];
    const firstDratiniSlot=x.opponent.bench[0];
    const secondDratiniSlot=x.opponent.bench[1];
    assert.ok(vmaxSlot&&latiasSlot&&clefairySlot&&firstDratiniSlot&&secondDratiniSlot);
    assert.equal(vmaxSlot.cards.length,0);
    assert.equal(latiasSlot.cards.length,0);
    assert.equal(clefairySlot.cards.length,0);
    assert.equal(firstDratiniSlot.cards.length,0);
    assert.equal(secondDratiniSlot.cards.length,0);
    vmaxSlot.cards.push(shadowRider,...vmaxEnergy);
    vmaxSlot.energies.cards.push(...vmaxEnergy);
    latiasSlot.cards.push(latias);
    clefairySlot.cards.push(clefairy);
    firstDratiniSlot.cards.push(dratiniOne);
    secondDratiniSlot.cards.push(dratiniTwo);

    x.opponent.active.cards.push(...sourceEnergy);
    x.opponent.active.energies.cards.push(...sourceEnergy);
    x.opponent.discard.cards.push(opponentDialga);
    x.state.playerLastAttack={};
    x.state.lastAttack=undefined;
    x.state.activePlayer=1-seat;
    x.state.turn=2;
    x.state.phase=x.GamePhase.PLAYER_TURN;

    // The opponent's original Apex Dragon is a real Store AttackAction, not
    // injected previous-attack metadata. Overclock is selected by its exact
    // physical Dialga-GX UPR object from the opponent's discard.
    x.store.dispatch(new AttackAction(x.opponent.id,'Apex Dragon'));
    const apexPrompts=resolvePending(x,{opponentDialga,ownerDialga});
    assert.equal(x.state.activePlayer,seat,'Mimikyu owner must receive the next normal turn');
    assert.equal(x.state.playerLastAttack[x.opponent.id]?.attack?.name,'Apex Dragon',
      'Declared Apex Dragon history must survive the copied Overclock payload');

    // Mimikyu's printed Copycat uses the preceding non-GX Apex Dragon. The
    // nested Apex Dragon chooses Timeless-GX from the owner's own Dialga.
    x.store.dispatch(new AttackAction(x.owner.id,'Copycat'));
    let timelessDamageBeforeKo=null;
    let timelessTurnSkipArmed=false;
    const copycatResolved=[];
    for(let i=0;i<40;i++){
      const p=x.state.prompts.find(q=>q.result===undefined);
      if(!p)break;
      if(p.constructor.name==='ChooseAttackPrompt'){
        const chosenCard=p.cards.includes(ownerDialga)?ownerDialga:opponentDialga;
        const attackName=chosenCard===ownerDialga?'Timeless-GX':'Overclock';
        assert.equal(chosenCard,ownerDialga,"Nested Apex must use the owner's discarded Dialga");
        const attack=chosenCard.attacks.find(a=>a.name===attackName);
        assert.ok(attack);
        assert.equal(p.validate(attack),true);
        x.store.dispatch(new (native('game/store/actions/resolve-prompt-action').ResolvePromptAction)(p.id,attack));
        timelessDamageBeforeKo=x.opponent.active.damage;
        timelessTurnSkipArmed=x.owner.usedTurnSkip===true;
        copycatResolved.push({family:p.constructor.name,choice:attackName,
          defenderDamageAfterResolution:timelessDamageBeforeKo});
      }else{
        const more=resolvePending(x,{opponentDialga,ownerDialga},1);
        copycatResolved.push(...more);
      }
    }
    assert.equal(timelessDamageBeforeKo,300,
      '150 Timeless-GX must become 300 against Dragon weakness under Fairy Zone');
    assert.equal(timelessTurnSkipArmed,true,'Copied Timeless-GX must arm the extra turn');
    assert.equal(x.owner.usedGX,true,'Copied Timeless-GX must consume the owner GX allowance');
    assert.equal(x.opponent.discard.cards.some(c=>c.id===staged.opposing.id),true,
      'The 280-HP Regidrago VSTAR must be Knocked Out');
    assert.equal(x.opponent.active.getPokemonCard(),dratiniOne,
      'First Dratini must be promoted after the two-Prize Regidrago KO');
    assert.equal(x.owner.prizes.filter(p=>p.cards.length>0).length,4,
      'Regidrago VSTAR awards two Prizes');
    assert.equal(x.state.activePlayer,seat,
      'The Timeless-GX extra turn must return to the Mimikyu owner');
    assert.equal(x.state.phase,x.GamePhase.PLAYER_TURN);
    assert.equal(x.store.hasPrompts(),false);
    const extraTurnNumber=x.state.turn;

    // Latias ex is on the Bench, so Mimikyu's printed Basic retreat is free.
    // Retreat must preserve both Psychic Energy on Mimikyu; Max Geist counts
    // Psychic Energy on all of the owner's Pokémon, including that Bench slot.
    const mimikyu=x.owner.active.getPokemonCard();
    assert.equal(mimikyu.fullName,'Mimikyu GRI');
    const mimikyuEnergyBefore=x.owner.active.energies.cards.slice();
    assert.equal(mimikyuEnergyBefore.length,2);
    const vmaxBenchIndex=x.owner.bench.findIndex(slot=>slot.getPokemonCard()===shadowRider);
    assert.ok(vmaxBenchIndex>=0);
    x.store.dispatch(new RetreatAction(x.owner.id,vmaxBenchIndex));
    const retreatPrompts=resolvePending(x,{opponentDialga,ownerDialga});
    assert.equal(x.store.hasPrompts(),false);
    assert.equal(x.owner.active.getPokemonCard(),shadowRider,
      'Latias ex Skyliner must allow a zero-cost Mimikyu retreat into Shadow Rider VMAX');
    const mimikyuBench=x.owner.bench.find(slot=>slot.getPokemonCard()===mimikyu);
    assert.ok(mimikyuBench);
    assert.equal(mimikyuBench.energies.cards.length,2);
    assert.strictEqual(mimikyuBench.energies.cards[0],mimikyuEnergyBefore[0]);
    assert.strictEqual(mimikyuBench.energies.cards[1],mimikyuEnergyBefore[1]);
    assert.equal(x.owner.active.energies.cards.length,3);

    x.store.dispatch(new AttackAction(x.owner.id,'Max Geist'));
    const maxGeistDamageBeforeKo=x.opponent.active.damage;
    assert.equal(maxGeistDamageBeforeKo,320,
      'Five Psychic Energy (three on VMAX, two retained on Mimikyu) yield 160, doubled by Fairy Zone');
    const maxGeistPrompts=resolvePending(x,{opponentDialga,ownerDialga});
    assert.equal(x.opponent.discard.cards.some(c=>c.id===dratiniOne.id),true,
      'Max Geist must Knock Out the promoted Dragon Dratini');
    assert.equal(x.opponent.active.getPokemonCard(),dratiniTwo,
      'Second Dratini must be promoted after the Max Geist Knock Out');
    assert.equal(x.owner.prizes.filter(p=>p.cards.length>0).length,3,
      'The Max Geist follow-up takes one additional Prize');
    assert.equal(x.owner.usedGX,true);

    return {
      seat,
      actualSourceApex:true,
      actualMimikyuCopycat:true,
      actualNestedTimelessGX:true,
      timelessDamageBeforeKo,
      regidragoKnockedOut:true,
      firstPrizeCount:2,
      extraTurnOwnerSeat:seat,
      extraTurnNumber,
      timelessTurnSkipArmed,
      latiasSkylinerRetreatAccepted:true,
      mimikyuEnergyRetained:mimikyuBench.energies.cards.length,
      totalPsychicEnergyForMaxGeist:5,
      maxGeistDamageBeforeKo,
      dratiniKnockedOut:true,
      secondPrizeCount:1,
      totalPrizesTaken:3,
      finalPendingPrompts:x.state.prompts.filter(p=>p.result===undefined)
        .map(p=>p.constructor.name),
      apexPrompts,copycatResolved,retreatPrompts,maxGeistPrompts,
      competitiveGamesQualified:0,
      scope:'Staged two-seat native Store sequence; not a natural game or matchup result'
    };
  }finally{
    restoreHistory();
    restoreCopy();
    clearCopyAttackSessionsForTests();
  }
}

function run(){
  const rows=[runSeat(0),runSeat(1)];
  for(const row of rows){
    assert.equal(row.finalPendingPrompts.length,0);
    assert.equal(row.timelessDamageBeforeKo,300);
    assert.equal(row.maxGeistDamageBeforeKo,320);
    assert.equal(row.mimikyuEnergyRetained,2);
    assert.equal(row.totalPrizesTaken,3);
  }
  const out={schema:'agent1-mimikyu-timeless-skyliner-max-geist-native-v1',
    twinleafPin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    bothPhysicalSeats:true,rows,qualifiedCompetitiveGames:0};
  process.stdout.write(JSON.stringify(out,null,2)+'\n');
  return out;
}
if(require.main===module)run();
module.exports={runSeat,run};
