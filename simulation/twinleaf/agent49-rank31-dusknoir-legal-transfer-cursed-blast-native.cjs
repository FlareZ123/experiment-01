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
 * Original rank31 Roxie/Koffing -> BCR Sinister Hand -> Radiant Alakazam
 * Painful Spoons -> Dusknoir PRE Cursed Blast. Each native counter movement
 * is a separate one-source Ability reply. The target's initial 80 damage is
 * staged; all later effects and Prize/KO settlement are live Store actions.
 *
 * @param {0|1} [seat=0] Physical source seat.
 * @returns {object} Native staged-line evidence.
 */
function probeRank31LegalBCRAlakazamCursedBlast(seat=0){
  assert.ok(seat===0||seat===1);
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {UseAbilityAction}=
    native('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const {PokemonCardList}=
    native('game/store/state/pokemon-card-list');

  const f=stagedPainfulSpoons(seat);
  const {source,opponent,store,state}=f;
  assert.equal(state.activePlayer,seat);
  assert.equal(source.bench.length,5);
  assert.equal(source.bench.filter(slot=>slot.getPokemonCard()).length,0);

  const original60=rank31Original60();
  const source60Counts={
    roxie:original60.filter(name=>name==='Roxie CEC').length,
    koffing:original60.filter(name=>name==='Koffing CEC').length,
    radiantAlakazam:original60.filter(name=>name==='Radiant Alakazam SIT').length,
    duskullPRE:original60.filter(name=>name==='Duskull PRE').length,
    dusclopsPRE:original60.filter(name=>name==='Dusclops PRE').length,
    dusknoirPRE:original60.filter(name=>name==='Dusknoir PRE').length,
    dusknoirBCR:original60.filter(name=>name==='Dusknoir BCR').length
  };
  assert.equal(original60.length,60);
  assert.deepEqual(source60Counts,{
    roxie:4,koffing:3,radiantAlakazam:1,
    duskullPRE:3,dusclopsPRE:3,dusknoirPRE:3,dusknoirBCR:1
  });

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
  assert.equal(source.bench.length,5);
  assert.equal(source.bench.filter(slot=>slot.getPokemonCard()).length,2);
  assert.equal(bcrStack.getPokemonCard().fullName,'Dusknoir BCR');
  assert.equal(preStack.getPokemonCard().fullName,'Dusknoir PRE');

  const targetSlot=opponent.bench[1];
  const target=targetSlot.getPokemonCard();
  assert.equal(target.fullName,'Shadow Rider Calyrex V CRE');
  assert.equal(Number(target.hp),210);
  targetSlot.damage=80;
  opponent.active.damage=0;
  opponent.bench[0].damage=0;

  const sourcePrizesBefore=source.prizes.filter(x=>x.cards.length>0).length;
  const opponentPrizesBefore=opponent.prizes.filter(x=>x.cards.length>0).length;
  assert.equal(sourcePrizesBefore,6);
  assert.equal(opponentPrizesBefore,6);

  const pending=()=>state.prompts.find(p=>p.result===undefined);
  const evidence=[];
  const resolveRoxie=()=>{
    const roxie=f.card('Roxie CEC');
    const koffing=f.card('Koffing CEC');
    source.hand.cards.push(koffing,roxie);
    store.dispatch(new PlayCardAction(source.id,1,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    for(let i=0;i<20;i++){
      const prompt=pending();
      if(!prompt)break;
      const kind=prompt.constructor.name;
      let answer;
      if(kind==='ChooseCardsPrompt'){
        assert.equal(prompt.playerId,source.id);
        answer=[koffing];
        assert.equal(prompt.validate(answer,state),true,
          'The physical Koffing is a legal Roxie payment');
      }else if(kind==='ConfirmPrompt')answer=true;
      else if(kind==='WaitPrompt')answer=null;
      else throw new Error('Unexpected Roxie/Koffing prompt '+kind);
      evidence.push({phase:'Roxie/Koffing',kind,
        nativeValidated:kind==='ChooseCardsPrompt'?true:undefined});
      store.dispatch(new ResolvePromptAction(prompt.id,answer));
    }
    assert.equal(pending(),undefined,'Roxie and Blow-Away Bomb must settle');
    assert.equal(source.discard.cards.includes(koffing),true);
    assert.equal(source.discard.cards.includes(roxie),true);
    assert.equal(source.hand.cards.length,3,
      'Roxie draws three cards for the one discarded Koffing');
    assert.equal(source.deck.cards.length,4);
    assert.deepEqual([
      opponent.active.damage,
      opponent.bench[0].damage,
      targetSlot.damage
    ],[10,10,90]);
    return {roxie,koffing};
  };

  const resolveMoveAbility=(abilityName,sourceSlot,sourceIndex,from,to,
      expectedTargetDamage)=>{
    store.dispatch(new UseAbilityAction(source.id,abilityName,{
      player:PlayerType.BOTTOM_PLAYER,slot:sourceSlot,index:sourceIndex
    }));
    let movePromptSeen=false;
    for(let i=0;i<8;i++){
      const prompt=pending();
      if(!prompt)break;
      const kind=prompt.constructor.name;
      if(kind==='WaitPrompt'){
        evidence.push({phase:abilityName,kind});
        store.dispatch(new ResolvePromptAction(prompt.id,null));
      }else if(kind==='MoveDamagePrompt'){
        assert.equal(prompt.playerId,source.id);
        const answer=[{from,to}];
        assert.equal(prompt.validate(answer,state),true,
          abilityName+' must accept its single-source printed move');
        evidence.push({phase:abilityName,kind,nativeValidated:true,
          sourceDamageBefore:from.slot===SlotType.ACTIVE?
            opponent.active.damage:opponent.bench[from.index].damage,
          targetDamageBefore:targetSlot.damage});
        store.dispatch(new ResolvePromptAction(prompt.id,answer));
        movePromptSeen=true;
      }else{
        throw new Error('Unexpected '+abilityName+' prompt '+kind);
      }
    }
    assert.equal(pending(),undefined,abilityName+' must settle');
    assert.equal(movePromptSeen,true,abilityName+' must create a real MoveDamagePrompt');
    assert.equal(targetSlot.damage,expectedTargetDamage,
      abilityName+' must move one physical counter onto the target');
  };

  const execute=()=>{
    const {roxie,koffing}=resolveRoxie();
    const opponentActive={player:PlayerType.TOP_PLAYER,
      slot:SlotType.ACTIVE,index:0};
    const opponentBench0={player:PlayerType.TOP_PLAYER,
      slot:SlotType.BENCH,index:0};
    const opponentBench1={player:PlayerType.TOP_PLAYER,
      slot:SlotType.BENCH,index:1};

    resolveMoveAbility('Sinister Hand',SlotType.BENCH,0,
      opponentActive,opponentBench1,100);
    assert.equal(opponent.active.damage,0);
    resolveMoveAbility('Painful Spoons',SlotType.ACTIVE,0,
      opponentBench0,opponentBench1,110);
    assert.equal(opponent.bench[0].damage,0);

    store.dispatch(new UseAbilityAction(source.id,'Cursed Blast',{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:1
    }));
    let targetPromptSeen=false;
    let sourcePrizeCardsTaken=0;
    let opponentPrizeCardsTaken=0;
    for(let i=0;i<40;i++){
      const prompt=pending();
      if(!prompt)break;
      const kind=prompt.constructor.name;
      let answer;
      if(kind==='WaitPrompt')answer=null;
      else if(kind==='ShowCardsPrompt')answer=true;
      else if(kind==='ChoosePokemonPrompt'){
        assert.equal(prompt.playerId,source.id);
        assert.equal(prompt.validate([targetSlot],state),true);
        answer=[targetSlot];
        targetPromptSeen=true;
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
      evidence.push({phase:'Cursed Blast',kind,playerId:prompt.playerId,
        prizeCount:kind==='ChoosePrizePrompt'?
          Number(prompt.options?.count??1):undefined});
      store.dispatch(new ResolvePromptAction(prompt.id,answer));
    }

    assert.equal(pending(),undefined,'All native effects and Prize prompts settle');
    assert.equal(targetPromptSeen,true);
    assert.equal(sourcePrizeCardsTaken,2);
    assert.equal(opponentPrizeCardsTaken,1);
    assert.equal(opponent.discard.cards.includes(target),true);
    assert.equal(source.discard.cards.includes(preDuskull),true);
    assert.equal(source.discard.cards.includes(preDusclops),true);
    assert.equal(source.discard.cards.includes(preDusknoir),true);
    assert.equal(source.discard.cards.includes(koffing),true);
    assert.equal(source.discard.cards.includes(roxie),true);
    assert.equal(source.bench.length,5);
    assert.equal(source.bench.filter(slot=>slot.getPokemonCard()).length,1);
    assert.equal(source.bench[0].getPokemonCard().fullName,'Dusknoir BCR');
    assert.equal(source.bench[1].getPokemonCard(),undefined);
    assert.equal(source.discard.cards.includes(bcrDusknoir),false);

    const sourcePrizesAfter=source.prizes.filter(x=>x.cards.length>0).length;
    const opponentPrizesAfter=opponent.prizes.filter(x=>x.cards.length>0).length;
    assert.equal(sourcePrizesAfter,4);
    assert.equal(opponentPrizesAfter,5);

    return {
      version:'agent49-rank31-legal-bcr-alakazam-pre-cursed-blast-native-v1',
      seat,turn:state.turn,source60K0:true,source60Count:original60.length,
      source60Counts,sourceDeckPhysicalComplete:false,
      opponentDeckPhysicalComplete:false,
      stagedTargetDamage:80,damageAfterRoxieKoffing:90,
      damageAfterSinisterHand:100,damageAfterPainfulSpoons:110,
      printedCursedBlastCounters:13,printedCursedBlastDamage:130,
      expectedTargetDamageAfterPrintedCursedBlast:240,
      targetKnockedOut:true,sourcePrizeCountBefore:sourcePrizesBefore,
      sourcePrizeCountAfter:sourcePrizesAfter,sourcePrizeCardsTaken,
      opponentPrizeCountBefore:opponentPrizesBefore,
      opponentPrizeCountAfter:opponentPrizesAfter,opponentPrizeCardsTaken,
      netPrizeAdvantage:sourcePrizeCardsTaken-opponentPrizeCardsTaken,
      physicalKoffingDiscarded:source.discard.cards.includes(koffing),
      physicalRoxieDiscarded:source.discard.cards.includes(roxie),
      physicalPreDusknoirStackDiscarded:
        source.discard.cards.includes(preDuskull)&&
        source.discard.cards.includes(preDusclops)&&
        source.discard.cards.includes(preDusknoir),
      bcrDusknoirRemainsInPlay:
        source.bench[0].getPokemonCard().fullName==='Dusknoir BCR',
      targetPhysicallyDiscarded:opponent.discard.cards.includes(target),
      sourceBenchSlots:source.bench.length,
      sourceBenchOccupiedAfter:source.bench.filter(slot=>slot.getPokemonCard()).length,
      pendingPrompts:state.prompts.filter(p=>p.result===undefined).length,
      evidence,qualifiedGame:false,competitiveResult:false
    };
  };

  return withRoxieTrainerDiscardType(()=>withPaperRoxiePayment(()=>
    withPaperPainfulSpoonsSingleSource(execute)));
}

module.exports={probeRank31LegalBCRAlakazamCursedBlast};
