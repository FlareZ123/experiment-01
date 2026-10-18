'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file */
const load=file=>require(path.join(output,file));

/**
 * Real Store dispatch on a *staged* rank-15 dual-print Vileplume board.
 * Both Stage 2 evolution chains are injected as if established on prior
 * turns; no claim about their setup probability or opponent policy.
 *
 * @param {{itemLock:boolean,basicAttackLock:boolean,actor:'basic'|'dusclops'|'cologne'|'hood-then-basic'}} options
 */
function probe(options){
  const manager=initializeCards();
  let nextId=1;
  /** @param {string} name */
  const card=name=>{
    const found=manager.getCardByName(name);
    assert.ok(found,'Pinned card printing unavailable: '+name);
    found.id=nextId++;
    return found;
  };
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {GamePhase}=load('game/store/state/state');
  const {Format}=load('game/store/card/card-types');
  const {CardList}=load('game/store/state/card-list');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {AttackAction}=load('game/store/actions/game-actions');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');

  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=6;
  state.activePlayer=1;
  state.gameSettings.format=Format.EXPANDED;
  const owner=new Player(),candidate=new Player();
  owner.id=101;owner.name='Aichi rank15 source-print board';
  candidate.id=202;candidate.name='New Moon Lockbreaker proxy';
  state.players=[owner,candidate];

  if(options.basicAttackLock){
    owner.active.cards.push(
      card('Oddish UNB'),card('Gloom UNB'),card('Vileplume BUS'));
  }else{
    owner.active.cards.push(card('Oddish UNB'));
  }
  const ownerBench=new PokemonCardList();
  if(options.itemLock){
    ownerBench.cards.push(
      card('Oddish UNB'),card('Gloom UNB'),card('Vileplume AOR'));
  }else{
    ownerBench.cards.push(card('Pidgey MEW'));
  }
  owner.bench.push(ownerBench);

  if(options.actor==='dusclops'){
    candidate.active.cards.push(
      card('Duskull VIV'),card('Dusclops SFA'));
  }else{
    candidate.active.cards.push(card('Mewtwo & Mew-GX UNM'));
  }
  const energyCount=options.actor==='dusclops'?2:3;
  for(let i=0;i<energyCount;i++){
    const energy=card('Psychic Energy SVE');
    candidate.active.cards.push(energy);
    candidate.active.energies.cards.push(energy);
  }
  const candBench=new PokemonCardList();
  candBench.cards.push(card('Duskull VIV'));
  candidate.bench.push(candBench);
  for(const player of state.players){
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
    player.deck.cards.push(card('Psychic Energy SVE'),
      card('Psychic Energy SVE'));
  }

  const before=owner.active.damage;
  const attempted=options.actor==='cologne'?
    'Canceling Cologne':options.actor==='dusclops'?'Will-o-Wisp':
      options.actor==='hood-then-basic'?'Stealthy Hood then Miraculous Duo-GX':
        'Miraculous Duo-GX';
  let error=null;
  try{
    if(options.actor==='cologne'){
      const item=card('Canceling Cologne ASR');
      candidate.hand.cards.push(item);
      store.dispatch(new PlayCardAction(candidate.id,
        candidate.hand.cards.indexOf(item),{
          player:PlayerType.ANY,slot:SlotType.BOARD,index:0
        }));
    }else{
      if(options.actor==='hood-then-basic'){
        const hood=card('Stealthy Hood UNB');
        candidate.hand.cards.push(hood);
        store.dispatch(new PlayCardAction(candidate.id,
          candidate.hand.cards.indexOf(hood),{
            player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
          }));
        assert.equal(candidate.active.tools.includes(hood),true,
          'The Item lock should allow playing a Tool card');
      }
      store.dispatch(new AttackAction(candidate.id,
        options.actor==='dusclops'?'Will-o-Wisp':'Miraculous Duo-GX'));
      for(let i=0;i<10;i++){
        const pending=store.state.prompts.find(p=>p.result===undefined);
        if(!pending||pending.constructor.name!=='WaitPrompt')break;
        store.dispatch(new ResolvePromptAction(pending.id,null));
      }
    }
  }catch(e){error=e.message}
  const actual=store.state;
  const active=actual.players[0].active;
  const liveCandidate=actual.players[1];
  return {
    ...options,attempted,error,accepted:error===null,
    opponentActiveName:active.getPokemonCard()?.name??null,
    opponentActiveDamage:active.damage??null,
    damageBefore:before,
    cologneHandAfter:liveCandidate.hand.cards
      .filter(c=>c.name==='Canceling Cologne').length,
    attackerHoodAfter:liveCandidate.active.tools
      .some(c=>c.name==='Stealthy Hood'),
    unresolvedPrompts:actual.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    observationScope:'Staged midgame printed action, not dealt source and not opponent-policy evidence'
  };
}

function run(){
  const cases=[
    {itemLock:false,basicAttackLock:false,actor:'basic'},
    {itemLock:true,basicAttackLock:false,actor:'basic'},
    {itemLock:false,basicAttackLock:true,actor:'basic'},
    {itemLock:true,basicAttackLock:true,actor:'basic'},
    {itemLock:true,basicAttackLock:true,actor:'dusclops'},
    {itemLock:false,basicAttackLock:true,actor:'cologne'},
    {itemLock:true,basicAttackLock:true,actor:'cologne'},
    {itemLock:true,basicAttackLock:true,actor:'hood-then-basic'},
    {itemLock:false,basicAttackLock:true,actor:'hood-then-basic'}
  ];
  const rows=cases.map(probe);
  for(const row of rows){
    const expected=row.actor==='cologne'?
      !row.itemLock:row.actor==='dusclops'||
        row.actor==='hood-then-basic'?true:!row.basicAttackLock;
    assert.equal(row.accepted,expected,
      'Pinned engine disagrees with printed lock gate: '+JSON.stringify(row));
  }
  assert.ok(rows.filter(r=>r.actor==='hood-then-basic')
    .every(r=>r.attackerHoodAfter===true),
    'Hood counterline must attach to the attacker');
  const stage1=rows.find(r=>r.actor==='dusclops');
  assert.equal(stage1.opponentActiveDamage,50,
    'Stage1 Will-o-Wisp must deal 50 under both Vileplume locks');
  return {
    schema:'aichi-rank15-dual-vileplume-staged-store-v1',
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    rows,qualifiedForCompetitiveInference:false
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={probe,run};
