'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedRaichu}=require('./temple-raichu-board.cjs');
const {withPutDamageZeroCapPaperHook}=
  require('./put-damage-zero-cap-paper-hook.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine=name=>require(path.join(output,name));

/**
 * Actual pinned Store AttackAction using Froslass UNM and genuine prompts.
 * The staged board contains Froslass with a Water Energy and both players'
 * six Prize cards; this is a mechanical regression, not a competitive game.
 * @param {number} assigned Self-damage requested as counters times ten.
 * @param {boolean} guarded Whether to intercept invalid paper allocations.
 * @param {0|1} seat Physical attacker's seat.
 */
function probeFroslassPartialBudget(assigned,guarded,seat){
  const f=stagedRaichu([],null);
  if(seat===1){
    f.state.players=[f.b,f.a];
    f.state.activePlayer=1;
  }
  const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
  const {CardList}=engine('game/store/state/card-list');
  const {AttackAction}=engine('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    engine('game/store/actions/resolve-prompt-action');
  const {PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  f.a.active.cards.splice(0,f.a.active.cards.length,
    f.card('Snorunt UNM'),f.card('Froslass UNM'));
  const energy=f.card('Water Energy SVE');
  f.a.active.cards.push(energy);
  f.a.active.energies.cards.push(energy);
  const backup=new PokemonCardList();
  backup.cards.push(f.card('Pikachu LOR'));
  f.a.bench.push(backup);
  for(const player of [f.a,f.b]){
    player.deck.cards.push(f.card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(f.card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  f.a.active.getPokemonCard().id=1101;
  f.b.active.getPokemonCard().id=2201;
  let nativeAccepted=null,promptBudget=null;
  const act=()=>{
    f.store.dispatch(new AttackAction(f.a.id,'Spiteful Sigh'));
    for(let i=0;i<16;i++){
      const pending=f.state.prompts.find(p=>p.result===undefined);
      if(!pending)break;
      let answer;
      if(pending.constructor.name==='PutDamagePrompt'){
        promptBudget=pending.damage;
        assert.equal(promptBudget,70);
        assert.equal(pending.options.allowPlacePartialDamage,true);
        answer=[{target:{player:PlayerType.BOTTOM_PLAYER,
          slot:SlotType.ACTIVE,index:0},damage:assigned}];
        nativeAccepted=pending.validate(answer,f.state);
      }else if(pending.constructor.name==='WaitPrompt'){
        answer=null;
      }else{
        throw new Error('Unexpected Froslass native prompt '+
          pending.constructor.name);
      }
      f.store.dispatch(new ResolvePromptAction(pending.id,answer));
    }
  };
  let error=null;
  try{
    if(guarded)withPutDamageZeroCapPaperHook(act);
    else act();
  }catch(e){error=String(e?.message??e);}
  return {
    assigned,guarded,seat,promptBudget,nativeAccepted,error,
    ownerDamage:f.a.active.damage,
    opposingDamage:f.b.active.damage,
    ownerActive:f.a.active.getPokemonCard()?.fullName??null,
    openPrompts:f.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name)
  };
}
function run(){
  const cases=[];
  for(const seat of [0,1]){
    const legal=probeFroslassPartialBudget(70,false,seat);
    const illegal=probeFroslassPartialBudget(80,false,seat);
    const protectedLegal=probeFroslassPartialBudget(70,true,seat);
    const protectedIllegal=probeFroslassPartialBudget(80,true,seat);
    assert.equal(legal.nativeAccepted,true);
    assert.equal(illegal.nativeAccepted,true,
      'Pinned optional validator accepts a forbidden 80/70 allocation');
    assert.equal(legal.error,null);
    assert.equal(illegal.error,null);
    assert.equal(legal.ownerDamage,70);
    assert.equal(legal.opposingDamage,140);
    assert.equal(illegal.opposingDamage,160,
      'Native AttackAction can inflate printed 140 to 160 damage');
    assert.equal(protectedLegal.error,null);
    assert.equal(protectedLegal.ownerDamage,70);
    assert.equal(protectedLegal.opposingDamage,140);
    assert.match(protectedIllegal.error,
      /PAPER_PUT_DAMAGE_REJECTED:EXCEEDS_PRINTED_PARTIAL_DAMAGE_BUDGET/);
    assert.deepEqual(protectedIllegal.openPrompts,['PutDamagePrompt']);
    assert.equal(protectedIllegal.ownerDamage,0);
    assert.equal(protectedIllegal.opposingDamage,0);
    cases.push({seat,legal,illegal,protectedLegal,protectedIllegal});
  }
  const result={
    fixture:'genuine-pinned-native-attack-Froslass-UNM-partial-budget',
    cards:['Froslass UNM','Snorunt UNM','Water Energy SVE'],
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    originalAichiPublishedRankCard:false,
    competitiveGameQualified:false,cases
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)run();
module.exports={probeFroslassPartialBudget,run};
