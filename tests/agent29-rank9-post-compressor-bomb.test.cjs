'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseOwnerBombAfterCompressor,withOwnerBombAfterSourceCompressor}=
  require('../simulation/twinleaf/agent29-rank9-post-compressor-bomb.cjs');

class PassTurnAction{}
class AddPlayerAction{}
class ResolvePromptAction{constructor(id,result){this.id=id;this.result=result;}}
class UseAbilityAction{
  constructor(playerId,name,target){Object.assign(this,{playerId,name,target});}
}
class SimpleTacticsAi{
  constructor(client){this.client=client;}
  decodeNextAction(){return new PassTurnAction();}
}
class ShuffleDeckPrompt{
  constructor(id,playerId,sourceCard){
    Object.assign(this,{id,playerId,sourceCard,result:undefined});
  }
}
class AttachEnergyPrompt{
  constructor(player,cardList){
    Object.assign(this,{id:124,playerId:player.id,
      cardList,message:'ATTACH_ENERGY_CARDS',result:undefined});
  }
  validate(result){return result.length===3&&
    result.every(x=>this.cardList.cards.includes(x.card)&&
      x.to.player===0&&x.to.slot===2);}
}
class Store{
  constructor(state){this.state=state;}
  dispatch(action){
    if(action instanceof UseAbilityAction){
      const owner=this.state.players[this.state.activePlayer];
      owner.active.getPokemonCard();
      this.state.prompts.push(new AttachEnergyPrompt(owner,owner.discard));
    }else if(action instanceof ResolvePromptAction){
      const prompt=this.state.prompts.find(p=>p.id===action.id);
      if(prompt)prompt.result=action.result;
      if(prompt instanceof AttachEnergyPrompt){
        const owner=this.state.players[this.state.activePlayer];
        const mega=owner.bench[0];
        for(const entry of action.result){
          assert.ok(entry.to.index===0);
          const index=owner.discard.cards.indexOf(entry.card);
          assert.ok(index>=0);
          owner.discard.cards.splice(index,1);
          mega.energies.cards.push(entry.card);
        }
        const electrode=owner.active.card;
        owner.active.card=null;
        owner.discard.cards.push(electrode);
        this.state.players[1-this.state.activePlayer].prizesLeft-=2;
      }
      this.state.prompts=this.state.prompts.filter(p=>p.result===undefined);
    }
    return this.state;
  }
}

/** @param {0|1} seat */
function fixture(seat){
  const electrode={fullName:'Electrode-GX CES'};
  const mega={fullName:'Mega Absol ex M1L'};
  const source={id:102,active:{card:electrode,energies:{cards:[]},
    getPokemonCard(){return this.card;}},
    bench:[{getPokemonCard:()=>mega,energies:{cards:[]}}],
    discard:{cards:[
      {fullName:'Prism Energy ASC',id:1},
      {fullName:'Darkness Energy MEE',id:2},
      {fullName:'Telepath [P] Energy M3',id:3}
    ]}};
  const opponent={id:101,prizesLeft:6,getPrizeLeft(){return this.prizesLeft;}};
  const state={turn:16,phase:'PLAYER_TURN',activePlayer:seat,
    players:seat===0?[source,opponent]:[opponent,source],prompts:[
      new ShuffleDeckPrompt(123,source.id,{fullName:'Battle Compressor PHF'})
    ]};
  return {source,opponent,electrode,mega,state,store:new Store(state)};
}

test('eligibility is exact original Active Electrode plus Mega plus post-Compressor own discard',()=>{
  for(const seat of [0,1]){
    const f=fixture(seat);
    assert.equal(chooseOwnerBombAfterCompressor(f.state,seat,{turn:16}),null);
    f.state.prompts=[];
    const eligible=chooseOwnerBombAfterCompressor(f.state,seat,{turn:16});
    assert.equal(eligible?.electrode,f.electrode);
    assert.equal(eligible?.recipientBenchIndex,0);
    assert.equal(chooseOwnerBombAfterCompressor(f.state,seat,{turn:14}),null);
    f.source.discard.cards.length=0;
    assert.equal(chooseOwnerBombAfterCompressor(f.state,seat,{turn:16}),null);
  }
});

test('both physical seats: authoritative Compressor shuffle, paid Bomb, 3 real Energy and 2 Prizes',()=>{
  for(const seat of [0,1]){
    const f=fixture(seat);
    const original=Store.prototype.dispatch;
    const result=withOwnerBombAfterSourceCompressor(()=>{
      f.store.dispatch(new AddPlayerAction());
      f.store.dispatch(new ResolvePromptAction(123,[0,1,2]));
      const bot=new SimpleTacticsAi({id:f.source.id});
      const bomb=bot.decodeNextAction(f.state);
      assert.equal(bomb.constructor.name,'UseAbilityAction');
      assert.equal(bomb.name,'Extra Energy Bomb');
      assert.equal(bomb.target.slot,1);
      f.store.dispatch(bomb);
      const pay=bot.decodeNextAction(f.state);
      assert.equal(pay.constructor.name,'ResolvePromptAction');
      assert.equal(pay.result.length,3);
      f.store.dispatch(pay);
      assert.equal(f.source.bench[0].energies.cards.length,3);
      assert.equal(f.opponent.getPrizeLeft(),4);
    },seat,{SimpleTacticsAi,Store,GamePhase:{PLAYER_TURN:'PLAYER_TURN'},
      abilityActions:{UseAbilityAction},
      promptActions:{ResolvePromptAction},
      cardActions:{PlayerType:{BOTTOM_PLAYER:0},SlotType:{ACTIVE:1,BENCH:2}}});
    assert.equal(Store.prototype.dispatch,original);
    assert.equal(result.audit.sourceStampedCompressorShuffles,1);
    assert.equal(result.audit.nativeAcceptedBombs,1);
    assert.equal(result.audit.physicallyAttachedEnergyCards,3);
    assert.equal(result.audit.physicalElectrodeSelfKosWithTwoPrizes,1);
  }
});

