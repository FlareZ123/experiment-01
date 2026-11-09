'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {actorObservation} = require('../actor-observation-contract.cjs');
const {stagedPainfulSpoons} =
  require('../agent4-rank31-alakazam-movesource-native.cjs');
const {rank31Original60} =
  require('../agent49-owner-direct-fog-one-energy-native.cjs');
const {chooseOwnerCursedBlastPrizeConversion:choose} =
  require('./owner-cursed-blast-prize-policy.cjs');

const OUTPUT = path.resolve(__dirname, '../../../vendor/twinleaf/ptcg-server/output');
const native = name => require(path.join(OUTPUT,name));
const AWARDS = Object.freeze({'Shadow Rider Calyrex V CRE':2});

/**
 * Test the prize-aware owner-root selector against a genuine native Store,
 * including the paper-visible ability/target selection, self-KO, both Prize
 * prompts and opponent Active promotion. Both players' decks and the damage
 * precondition are synthetic: this is explicitly not a complete game.
 *
 * @param {0|1} seat Acting physical source seat.
 * @returns {object} Recorded settlement, never a match-win certificate.
 */
function probeOwnerCursedBlastPrizeConversion(seat) {
  assert.ok(seat===0 || seat===1);
  const {UseAbilityAction}=native('game/store/actions/game-actions');
  const {PlayerType,SlotType}=native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const f=stagedPainfulSpoons(seat);
  const {source,opponent,state,store}=f;
  assert.equal(state.activePlayer,seat);
  assert.equal(state.turn,3);
  assert.equal(source.bench.length,5);
  const original=rank31Original60();
  assert.equal(original.length,60);
  assert.equal(original.filter(name=>name==='Dusclops PRE').length,3);
  const duskull=f.card('Duskull PRE');
  const dusclops=f.card('Dusclops PRE');
  source.bench[0].cards.push(duskull,dusclops);
  const target=opponent.active.getPokemonCard();
  assert.equal(target.fullName,'Shadow Rider Calyrex V CRE');
  assert.equal(Number(target.hp),210);
  opponent.active.damage=200;
  const view=actorObservation(state,seat);
  const plan=choose(view,AWARDS);
  assert.ok(plan,'Owner-visible source/target should be Prize-positive');
  assert.equal(plan.sourcePrinting,'Dusclops PRE');
  assert.equal(plan.sourceBenchIndex,0);
  assert.equal(plan.targetPrinting,target.fullName);
  assert.equal(plan.targetSlot,'ACTIVE');
  assert.equal(plan.targetRemainingHp,10);
  assert.equal(plan.hypotheticalNetPrizeAdvantage,1);

  // A materially weaker target or impending opponent last Prize is rejected
  // without reading either player's hidden Prize identities.
  const outOfRange={...view,opponentPublic:{...view.opponentPublic,
    active:{...view.opponentPublic.active,damage:100}}};
  assert.equal(choose(outOfRange,AWARDS),null);
  const lastPrize={...view,opponentPublic:{...view.opponentPublic,
    prizeCount:1}};
  assert.equal(choose(lastPrize,AWARDS),null);

  const sourcePrizesBefore=source.getPrizeLeft();
  const opponentPrizesBefore=opponent.getPrizeLeft();
  assert.deepEqual([sourcePrizesBefore,opponentPrizesBefore],[6,6]);
  const promotedSlot=opponent.bench.find(slot=>slot.getPokemonCard());
  assert.ok(promotedSlot);
  const promotedPrinting=promotedSlot.getPokemonCard().fullName;

  store.dispatch(new UseAbilityAction(source.id,plan.abilityName,{
    player:PlayerType.BOTTOM_PLAYER,
    slot:SlotType.BENCH,index:plan.sourceBenchIndex
  }));
  const pending=()=>state.prompts.find(p=>p.result===undefined);
  const prompts=[];
  let targetChosen=false;
  let promotionChosen=false;
  let sourcePrizeCards=0;
  let opponentPrizeCards=0;
  for(let i=0;i<50;i++){
    const prompt=pending();
    if(!prompt)break;
    const kind=prompt.constructor.name;
    let reply;
    if(kind==='WaitPrompt')reply=null;
    else if(kind==='ShowCardsPrompt')reply=true;
    else if(kind==='ChoosePokemonPrompt'){
      if(prompt.playerId===source.id){
        assert.equal(prompt.validate([opponent.active],state),true);
        reply=[opponent.active];targetChosen=true;
      }else{
        assert.equal(prompt.playerId,opponent.id);
        assert.equal(prompt.validate([promotedSlot],state),true);
        reply=[promotedSlot];promotionChosen=true;
      }
    }else if(kind==='ChoosePrizePrompt'){
      const chooser=state.players.find(p=>p.id===prompt.playerId);
      assert.ok(chooser);
      const count=Number(prompt.options?.count??1);
      reply=chooser.prizes.filter(p=>p.cards.length>0).slice(0,count);
      assert.equal(reply.length,count);
      assert.equal(prompt.validate(reply,state),true);
      if(chooser.id===source.id)sourcePrizeCards+=count;
      else if(chooser.id===opponent.id)opponentPrizeCards+=count;
      else assert.fail('Unknown Prize prompt owner');
    }else if(kind==='ShuffleDeckPrompt'){
      const chooser=state.players.find(p=>p.id===prompt.playerId);
      assert.ok(chooser);
      reply=chooser.deck.cards.map((_,index)=>index);
    }else throw new Error('Unexpected Cursed Blast prompt '+kind);
    prompts.push({kind,ownerId:prompt.playerId});
    store.dispatch(new ResolvePromptAction(prompt.id,reply));
  }
  assert.equal(pending(),undefined);
  assert.equal(targetChosen,true);
  assert.equal(promotionChosen,true);
  assert.equal(sourcePrizeCards,2);
  assert.equal(opponentPrizeCards,1);
  assert.equal(source.getPrizeLeft(),4);
  assert.equal(opponent.getPrizeLeft(),5);
  assert.equal(source.discard.cards.includes(dusclops),true);
  assert.equal(source.discard.cards.includes(duskull),true);
  assert.equal(opponent.discard.cards.includes(target),true);
  assert.equal(opponent.active.getPokemonCard().fullName,promotedPrinting);
  assert.equal(source.bench[0].getPokemonCard(),undefined);
  return {
    version:'agent15-owner-cursed-blast-native-policy-bridge-v1',
    seat,ownerOnlyPlan:plan,source60Count:original.length,
    sourceDeckComplete:false,opponentDeckComplete:false,
    targetDamageStaged:200,abilityNativeAccepted:true,
    targetChosen,opponentPromotionChosen:promotionChosen,
    sourcePrizesBefore,sourcePrizesAfter:source.getPrizeLeft(),
    opponentPrizesBefore,opponentPrizesAfter:opponent.getPrizeLeft(),
    sourcePrizeCards,opponentPrizeCards,prizeDelta:sourcePrizeCards-opponentPrizeCards,
    sourceSelfKoDiscarded:true,targetKoDiscarded:true,prompts,
    competitiveQualified:false
  };
}

module.exports={probeOwnerCursedBlastPrizeConversion};
