'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedPainfulSpoons}=
  require('./agent4-rank31-alakazam-movesource-native.cjs');
const {withPaperThortonSwap}=
  require('./agent12-thorton-paper-swap-hook.cjs');
const {installFlf69WildBlazePaperHook}=
  require('./flf69-wild-blaze-paper-hook.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUTPUT,name));
const VERSION='agent12-staged-two-turn-thorton-gx-apex-chain-native-v1';

/**
 * Actual Store dispatch, with a CONSTRUCTED relevant board: the first
 * Thorton target ADP and Apex donor FLF69 are initially in discard; all
 * first/eighth draws, Item searches and full original opposing decks
 * are deliberately excluded. Physical cards and normal prompts after
 * that staging still belong to the Store, including both Supporters.
 *
 * @param {0|1} seat Physical owner seat.
 * @param {boolean} corrected Whether scoped paper Thorton hook is active.
 * @returns {object} Native receipt for two own turns and opponent pass.
 */
function probe(seat,corrected=true){
  assert.ok(seat===0||seat===1);
  if(corrected)
    return withPaperThortonSwap(()=>probeCore(seat,true));
  return probeCore(seat,false);
}

/** @param {0|1} seat @param {boolean} corrected */
function probeCore(seat,corrected){
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {AttackAction,PassTurnAction}=
    native('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');

  const f=stagedPainfulSpoons(seat);
  f.state.turn=2; // First owner turn going second; original turn1 was opponent.
  f.state.activePlayer=seat;
  const regi=f.card('Regidrago V SIT');
  const adp=f.card('Arceus & Dialga & Palkia GX CEC');
  const vstar=f.card('Regidrago VSTAR SIT');
  const dde=f.card('Double Dragon Energy ROS');
  const grass=f.card('Grass Energy SVE');
  const first=f.card('Thorton LOR');
  const second=f.card('Thorton LOR');
  const donor=f.card('M Charizard EX FLF');

  f.source.active.cards.splice(0,1,regi);
  f.source.active.pokemonPlayedTurn=1;
  f.source.discard.cards.push(adp,donor);
  f.source.hand.cards.push(dde,first,second,vstar,grass);
  // More than five cards remain in owner deck before copied Wild Blaze.
  assert.ok(f.source.deck.cards.length>=7);

  const hook=installFlf69WildBlazePaperHook();
  const events=[];
  const zone=()=>({
    globalTurn:f.state.turn,
    actorId:f.state.players[f.state.activePlayer]?.id??null,
    sourceActive:f.source.active.getPokemonCard()?.fullName,
    sourceAttackEnergy:f.source.active.energies.cards.map(c=>c.fullName),
    sourceDiscard:f.source.discard.cards.map(c=>c.fullName),
    sourceBench:f.source.bench.map(x=>x.getPokemonCard()?.fullName??null),
    sourceHand:f.source.hand.cards.map(c=>c.fullName),
    sourceDeck:f.source.deck.cards.length,
    sourcePrizes:f.source.getPrizeLeft(),
    opponentPrizes:f.opponent.getPrizeLeft(),
    opponentActive:f.opponent.active.getPokemonCard()?.fullName,
    opponentActiveDamage:f.opponent.active.damage,
    usedGx:f.source.usedGX,
    supporterTurn:f.source.supporterTurn,
    energyPlayed:f.source.energyPlayed
  });
  const pending=kind=>f.state.prompts.find(p=>
    p.result===undefined&&p.constructor.name===kind);

  const settle=(label)=>{
    for(let n=0;n<20;n++){
      const p=f.state.prompts.find(x=>x.result===undefined);
      if(!p)break;
      let value=null;
      if(p.constructor.name==='ChoosePrizePrompt'){
        const owner=f.state.players.find(x=>x.id===p.playerId);
        assert.ok(owner,'Prize picker physical owner must be in this Store');
        value=owner.prizes.filter(x=>x.cards.length>0)
          .slice(0,p.options.count);
      }else if(p.constructor.name!=='WaitPrompt'&&
        p.constructor.name!=='ShowCardsPrompt'){
        throw Error('Unexpected '+label+' native prompt '+p.constructor.name);
      }
      assert.equal(p.validate(value,f.state),true,
        'Actual '+label+' prompt '+p.constructor.name+' reply must validate');
      f.store.dispatch(new ResolvePromptAction(p.id,value));
      events.push({step:label,reply:p.constructor.name});
    }
    assert.equal(f.state.prompts.some(p=>p.result===undefined),false,
      label+' left pending prompts');
  };
  const play=(label,card,target)=>{
    const index=f.source.hand.cards.indexOf(card);
    assert.ok(index>=0,label+' requires real physical hand card');
    f.store.dispatch(new PlayCardAction(f.source.id,index,target));
    events.push({step:label,root:'PlayCardAction',card:card.fullName});
  };
  const attach=(label,card)=>play(label,card,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  });
  const thorton=(label,card,physicalTarget,physicalDonor)=>{
    play(label,card,{player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
    const firstPrompt=pending('ChoosePokemonPrompt');
    assert.ok(firstPrompt,label+' must emit native Basic target prompt');
    assert.equal(firstPrompt.validate([physicalTarget],f.state),true);
    f.store.dispatch(new ResolvePromptAction(
      firstPrompt.id,[physicalTarget]));
    const secondPrompt=pending('ChooseCardsPrompt');
    assert.ok(secondPrompt,label+' must emit native discard donor prompt');
    assert.equal(secondPrompt.validate([physicalDonor],f.state),true);
    f.store.dispatch(new ResolvePromptAction(
      secondPrompt.id,[physicalDonor]));
    events.push({step:label,reply:'Basic target and discard donor',
      inPlay:physicalTarget.getPokemonCard()?.fullName});
    settle(label);
  };
  let failure=null,stageReached='construct',firstGx=null,secondAttack=null;
  const start=zone();
  try{
    stageReached='T1 DDE hand attachment';
    attach('T1 attach DDE',dde);
    settle('T1 DDE');

    stageReached='T1 Thorton RegV to ADP';
    thorton('T1 swap',first,f.source.active,adp);
    assert.equal(f.source.active.getPokemonCard(),adp);
    events.push({step:'T1 swapped board',snapshot:zone()});

    stageReached='T1 enhanced Altered Creation GX';
    f.store.dispatch(new AttackAction(f.source.id,'Altered Creation-GX'));
    settle('T1 GX');
    firstGx=zone();
    events.push({step:'T1 GX settled',snapshot:firstGx});

    stageReached='Opponent turn PassTurnAction';
    f.store.dispatch(new PassTurnAction(f.opponent.id));
    settle('opponent pass');
    events.push({step:'opponent pass settled',snapshot:zone()});

    stageReached='T2 Thorton ADP to RegV';
    thorton('T2 swap',second,f.source.active,regi);

    stageReached='T2 real VSTAR evolution from hand';
    play('T2 evolve VSTAR',vstar,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    });
    settle('T2 evolution');

    stageReached='T2 real Grass attachment from hand';
    attach('T2 attach Grass',grass);
    settle('T2 Grass');

    stageReached='T2 paid Apex Dragon copied Wild Blaze';
    f.store.dispatch(new AttackAction(f.source.id,'Apex Dragon'));
    const copy=pending('ChooseAttackPrompt');
    assert.ok(copy,'Apex Dragon must offer genuine donor attack prompt');
    const printedDonor=copy.cards.find(c=>c===donor);
    assert.ok(printedDonor,'Discarded original FLF69 donor must be present');
    const attack=donor.attacks.find(a=>a.name==='Wild Blaze');
    assert.ok(attack);
    assert.equal(copy.validate(attack,f.state),true);
    f.store.dispatch(new ResolvePromptAction(copy.id,attack));
    settle('T2 copied Wild Blaze');
    secondAttack=zone();
    events.push({step:'T2 Apex settled',snapshot:secondAttack});
  }catch(error){
    failure=String(error?.stack??error);
  }finally{
    hook.restore();
  }

  return {version:VERSION,seat,corrected,enginePin:
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    constructedPriorDiscard:true,sourceFull60Dealt:false,
    originalOpponentFull60:false,qualifiedGames:0,
    start,firstGx,secondAttack,stageReached,failure,
    after:zone(),nativeSteps:events,
    wildBlazeHook:hook.evidence()};
}
module.exports={VERSION,probe};
if(require.main===module){
  for(const seat of [0,1]){
    for(const corrected of [false,true])
      process.stdout.write(JSON.stringify(probe(seat,corrected))+'\n');
  }
}
