'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {VERSION,pin,withCorrectedHnsDiscardAbilityCount}=
  require('./agent25-hns-discard-ability-lock-paper-hook.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=rel=>require(path.join(output,rel));

/**
 * Midgame original-Store action dispatch, one ACTUAL printed attack and four
 * publicly discarded HNS printings. Synthetic board states are deliberately
 * labelled artificial; no naturally dealt match or game win is claimed.
 *
 * @param {'plain'|'wobbuffet'|'wobb-psychic'|'silentlab'|'silent-stage'|'garbotoxin'} mode
 * @param {0|1} seat
 * @param {boolean} patched
 */
function runArm(mode,seat,patched){
  const {State,GamePhase}=load('game/store/state/state');
  const {Player}=load('game/store/state/player');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {CardList}=load('game/store/state/card-list');
  const {Store}=load('game/store/store');
  const {GameSettings}=load('game/core/game-settings');
  const {AttackAction}=load('game/store/actions/game-actions');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const manager=initializeCards();
  let nextId=0;
  function card(printing){
    const value=manager.getCardByName(printing);
    assert.ok(value,'missing pinned printing '+printing);
    value.id=++nextId;
    return value;
  }
  const owner=new Player();
  owner.id=110;owner.name='Dhelmise pinned original attacking';
  const attackCard=card('Dhelmise M5');
  owner.active.cards.push(attackCard);
  const energy=card('Psychic Energy SVE');
  owner.active.cards.push(energy);
  owner.active.energies.cards.push(energy);
  let donorPrints;
  if(mode==='wobbuffet')donorPrints=[
    'Banette M5','Banette M5','Sinistcha M5','Sinistcha M5'];
  else if(mode==='silentlab')donorPrints=[
    'Banette M5','Banette M5','Shuppet M5','Shuppet M5'];
  else donorPrints=['Banette M5','Banette M5','Banette M5','Banette M5'];
  for(const print of donorPrints)owner.discard.cards.push(card(print));

  const opponent=new Player();
  opponent.id=220;opponent.name='Authentic lock printing controller';
  const opponentIsWobb=mode==='wobbuffet'||mode==='wobb-psychic';
  opponent.active.cards.push(card(opponentIsWobb?
    'Wobbuffet PHF':'Shadow Rider Calyrex V CRE'));
  const backup=new PokemonCardList();
  backup.cards.push(card('Tapu Lele-GX GRI'));
  opponent.bench.push(backup);
  if(mode==='silentlab'||mode==='silent-stage'){
    opponent.stadium.cards.push(card('Silent Lab PRC'));
  }
  if(mode==='garbotoxin'){
    const garbo=new PokemonCardList();
    garbo.cards.push(card('Trubbish BKP'));
    garbo.cards.push(card('Garbodor BKP'));
    const tool=card('Float Stone BKT');
    garbo.cards.push(tool);
    garbo.tools.push(tool);
    opponent.bench.push(garbo);
  }
  for(const player of [owner,opponent]){
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
    for(let i=0;i<6;i++)player.deck.cards.push(card('Psychic Energy SVE'));
  }
  const state=new State();
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=seat;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=3;
  const settings=new GameSettings();
  state.gameSettings=settings;
  state.rules=settings.rules;
  const store=new Store({onStateChange(){}});
  store.state=state;

  const prizesBefore=owner.prizes.filter(x=>x.cards.length>0).length;
  function executeAttack(){
    store.dispatch(new AttackAction(owner.id,'Vengeful Anchor'));
    const prompts=[];
    for(let i=0;i<20;i++){
      const prompt=store.state.prompts.find(p=>p.result===undefined);
      if(!prompt)break;
      let result;
      const kind=prompt.constructor.name;
      if(kind==='WaitPrompt')result=null;
      else if(kind==='ChoosePrizePrompt'){
        const who=store.state.players.find(x=>
          x.id===prompt.getPerspectivePlayerId());
        assert.ok(who);
        result=who.prizes.filter(x=>x.cards.length>0)
          .slice(0,prompt.options.count);
      }else if(kind==='ChoosePokemonPrompt'){
        const who=store.state.players.find(x=>
          x.id===prompt.getPerspectivePlayerId());
        assert.ok(who);
        const next=who.bench.find(x=>x.cards.length>0);
        assert.ok(next);
        result=[next];
      }else throw new Error('Unrecognized original Store prompt '+kind);
      store.dispatch(new ResolvePromptAction(prompt.id,result));
      prompts.push(kind);
    }
    assert.equal(store.state.prompts.filter(p=>p.result===undefined).length,0);
    const prizesTaken=prizesBefore-
      owner.prizes.filter(x=>x.cards.length>0).length;
    const survivingWobb=opponent.active.cards.some(x=>x.name==='Wobbuffet');
    return {prizesTaken,opponentActiveDamage:opponent.active.damage,
      wobbuffetSurvived:opponentIsWobb?survivingWobb:null,
      publicDonors:donorPrints,
      promptTypes:prompts};
  }
  const wrapped=patched?
    withCorrectedHnsDiscardAbilityCount(executeAttack):{
      result:executeAttack(),audit:null};
  const result=wrapped.result;
  return {mode,seat,patched,enginePin:pin,hookVersion:VERSION,
    nativeOriginalStoreAttackAction:true,artificialMidgame:true,
    competitiveQualifiedGames:0,...result,hookAudit:wrapped.audit};
}
function run(){
  const records=[];
  for(const mode of ['plain','wobbuffet','wobb-psychic',
    'silentlab','silent-stage','garbotoxin']){
    for(const seat of [0,1]){
      for(const patched of [false,true])records.push(
        runArm(mode,seat,patched));
    }
  }
  for(const seat of [0,1]){
    const find=(mode,patched)=>records.find(x=>
      x.mode===mode&&x.seat===seat&&x.patched===patched);
    assert.equal(find('plain',false).opponentActiveDamage,170);
    assert.equal(find('plain',true).opponentActiveDamage,170);
    assert.equal(find('silentlab',false).opponentActiveDamage,170);
    assert.equal(find('silentlab',true).opponentActiveDamage,30);
    assert.equal(find('silent-stage',true).opponentActiveDamage,170);
    assert.equal(find('garbotoxin',false).opponentActiveDamage,170);
    assert.equal(find('garbotoxin',true).opponentActiveDamage,30);
    assert.equal(find('wobbuffet',false).wobbuffetSurvived,false);
    assert.equal(find('wobbuffet',true).wobbuffetSurvived,true);
    assert.equal(find('wobbuffet',false).prizesTaken,1);
    assert.equal(find('wobbuffet',true).prizesTaken,0);
    assert.equal(find('wobb-psychic',false).wobbuffetSurvived,false);
    assert.equal(find('wobb-psychic',true).wobbuffetSurvived,false);
  }
  assert.ok(records.filter(x=>x.patched).every(x=>
    x.hookAudit.originalHelperRestored&&
    x.hookAudit.allPrototypesRestored));
  return {version:VERSION,enginePin:pin,records,
    allOriginalNativeCounterfactualsPassed:true,
    vendorFilesChanged:false,competitiveQualifiedGames:0};
}
module.exports={run,runArm};
if(require.main===module)process.stdout.write(
  JSON.stringify(run(),null,2)+'\n');

