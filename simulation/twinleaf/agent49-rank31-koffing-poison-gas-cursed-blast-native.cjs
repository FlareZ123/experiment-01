'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedPainfulSpoons}=
  require('./agent4-rank31-alakazam-movesource-native.cjs');
const {rank31Original60}=
  require('./agent49-owner-direct-fog-one-energy-native.cjs');
const {withRoxieTrainerDiscardType}=
  require('./agent4-roxie-original-effect-type-hook.cjs');
const {withPaperRoxiePayment}=
  require('./agent4-roxie-paper-payment-hook.cjs');
const {withPaperPainfulSpoonsSingleSource}=
  require('./agent4-painful-spoons-single-source-hook.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUTPUT,name));

/**
 * Koffing Poison Gas + poison checkup -> two-Koffing Roxie -> Dusknoir BCR
 * Sinister Hand -> Radiant Alakazam Painful Spoons -> Dusknoir PRE Cursed Blast.
 *
 * No target damage is staged. Koffing's attack and poison checkup create 20;
 * Roxie/Koffing and the two separate counter-moving Abilities create the
 * remaining 60 before Cursed Blast. Energy attachments and the developed
 * board are staged; this is not a complete source-dealt game.
 *
 * @param {0|1} [seat=0] Physical source seat.
 * @returns {object} Native staged-line evidence.
 */
function probeRank31KoffingPoisonGasCursedBlast(seat=0){
  assert.ok(seat===0||seat===1);
  const {AttackAction,PassTurnAction,UseAbilityAction}=
    native('game/store/actions/game-actions');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const {PokemonCardList}=
    native('game/store/state/pokemon-card-list');

  const f=stagedPainfulSpoons(seat);
  const {source,opponent,store,state}=f;
  assert.equal(state.activePlayer,seat);
  assert.equal(source.bench.length,5);

  const original60=rank31Original60();
  const source60Counts={
    koffing:original60.filter(name=>name==='Koffing CEC').length,
    roxie:original60.filter(name=>name==='Roxie CEC').length,
    radiantAlakazam:original60.filter(name=>name==='Radiant Alakazam SIT').length,
    duskullPRE:original60.filter(name=>name==='Duskull PRE').length,
    dusclopsPRE:original60.filter(name=>name==='Dusclops PRE').length,
    dusknoirPRE:original60.filter(name=>name==='Dusknoir PRE').length,
    dusknoirBCR:original60.filter(name=>name==='Dusknoir BCR').length,
    basicPsychic:original60.filter(name=>name==='Psychic Energy MEE 13').length
  };
  assert.equal(original60.length,60);
  assert.deepEqual(source60Counts,{
    koffing:3,roxie:4,radiantAlakazam:1,
    duskullPRE:3,dusclopsPRE:3,dusknoirPRE:3,
    dusknoirBCR:1,basicPsychic:2
  });

  const alakazam=source.active.getPokemonCard();
  assert.equal(alakazam.fullName,'Radiant Alakazam SIT');
  source.active.cards.splice(0,source.active.cards.length);
  source.active.energies.cards.splice(0,source.active.energies.cards.length);
  source.bench[2].cards.push(alakazam);

  const attackingKoffing=f.card('Koffing CEC');
  const psychic1=f.card('Psychic Energy MEE');
  const psychic2=f.card('Psychic Energy MEE');
  source.active.cards.push(attackingKoffing,psychic1,psychic2);
  source.active.energies.cards.push(psychic1,psychic2);
  assert.equal(source.active.getPokemonCard().fullName,'Koffing CEC');
  assert.equal(source.active.energies.cards.length,2);

  const bcrDuskull=f.card('Duskull PRE');
  const bcrDusclops=f.card('Dusclops PRE');
  const bcrDusknoir=f.card('Dusknoir BCR');
  const preDuskull=f.card('Duskull PRE');
  const preDusclops=f.card('Dusclops PRE');
  const preDusknoir=f.card('Dusknoir PRE');
  const bcrStack=source.bench[0];
  const preStack=source.bench[1];
  assert.ok(bcrStack instanceof PokemonCardList);
  assert.ok(preStack instanceof PokemonCardList);
  bcrStack.cards.push(bcrDuskull,bcrDusclops,bcrDusknoir);
  preStack.cards.push(preDuskull,preDusclops,preDusknoir);
  assert.equal(bcrStack.getPokemonCard().fullName,'Dusknoir BCR');
  assert.equal(preStack.getPokemonCard().fullName,'Dusknoir PRE');
  assert.equal(source.bench[2].getPokemonCard().fullName,'Radiant Alakazam SIT');

  const targetSlot=opponent.active;
  const target=targetSlot.getPokemonCard();
  assert.equal(target.fullName,'Shadow Rider Calyrex V CRE');
  assert.equal(Number(target.hp),210);
  targetSlot.damage=0;
  opponent.bench[0].damage=0;
  opponent.bench[1].damage=0;

  const sourcePrizesBefore=source.prizes.filter(x=>x.cards.length>0).length;
  const opponentPrizesBefore=opponent.prizes.filter(x=>x.cards.length>0).length;
  assert.equal(sourcePrizesBefore,6);
  assert.equal(opponentPrizesBefore,6);

  const pending=()=>state.prompts.find(p=>p.result===undefined);
  const evidence=[];
  const dispatchAt=(stage,action)=>{
    try{return store.dispatch(action);}
    catch(error){throw new Error(stage+': '+(error?.message??String(error)));}
  };
  const resolveWaits=(phase)=>{
    for(let i=0;i<20;i++){
      const prompt=pending();
      if(!prompt)break;
      assert.equal(prompt.constructor.name,'WaitPrompt',
        'Unexpected '+phase+' prompt '+prompt.constructor.name);
      evidence.push({phase,kind:'WaitPrompt'});
      dispatchAt(phase+' prompt '+prompt.constructor.name,
        new ResolvePromptAction(prompt.id,null));
    }
    assert.equal(pending(),undefined,phase+' prompts must settle');
  };

  const execute=()=>{
    dispatchAt('AttackAction Poison Gas',new AttackAction(source.id,'Poison Gas'));
    resolveWaits('Koffing Poison Gas attack');
    assert.equal(state.activePlayer,seat===0?1:0);
    assert.equal(opponent.active.damage,20,
      'Poison Gas deals 10 and the first between-turns checkup adds 10 poison damage');
    evidence.push({phase:'Poison Gas + first checkup',targetDamage:opponent.active.damage});

    dispatchAt('PassTurnAction opponent',new PassTurnAction(opponent.id));
    resolveWaits('opponent turn / poison checkup');
    assert.equal(state.activePlayer,seat);
    assert.equal(opponent.active.damage,30,
      'The second between-turns checkup adds another 10 poison damage after the opponent passes');
    evidence.push({phase:'second poison checkup',targetDamage:opponent.active.damage});

    const koffing1=f.card('Koffing CEC');
    const koffing2=f.card('Koffing CEC');
    const roxie=f.card('Roxie CEC');
    source.hand.cards.push(koffing1,koffing2,roxie);
    dispatchAt('PlayCardAction Roxie',new PlayCardAction(source.id,2,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    for(let i=0;i<25;i++){
      const prompt=pending();
      if(!prompt)break;
      const kind=prompt.constructor.name;
      let answer;
      if(kind==='ChooseCardsPrompt'){
        assert.equal(prompt.playerId,source.id);
        answer=[koffing1,koffing2];
        assert.equal(prompt.validate(answer,state),true,
          'Both physical non-GX Koffing are legal Roxie payments');
      }else if(kind==='ConfirmPrompt')answer=true;
      else if(kind==='WaitPrompt')answer=null;
      else throw new Error('Unexpected Roxie/Koffing prompt '+kind);
      evidence.push({phase:'Roxie/Koffing',kind,
        nativeValidated:kind==='ChooseCardsPrompt'?true:undefined});
      dispatchAt('Roxie prompt '+kind,new ResolvePromptAction(prompt.id,answer));
    }
    assert.equal(pending(),undefined,'Roxie and both Blow-Away Bomb effects settle');
    assert.equal(source.discard.cards.includes(koffing1),true);
    assert.equal(source.discard.cards.includes(koffing2),true);
    assert.equal(source.discard.cards.includes(roxie),true);
    assert.equal(source.hand.cards.length,6);
    assert.equal(source.deck.cards.length,1);
    assert.deepEqual([
      opponent.active.damage,
      opponent.bench[0].damage,
      opponent.bench[1].damage
    ],[50,20,20]);
    evidence.push({phase:'two Blow-Away Bombs',damage:[50,20,20]});

    const opponentActive={player:PlayerType.TOP_PLAYER,
      slot:SlotType.ACTIVE,index:0};
    const opponentBench0={player:PlayerType.TOP_PLAYER,
      slot:SlotType.BENCH,index:0};
    const opponentBench1={player:PlayerType.TOP_PLAYER,
      slot:SlotType.BENCH,index:1};

    const resolveMoveAbility=(abilityName,sourceIndex,from,to,
        expectedTargetDamage,moveCount)=>{
      dispatchAt(abilityName+' UseAbilityAction',new UseAbilityAction(source.id,abilityName,{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:sourceIndex
      }));
      let movePromptSeen=false;
      for(let i=0;i<10;i++){
        const prompt=pending();
        if(!prompt)break;
        const kind=prompt.constructor.name;
        if(kind==='WaitPrompt'){
          evidence.push({phase:abilityName,kind});
          dispatchAt(abilityName+' WaitPrompt',
            new ResolvePromptAction(prompt.id,null));
        }else if(kind==='MoveDamagePrompt'){
          assert.equal(prompt.playerId,source.id);
          const answer=Array.from({length:moveCount},()=>({from,to}));
          assert.equal(prompt.validate(answer,state),true,
            abilityName+' must accept the legal one-source move');
          evidence.push({phase:abilityName,kind,moveCount,
            sourceDamageBefore:from.slot===SlotType.ACTIVE?
              opponent.active.damage:opponent.bench[from.index].damage,
            targetDamageBefore:targetSlot.damage,nativeValidated:true});
          dispatchAt(abilityName+' MoveDamagePrompt',
            new ResolvePromptAction(prompt.id,answer));
          movePromptSeen=true;
        }else{
          throw new Error('Unexpected '+abilityName+' prompt '+kind);
        }
      }
      assert.equal(pending(),undefined,abilityName+' must settle');
      assert.equal(movePromptSeen,true,abilityName+' must create MoveDamagePrompt');
      assert.equal(targetSlot.damage,expectedTargetDamage);
    };

    // Sinister Hand moves one counter per activation; use it twice.
    resolveMoveAbility('Sinister Hand',0,opponentBench0,opponentActive,60,1);
    assert.equal(opponent.bench[0].damage,10);
    resolveMoveAbility('Sinister Hand',0,opponentBench0,opponentActive,70,1);
    assert.equal(opponent.bench[0].damage,0);
    resolveMoveAbility('Painful Spoons',2,opponentBench1,opponentActive,90,2);
    assert.equal(opponent.bench[1].damage,0);

    dispatchAt('Cursed Blast UseAbilityAction',new UseAbilityAction(source.id,'Cursed Blast',{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:1
    }));
    let targetPromptSeen=false;
    let promotionPromptSeen=false;
    let sourcePrizeCardsTaken=0;
    let opponentPrizeCardsTaken=0;
    for(let i=0;i<50;i++){
      const prompt=pending();
      if(!prompt)break;
      const kind=prompt.constructor.name;
      let answer;
      if(kind==='WaitPrompt')answer=null;
      else if(kind==='ShowCardsPrompt')answer=true;
      else if(kind==='ChoosePokemonPrompt'){
        if(prompt.playerId===source.id){
          assert.equal(prompt.validate([targetSlot],state),true);
          answer=[targetSlot];
          targetPromptSeen=true;
        }else if(prompt.playerId===opponent.id){
          const promotion=opponent.bench.find(slot=>slot.getPokemonCard());
          assert.ok(promotion,'Opponent must have a Pokémon to promote');
          assert.equal(prompt.validate([promotion],state),true);
          answer=[promotion];
          promotionPromptSeen=true;
        }else{
          assert.fail('ChoosePokemonPrompt belongs to an unknown player');
        }
      }else if(kind==='ChoosePrizePrompt'){
        const chooser=state.players.find(player=>player.id===prompt.playerId);
        assert.ok(chooser);
        const count=Number(prompt.options?.count??1);
        const selection=chooser.prizes.filter(prize=>prize.cards.length>0)
          .slice(0,count);
        assert.equal(selection.length,count);
        assert.equal(prompt.validate(selection,state),true);
        answer=selection;
        if(chooser.id===source.id)sourcePrizeCardsTaken+=count;
        else if(chooser.id===opponent.id)opponentPrizeCardsTaken+=count;
        else assert.fail('Prize prompt belongs to an unknown player');
      }else if(kind==='ShuffleDeckPrompt'){
        const chooser=state.players.find(player=>player.id===prompt.playerId);
        assert.ok(chooser);
        answer=chooser.deck.cards.map((_,index)=>index);
      }else{
        throw new Error('Unexpected Cursed Blast prompt '+kind);
      }
      evidence.push({phase:'Cursed Blast / KO settlement',kind,
        playerId:prompt.playerId,
        prizeCount:kind==='ChoosePrizePrompt'?
          Number(prompt.options?.count??1):undefined});
      dispatchAt('Cursed Blast prompt '+kind,
        new ResolvePromptAction(prompt.id,answer));
    }

    assert.equal(pending(),undefined,'All native effects and KO prompts settle');
    assert.equal(targetPromptSeen,true);
    assert.equal(promotionPromptSeen,true);
    assert.equal(sourcePrizeCardsTaken,2);
    assert.equal(opponentPrizeCardsTaken,1);
    assert.equal(opponent.discard.cards.includes(target),true);
    assert.equal(source.discard.cards.includes(preDuskull),true);
    assert.equal(source.discard.cards.includes(preDusclops),true);
    assert.equal(source.discard.cards.includes(preDusknoir),true);
    assert.equal(source.discard.cards.includes(koffing1),true);
    assert.equal(source.discard.cards.includes(koffing2),true);
    assert.equal(source.discard.cards.includes(roxie),true);
    assert.equal(source.active.getPokemonCard(),attackingKoffing);
    assert.equal(source.active.energies.cards.length,2);
    assert.equal(source.bench.length,5);
    assert.equal(source.bench[0].getPokemonCard().fullName,'Dusknoir BCR');
    assert.equal(source.bench[1].getPokemonCard(),undefined);
    assert.equal(source.bench[2].getPokemonCard().fullName,'Radiant Alakazam SIT');
    assert.equal(source.bench.filter(slot=>slot.getPokemonCard()).length,2);
    assert.equal(opponent.active.getPokemonCard().fullName,'Shadow Rider Calyrex V CRE');

    const sourcePrizesAfter=source.prizes.filter(x=>x.cards.length>0).length;
    const opponentPrizesAfter=opponent.prizes.filter(x=>x.cards.length>0).length;
    assert.equal(sourcePrizesAfter,4);
    assert.equal(opponentPrizesAfter,5);

    return {
      version:'agent49-rank31-koffing-poison-gas-cursed-blast-native-v1',
      seat,turn:state.turn,source60K0:true,source60Count:original60.length,
      source60Counts,sourceDeckPhysicalComplete:false,
      opponentDeckPhysicalComplete:false,
      initialTargetDamage:0,damageAfterAttackAndFirstCheckup:20,
      damageAfterSecondPoisonCheckup:30,damageAfterTwoKoffingRoxie:50,
      damageAfterSinisterHand:70,damageAfterPainfulSpoons:90,
      printedCursedBlastCounters:13,printedCursedBlastDamage:130,
      expectedTargetDamageAfterCursedBlast:220,targetKnockedOut:true,
      sourcePrizeCountBefore:sourcePrizesBefore,sourcePrizeCountAfter:sourcePrizesAfter,
      sourcePrizeCardsTaken,opponentPrizeCountBefore:opponentPrizesBefore,
      opponentPrizeCountAfter:opponentPrizesAfter,opponentPrizeCardsTaken,
      netPrizeAdvantage:sourcePrizeCardsTaken-opponentPrizeCardsTaken,
      physicalActiveKoffingRemains:source.active.getPokemonCard()===attackingKoffing,
      physicalTwoKoffingsAndRoxieDiscarded:
        source.discard.cards.includes(koffing1)&&
        source.discard.cards.includes(koffing2)&&
        source.discard.cards.includes(roxie),
      physicalPreDusknoirStackDiscarded:
        source.discard.cards.includes(preDuskull)&&
        source.discard.cards.includes(preDusclops)&&
        source.discard.cards.includes(preDusknoir),
      bcrDusknoirRemainsInPlay:
        source.bench[0].getPokemonCard().fullName==='Dusknoir BCR',
      radiantAlakazamRemainsInPlay:
        source.bench[2].getPokemonCard().fullName==='Radiant Alakazam SIT',
      targetPhysicallyDiscarded:opponent.discard.cards.includes(target),
      opponentPromotionResolved:promotionPromptSeen,
      sourceBenchSlots:source.bench.length,
      sourceBenchOccupiedAfter:source.bench.filter(slot=>slot.getPokemonCard()).length,
      pendingPrompts:state.prompts.filter(p=>p.result===undefined).length,
      evidence,qualifiedGame:false,competitiveResult:false
    };
  };

  return withRoxieTrainerDiscardType(()=>withPaperRoxiePayment(()=>
    withPaperPainfulSpoonsSingleSource(execute)));
}

module.exports={probeRank31KoffingPoisonGasCursedBlast};
