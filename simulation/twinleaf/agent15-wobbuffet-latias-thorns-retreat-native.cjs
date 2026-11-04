'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const VERSION='agent15-wobbuffet-latias-thorns-retreat-v1';
/** Actual staged native public Ability and RetreatAction, no natural setup.
 * @param {{seat:0|1,latias:boolean,thorns:boolean}} options
 */
function probe({seat,latias,thorns}){
  const load=n=>require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output',n));
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {CardList}=load('game/store/state/card-list');
  const {GamePhase}=load('game/store/state/state');
  const {Format}=load('game/store/card/card-types');
  const {RetreatAction}=load('game/store/actions/game-actions');
  const {CheckRetreatCostEffect,CheckPokemonPowersEffect}=
    load('game/store/effects/check-effects');
  const cards=initializeCards();let id=1;
  const get=name=>{const c=cards.getCardByName(name);
    assert.ok(c,'Missing '+name);c.id=id++;return c;};
  const store=new Store({onStateChange(){}});
  const state=store.state,ours=new Player(),theirs=new Player();
  ours.id=101;theirs.id=202;
  state.players=seat===0?[ours,theirs]:[theirs,ours];
  state.activePlayer=seat;state.turn=4;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  for(const p of state.players){
    p.prizes=Array.from({length:6},()=>{
      const z=new CardList();z.cards.push(get('Psychic Energy MEE'));return z;});
    for(let i=0;i<7;i++)p.deck.cards.push(get('Psychic Energy MEE'));
  }
  ours.active.cards.push(get('Wobbuffet PHF'));
  const attackSlot=new PokemonCardList();
  attackSlot.cards.push(get('Shadow Rider Calyrex V CRE'));
  const vmax=get('Shadow Rider Calyrex VMAX CRE');
  attackSlot.cards.push(vmax);ours.bench.push(attackSlot);
  const support=new PokemonCardList();
  support.cards.push(get(latias?'Latias ex SSP':'Pidgey MEW'));
  ours.bench.push(support);
  theirs.active.cards.push(get(thorns?'Iron Thorns ex TWM':'Duskull VIV'));
  const power=()=>{const e=new CheckPokemonPowersEffect(ours,vmax);
    store.reduceEffect(state,e);
    return e.powers.some(p=>p.name==='Underworld Door');};
  const before=power();
  const e=new CheckRetreatCostEffect(ours);store.reduceEffect(state,e);
  let error=null;
  try{store.dispatch(new RetreatAction(ours.id,0));}
  catch(err){error=String(err.message);}
  const active=ours.active.getPokemonCard()?.fullName;
  return {seat,latias,thorns,before,cost:e.cost.length,error,
    accepted:active==='Shadow Rider Calyrex VMAX CRE',
    active,after:power(),qualifiedGames:0};
}
function run(){
  const rows=[];
  for(const latias of [false,true])
    for(const thorns of [false,true])
      for(const seat of [0,1]){
        const r=probe({latias,thorns,seat});
        assert.equal(r.before,true);
        assert.equal(r.cost,latias?0:2,JSON.stringify(r));
        assert.equal(r.accepted,latias,JSON.stringify(r));
        assert.equal(r.after,!(latias&&thorns),JSON.stringify(r));
        rows.push(r);
      }
  return {version:VERSION,engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    cases:rows.length,qualifiedGames:0,rows};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={VERSION,probe,run};
