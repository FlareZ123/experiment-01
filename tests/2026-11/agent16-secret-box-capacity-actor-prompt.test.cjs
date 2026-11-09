'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {withOwnerSecretBoxCapacityActorPrompt}=
  require('../../simulation/twinleaf/agent16-secret-box-capacity-actor-prompt.cjs');

const BOX='Secret Box TWM';
const VIP='Battle VIP Pass FST';
const CARRIER='Rescue Carrier EVS';
const LILLIE="Lillie's Determination M1L";
const CATEGORY_NAMES=[
  'Fog Crystal CRE','Powerglass SFA','Ace Trainer AOR','Sky Field ROS'
];
const TYPES={ITEM:0,TOOL:1,SUPPORTER:2,STADIUM:3};
const POLICY={maxTotalCost:100,defaultCost:20,spentVipCost:0,
  duplicateDiscount:0,recoveryTargetPremium:3,
  costs:{[VIP]:0,[CARRIER]:3,[LILLIE]:5}};
class TrainerCard {
  constructor(fullName,trainerType) {this.fullName=fullName;this.trainerType=trainerType;}
}
class ChooseCardsPrompt {
  constructor(id,owner,cards,message,options) {
    this.id=id;this.playerId=owner.id;this.cards=cards;this.message=message;
    this.options=options;this.sourceCard={fullName:BOX};this.result=undefined;
  }
  validate(selected) {
    const unique=new Set(selected).size===selected.length;
    return unique && selected.every(c=>this.cards.cards.includes(c))&&
      (this.message==='CHOOSE_CARD_TO_DISCARD'?
        selected.length===3:
        selected.length===4&&new Set(selected.map(c=>c.trainerType)).size===4);
  }
}
class ResolvePromptAction {
  constructor(id,result) {this.id=id;this.result=result;}
}
class PlayCardAction {
  constructor(id,handIndex,target){
    this.id=id;this.handIndex=handIndex;this.target=target;
  }
}
class SimpleTacticsAi {
  decodeNextAction() {return {kind:'delegated'};}
}
class Store {
  constructor(state) {this.state=state;}
  dispatch(action) {
    if(action?.constructor?.name==='ResolvePromptAction'){
      const p=this.state.prompts.find(x=>x.id===action.id);
      assert.ok(p.validate(action.result));
      p.result=action.result;
      const owner=this.state.players.find(x=>x.id===p.playerId);
      const from=p.cards.cards,to=p.message==='CHOOSE_CARD_TO_DISCARD'?
        owner.discard.cards:owner.hand.cards;
      for(const c of action.result){
        from.splice(from.indexOf(c),1);
        to.push(c);
      }
    }
    return {accepted:true};
  }
}
function engine(name) {
  const modules={
    'simple-bot/simple-tactics-ai':{SimpleTacticsAi},
    'game/store/store':{Store},
    'game/store/actions/resolve-prompt-action':{ResolvePromptAction},
    'game/store/actions/play-card-action':{PlayCardAction,
      PlayerType:{ANY:0},SlotType:{BOARD:0}},
    'game/store/card/trainer-card':{TrainerCard},
    'game/store/card/card-types':{TrainerType:TYPES}
  };
  return modules[name];
}

test('opt-in decoder selects and physically settles payment then four real categories on both seats',()=>{
  for(const seat of [0,1]){
    for(const count of [1,4]){
      const owner={id:411,hand:{cards:[
        {fullName:VIP},{fullName:VIP},{fullName:CARRIER},
        {fullName:CARRIER},{fullName:LILLIE}
      ]},deck:{cards:CATEGORY_NAMES.map((name,i)=>
        new TrainerCard(name,i))},discard:{cards:
          Array.from({length:count},(_,i)=>({fullName:'Unown '+i,hp:60}))
      },supporterTurn:0};
      const opponent={id:12,hand:{cards:['secret']},deck:{cards:[]},
        discard:{cards:[]}};
      const state={turn:14,players:seat===0?[owner,opponent]:[opponent,owner],
        prompts:[]};
      const store=new Store(state);
      const bot=Object.create(SimpleTacticsAi.prototype);
      bot.client={id:owner.id};
      state.prompts=[new ChooseCardsPrompt(4,owner,owner.hand,
        'CHOOSE_CARD_TO_DISCARD',{min:3,max:3})];
      const {result,audit}=withOwnerSecretBoxCapacityActorPrompt(()=>{
        const stale={...state};
        assert.equal(bot.decodeNextAction(stale).kind,'delegated');
        const payment=bot.decodeNextAction(state);
        assert.equal(payment.constructor.name,'ResolvePromptAction');
        assert.deepEqual(payment.result.map(c=>c.fullName),
          count===1?[VIP,VIP,CARRIER]:[VIP,VIP,LILLIE]);
        store.dispatch(payment);
        state.prompts=[new ChooseCardsPrompt(5,owner,owner.deck,
          'CHOOSE_CARD_TO_HAND',{maxItems:1,maxTools:1,
            maxSupporters:1,maxStadiums:1})];
        const search=bot.decodeNextAction(state);
        assert.equal(search.constructor.name,'ResolvePromptAction');
        assert.deepEqual(search.result.map(c=>c.fullName),CATEGORY_NAMES);
        store.dispatch(search);
        return owner;
      },{engine,stagedStore:store,policy:POLICY});
      assert.equal(result.hand.cards.filter(c=>
        CATEGORY_NAMES.includes(c.fullName)).length,4);
      assert.equal(audit.ownerPaymentPromptProposals,1);
      assert.equal(audit.ownerCategoryPromptProposals,1);
      assert.equal(audit.nativePaymentAccepted,1);
      assert.equal(audit.nativeCategoryAccepted,1);
      assert.equal(audit.nativeRejected,0);
      assert.equal(audit.physicalReceiptCount,2);
      assert.equal(audit.outstandingPhysicalReceipts,0);
      assert.equal(audit.acceptedBySeat[seat],2);
      assert.equal(audit.nonLiveSpeculativeDelegations,1);
      assert.equal(audit.qualifiedGames,0);
    }
  }
});
