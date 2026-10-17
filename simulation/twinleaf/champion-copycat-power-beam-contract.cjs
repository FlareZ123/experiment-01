'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {installMimikyuNonGxCopycatHook} = require('./copycat-compat.cjs');
const {installDeclaredCopyHistoryHook} = require('./copycat-declared-history-hook.cjs');

const output = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine = name => require(path.join(output,name));

/**
 * Genuine Store attack/prompt contract for the co-builder's two-TURN
 * Mimikyu -> Apex -> Timeless-GX -> bonus-turn Power Beam sequence.
 * The board and the preceding opponent Apex declaration are staged.
 * No source-60 game, policy validity or win-rate conclusion follows.
 */
function stagedChampionPowerBeamAfterTimeless() {
  const cards = initializeCards();
  const get = name => {
    const card = cards.getCardByName(name);
    assert.ok(card,'Missing pinned card: '+name);
    return card;
  };
  const mimikyu=get('Mimikyu GRI');
  const regidragoFirst=get('Regidrago VSTAR SIT');
  const regidragoSecond=get('Regidrago VSTAR SIT');
  const dialga=get('Dialga-GX UPR');
  const radiant=get('Radiant Eternatus CRZ');
  const clefairy=get("Lillie's Clefairy ex JTG");
  const psychic1=get('Psychic Energy SVE');
  const psychic2=get('Psychic Energy SVE');
  const dratini=get('Dratini OBF');
  const {Store}=engine('game/store/store');
  const {Player}=engine('game/store/state/player');
  const {CardList}=engine('game/store/state/card-list');
  const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
  const {GamePhase}=engine('game/store/state/state');
  const {AttackAction}=engine('game/store/actions/game-actions');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {clearCopyAttackSessionsForTests}=
    engine('game/store/prefabs/copy-attack-delegation');

  clearCopyAttackSessionsForTests();
  const restoreCopy=installMimikyuNonGxCopycatHook();
  const restoreHistory=installDeclaredCopyHistoryHook({mimikyu:true,regidrago:true});
  try {
    const store=new Store({onStateChange() {}});
    const state=store.state;
    const candidate=new Player();
    candidate.id=101;
    candidate.name='shadow-rider-copycat-staged';
    const opponent=new Player();
    opponent.id=202;
    opponent.name='regidrago-staged';
    state.players=[candidate,opponent];
    candidate.active.cards.push(mimikyu,psychic1,psychic2);
    candidate.discard.cards.push(dialga,radiant);
    const support=new PokemonCardList();
    support.cards.push(clefairy);
    candidate.bench.push(support);
    opponent.active.cards.push(regidragoFirst);
    const second=new PokemonCardList();
    second.cards.push(regidragoSecond);
    opponent.bench.push(second);
    const spare=new PokemonCardList();
    spare.cards.push(dratini);
    opponent.bench.push(spare);
    for(const player of state.players) {
      player.prizes=Array.from({length:6},()=>
        CardList.fromList(['Psychic Energy SVE']));
      player.deck=CardList.fromList(Array(12).fill('Psychic Energy SVE'));
    }
    state.activePlayer=0;
    state.phase=GamePhase.PLAYER_TURN;
    state.turn=4;
    state.playerLastAttack[opponent.id]={
      attack:regidragoFirst.attacks.find(a=>a.name==='Apex Dragon'),
      sourceCard:regidragoFirst
    };

    /** Resolve a copied attack from own discard through a real source prompt. */
    function copyPayload(payload,attackName) {
      assert.equal(state.activePlayer,0);
      assert.equal(state.phase,GamePhase.PLAYER_TURN);
      store.dispatch(new AttackAction(candidate.id,'Copycat'));
      const prompt=state.prompts.find(p=>p.result===undefined &&
        p.constructor.name==='ChooseAttackPrompt');
      assert.ok(prompt,'Copycat must offer the nested Apex payload');
      assert.ok(prompt.cards.includes(payload),'Own discarded payload missing');
      const selected=payload.attacks.find(a=>a.name===attackName);
      assert.ok(selected,attackName+' not printed on payload');
      assert.equal(prompt.validate(selected),true,'Copy prompt rejects '+attackName);
      store.dispatch(new ResolvePromptAction(prompt.id,selected));
      assert.equal(state.playerLastAttack[candidate.id]?.attack?.name,'Copycat');
      return {payload:payload.fullName,chosen:attackName,
        possible:prompt.cards.flatMap(c=>c.attacks.map(a=>a.name))};
    }

    /**
     * Advance all real Store KO, Prize, promotion and turn-boundary prompts.
     * Promote the prepared second VSTAR before the spare Dratini.
     */
    function finish() {
      const prompts=[];
      for(let i=0;i<24;i++) {
        const pending=state.prompts.find(p=>p.result===undefined);
        if(!pending)break;
        const label=pending.constructor.name;
        if(label==='WaitPrompt') {
          store.dispatch(new ResolvePromptAction(pending.id,null));
        } else if(label==='ChoosePrizePrompt') {
          const player=state.players.find(p=>p.id===pending.playerId);
          const n=pending.options.count;
          const prize=player.prizes.filter(x=>x.cards.length>0).slice(0,n);
          assert.equal(prize.length,n);
          store.dispatch(new ResolvePromptAction(pending.id,prize));
        } else if(label==='ChoosePokemonPrompt') {
          assert.equal(pending.playerId,opponent.id);
          const promote=opponent.bench.find(p=>p.cards.length>0);
          assert.ok(promote);
          store.dispatch(new ResolvePromptAction(pending.id,[promote]));
        } else {
          assert.fail('Unexpected actual source prompt '+label);
        }
        prompts.push(label);
      }
      assert.equal(state.prompts.some(p=>p.result===undefined),false,
        'Unresolved prompt after actual attack chain');
      return prompts;
    }

    const first=copyPayload(dialga,'Timeless-GX');
    assert.equal(candidate.usedGX,true);
    assert.equal(candidate.usedTurnSkip,true);
    assert.equal(opponent.active.damage,300,
      'Fairy Zone must double the first copied Psychic attack');
    const firstPrompts=finish();
    assert.ok(firstPrompts.includes('ChoosePrizePrompt'));
    assert.ok(firstPrompts.includes('ChoosePokemonPrompt'));
    assert.ok(opponent.discard.cards.includes(regidragoFirst));
    assert.equal(candidate.getPrizeLeft(),4);
    assert.strictEqual(opponent.active.getPokemonCard(),regidragoSecond);
    assert.equal(state.activePlayer,0,
      'Timeless-GX bonus turn must skip the opponent after promoted KO');
    assert.equal(state.phase,GamePhase.PLAYER_TURN);
    assert.equal(state.playerLastAttack[opponent.id]?.attack?.name,'Apex Dragon',
      'Last printed opponent Apex remains eligible on immediate bonus turn');
    assert.equal(candidate.usedGX,true);

    const bonusTurn=state.turn;
    const secondCopy=copyPayload(radiant,'Power Beam');
    assert.equal(candidate.usedGX,true,
      'Second non-GX payload must keep prior GX allowance spent');
    assert.equal(opponent.active.damage,400,
      'Fairy Zone doubles copied Power Beam 200 against Dragon');
    const secondPrompts=finish();
    assert.ok(opponent.discard.cards.includes(regidragoSecond));
    assert.equal(candidate.getPrizeLeft(),2,
      'Two additional Prizes must be taken for the second VSTAR');
    assert.strictEqual(opponent.active.getPokemonCard(),dratini);
    assert.equal(state.playerLastAttack[candidate.id]?.attack?.name,'Copycat');

    return {
      schema:'staged-champion-two-copycat-extra-turn-v1',
      first,second:secondCopy,
      firstPrompts,secondPrompts,secondTurn:bonusTurn,
      firstKo:opponent.discard.cards.includes(regidragoFirst),
      secondKo:opponent.discard.cards.includes(regidragoSecond),
      prizesTaken:4,usedGX:candidate.usedGX,
      declaredLastAttack:state.playerLastAttack[candidate.id]?.attack?.name,
      scope:'Staged Source Store only, no natural 60-card deal or policy inference',
      qualifiedForCompetitiveInference:false
    };
  } finally {
    restoreHistory();
    restoreCopy();
    clearCopyAttackSessionsForTests();
  }
}

if(require.main===module){
  process.stdout.write(JSON.stringify(stagedChampionPowerBeamAfterTimeless(),
    null,2)+'\n');
}
module.exports={stagedChampionPowerBeamAfterTimeless};