test('native prototype restoration after thrown error',()=>{
  const f=fixture(1);
  const original=Store.prototype.dispatch;
  assert.throws(()=>withOwnerBombAfterSourceCompressor(()=>{
    f.store.dispatch(new AddPlayerAction());
    throw Error('native abort');
  },1,{SimpleTacticsAi,Store,GamePhase:{PLAYER_TURN:'PLAYER_TURN'},
    abilityActions:{UseAbilityAction},
    promptActions:{ResolvePromptAction},
    cardActions:{PlayerType:{BOTTOM_PLAYER:0},SlotType:{ACTIVE:1,BENCH:2}}}),/native abort/);
  assert.equal(Store.prototype.dispatch,original);
});

test('v10 later-turn Benched Electrode is eligible with three physical source Energy',()=>{
  for(const seat of [0,1]){
    const f=fixture(seat);
    f.source.active.card={fullName:'Regidrago V SIT'};
    f.source.bench.push({getPokemonCard:()=>f.electrode,energies:{cards:[]}});
    f.state.prompts=[];
    f.state.turn=18;
    const original=chooseOwnerBombAfterCompressor(f.state,seat,{turn:16});
    assert.equal(original,null,'Frozen v4 must not change');
    const eligible=chooseOwnerBombAfterCompressor(f.state,seat,{turn:16},
      {allowLaterBenchedElectrode:true});
    assert.equal(eligible?.electrode,f.electrode);
    assert.equal(eligible?.electrodeBenchIndex,1);
    assert.equal(eligible?.recipientBenchIndex,0);
    f.source.discard.cards.pop();
    assert.equal(chooseOwnerBombAfterCompressor(f.state,seat,{turn:16},
      {allowLaterBenchedElectrode:true}),null,
      'Two Energy do not pay the opt-in three-card quality threshold');
  }
});

test('v10 later-turn benched source Bomb uses physical Bench slot, owner prompt and self-KO',()=>{
  class BenchStore extends Store{
    dispatch(action){
      const owner=this.state.players[this.state.activePlayer];
      if(action instanceof UseAbilityAction){
        assert.equal(action.target.slot,2);
        assert.equal(action.target.index,1);
        this.state.prompts.push(new AttachEnergyPrompt(owner,owner.discard));
      }else if(action instanceof ResolvePromptAction){
        const prompt=this.state.prompts.find(p=>p.id===action.id);
        if(prompt)prompt.result=action.result;
        if(prompt instanceof AttachEnergyPrompt){
          for(const entry of action.result){
            const idx=owner.discard.cards.indexOf(entry.card);
            assert.ok(idx>=0);
            owner.discard.cards.splice(idx,1);
            owner.bench[0].energies.cards.push(entry.card);
          }
          owner.discard.cards.push(owner.bench[1].getPokemonCard());
          owner.bench.splice(1,1);
          this.state.players[1-this.state.activePlayer].prizesLeft-=2;
        }
        this.state.prompts=this.state.prompts.filter(p=>p.result===undefined);
      }
      return this.state;
    }
  }
  for(const seat of [0,1]){
    const f=fixture(seat),bot=new SimpleTacticsAi({id:f.source.id});
    f.store=new BenchStore(f.state);
    f.source.active.card={fullName:'Regidrago V SIT'};
    f.source.bench.push({getPokemonCard:()=>f.electrode,energies:{cards:[]}});
    const prior=BenchStore.prototype.dispatch;
    const result=withOwnerBombAfterSourceCompressor(()=>{
      f.store.dispatch(new AddPlayerAction());
      f.store.dispatch(new ResolvePromptAction(123,[0,1,2]));
      f.state.turn=18;
      const bomb=bot.decodeNextAction(f.state);
      assert.equal(bomb.constructor.name,'UseAbilityAction');
      assert.equal(bomb.target.slot,2);
      assert.equal(bomb.target.index,1);
      f.store.dispatch(bomb);
      const pay=bot.decodeNextAction(f.state);
      assert.equal(pay.constructor.name,'ResolvePromptAction');
      f.store.dispatch(pay);
    },seat,{Store:BenchStore,SimpleTacticsAi,
      GamePhase:{PLAYER_TURN:'PLAYER_TURN'},
      abilityActions:{UseAbilityAction},
      promptActions:{ResolvePromptAction},
      cardActions:{PlayerType:{BOTTOM_PLAYER:0},
        SlotType:{ACTIVE:1,BENCH:2}},
      allowLaterBenchedElectrode:true});
    assert.strictEqual(BenchStore.prototype.dispatch,prior);
    assert.equal(result.audit.nativeAcceptedBombs,1);
    assert.equal(result.audit.physicallyAttachedEnergyCards,3);
    assert.equal(result.audit.physicalElectrodeSelfKosWithTwoPrizes,1);
    assert.equal(f.source.bench[0].energies.cards.length,3);
    assert.equal(f.opponent.getPrizeLeft(),4);
  }
});
