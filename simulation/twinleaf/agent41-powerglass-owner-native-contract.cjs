'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {ownerPowerglassAttachInput,chooseOwnerPowerglassAttach}=
  require('./agent41-owner-powerglass-attach-prompt.cjs');
const {assertValidPromptAction}=require('./prompt-integrity.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const pinned=name=>require(path.join(OUTPUT,name));

/**
 * An actual pinned Store test of the policy's native Powerglass prompt
 * signature, detached owner-only selection and physical Basic Energy transfer.
 * Both real owner seats are tested. This staged case is not a full game.
 * @returns {object}
 */
function powerglassOwnerNativeContract(){
  const cards=initializeCards();
  const {Store}=pinned('game/store/store');
  const {Player}=pinned('game/store/state/player');
  const {PokemonCardList}=pinned('game/store/state/pokemon-card-list');
  const {CardList}=pinned('game/store/state/card-list');
  const {GamePhase}=pinned('game/store/state/state');
  const {EnergyType,SuperType,Format}=pinned('game/store/card/card-types');
  const {GameMessage}=pinned('game/game-message');
  const {PlayCardAction,PlayerType,SlotType}=
    pinned('game/store/actions/play-card-action');
  const {PassTurnAction}=pinned('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    pinned('game/store/actions/resolve-prompt-action');

  const output=[];
  for(const ownerSeat of [0,1]){
    let nextId=5200+ownerSeat*100;
    const card=printing=>{
      const c=cards.getCardByName(printing);
      assert.ok(c,'Missing pinned card '+printing);
      c.id=nextId++;
      return c;
    };
    const store=new Store({onStateChange(){}});
    const state=store.state;
    const owner=new Player(),opponent=new Player();
    owner.id=701+ownerSeat;opponent.id=803+ownerSeat;
    owner.name='Powerglass owner '+ownerSeat;
    opponent.name='Passive staged opponent';
    state.players=ownerSeat===0?[owner,opponent]:[opponent,owner];
    state.activePlayer=ownerSeat;
    state.turn=42;
    state.phase=GamePhase.PLAYER_TURN;
    state.gameSettings.format=Format.EXPANDED;

    const mewtwo=card('Mewtwo & Mew-GX UNM');
    const gengar=card('Gengar & Mimikyu-GX TEU');
    const powerglass=card('Powerglass SFA');
    const special=card('Double Colorless Energy SUM');
    const psychic=card('Psychic Energy MEE');
    owner.active.cards.push(mewtwo);
    owner.bench.push(new PokemonCardList());
    owner.bench[0].cards.push(gengar);
    owner.hand.cards.push(powerglass);
    // A Special Energy in the same public discard must remain untouched:
    // pinned prompt source includes it, but native printed filter excludes it.
    owner.discard.cards.push(special,psychic);
    opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));
    for(const player of [owner,opponent]){
      for(let i=0;i<8;i++)
        player.deck.cards.push(card('Psychic Energy MEE'));
      for(let i=0;i<6;i++){
        const prize=new CardList();
        prize.cards.push(card('Psychic Energy MEE'));
        player.prizes.push(prize);
      }
    }

    store.dispatch(new PlayCardAction(owner.id,0,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    assert.ok(owner.active.tools.includes(powerglass));
    store.dispatch(new PassTurnAction(owner.id));

    let pending=null;
    for(let i=0;i<16;i++){
      pending=state.prompts.find(p=>p.result===undefined);
      if(pending?.constructor?.name==='AttachEnergyPrompt')break;
      assert.equal(pending?.constructor?.name,'WaitPrompt',
        'Powerglass after-Pass expected native WaitPrompt or AttachEnergyPrompt');
      store.dispatch(new ResolvePromptAction(pending.id,null));
    }
    assert.ok(pending,'Missing native Powerglass AttachEnergyPrompt');
    const input=ownerPowerglassAttachInput(state,ownerSeat,{
      basicEnergyType:EnergyType.BASIC,
      energySuperType:SuperType.ENERGY,
      attachMessage:GameMessage.ATTACH_ENERGY_TO_ACTIVE,
      bottomPlayer:PlayerType.BOTTOM_PLAYER,
      activeSlot:SlotType.ACTIVE
    });
    assert.ok(input,'Owner Powerglass prompt signature was not recognized');
    assert.equal(input.actor.actorSeat,ownerSeat);
    assert.deepEqual(input.prompt.offered.map(r=>r.eligible),[false,true],
      'Public Special must be rejected and Basic Psychic offered');
    const choice=chooseOwnerPowerglassAttach(input);
    assert.deepEqual(choice,{
      sourceIndex:1,
      target:{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0}
    });
    const chosen=pending.cardList.cards[choice.sourceIndex];
    assert.strictEqual(chosen,psychic);
    const action=new ResolvePromptAction(pending.id,[{
      card:chosen,to:{...choice.target}
    }]);
    assertValidPromptAction(state,action,{enforceAttachEnergyGeometry:true});
    store.dispatch(action);
    assert.ok(owner.active.energies.cards.includes(psychic),
      'Owner Basic Psychic was not attached by real Store');
    assert.ok(!owner.discard.cards.includes(psychic),
      'Native Store failed to remove attached Basic from owner discard');
    assert.ok(owner.discard.cards.includes(special),
      'Native Store moved disallowed Special Energy');
    assert.ok(!opponent.active.energies.cards.includes(psychic),
      'Native Store gave owner Basic Energy to opponent');
    output.push({ownerSeat,promptMessage:input.prompt.kind,
      candidatePool:input.prompt.offered.map(r=>r.printing),
      selectedIndex:choice.sourceIndex,
      selectedPrinting:psychic.fullName,
      physicalOwnerActiveEnergyCount:owner.active.energies.cards.length,
      ownerDiscardSpecialRemains:owner.discard.cards.includes(special),
      copiedGXSpent:owner.usedGX});
  }
  return {schema:'agent41-powerglass-owner-native-contract-v1',
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    cases:output,competitiveQualifiedGames:0};
}

if(require.main===module)
  console.log(JSON.stringify(powerglassOwnerNativeContract(),null,2));
module.exports={powerglassOwnerNativeContract};
