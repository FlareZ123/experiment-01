'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {PIN,VERSION,enrichNativePublicPokemonTags}=require(
 '../../simulation/evaluation/2026-11/agent2-native-public-pokemon-tag-projection.cjs');
const {publicPrizeValue}=require(
 '../../simulation/evaluation/2026-11/agent2-rank27-regidrago-opponent-policy.cjs');
function card(fullName,tags){
 // Faithful pinned PokemonCard shape: public tags, no subtypes property.
 return {fullName,tags,stage:2,cardType:['COLORLESS'],
   powers:[],attacks:[],hp:300};
}
const slot=mon=>({getPokemonCard:()=>mon??null});
const view=mon=>mon?({printing:mon.fullName,hp:mon.hp,damage:0,
 printed:{types:['Colorless'],subtypes:[]},abilities:[]}):null;
const frozen=x=>{if(x&&typeof x==='object'){
 Object.values(x).forEach(frozen);Object.freeze(x);
 }return x};
function scenario(actorSeat){
 const me=card('Regidrago VSTAR SIT',['VSTAR']);
 const mega=card('Mega Kangaskhan ex MEG',['Mega ex','ex']);
 const tag=card('Trevenant & Dusknoir-GX SMP',['Tag Team','GX']);
 const vmax=card('Mew VMAX FST',['VMAX']);
 const free=card('Budew ASC',[]);
 const impossible=()=>{throw Error('ACCESS TO PRIVATE HIDDEN CARDS')};
 const pMe={
  active:slot(me),bench:[slot(free),slot(null)],
  get hand(){impossible()},get deck(){impossible()},get prizes(){impossible()}
 };
 const pOpp={
  active:slot(vmax),bench:[slot(mega),slot(tag)],
  get hand(){impossible()},get deck(){impossible()},get prizes(){impossible()}
 };
 const observation=frozen({actorSeat,
  ownHand:['exact owner hand visibility already handled elsewhere'],
  ownPublic:{active:view(me),bench:[view(free),null],prizeCount:3},
  opponentPublic:{active:view(vmax),bench:[view(mega),view(tag)],prizeCount:6}});
 const state={phase:3,players:actorSeat===0?[pMe,pOpp]:[pOpp,pMe]};
 return {observation,state,actorSeat};
}
test('matches pinned card class API: tags not subtypes; exact engine pinned',()=>{
 assert.equal(PIN,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
 assert.equal(VERSION,'agent2-native-board-tags-projection-v1');
 const pokemon=card('Mega Kangaskhan ex MEG',['Mega ex','ex']);
 assert.equal('subtypes' in pokemon,false);
 assert.deepEqual(pokemon.tags,['Mega ex','ex']);
});
test('actor-visible active and Bench public Card.tags restored both seats',()=>{
 for(const seat of [0,1]){
  const v=scenario(seat),before=v.observation;
  assert.deepEqual(before.opponentPublic.bench[0].printed.subtypes,[]);
  assert.equal(publicPrizeValue(before.opponentPublic.bench[0]),3);
  const out=enrichNativePublicPokemonTags({...v,enginePin:PIN});
  assert.notEqual(out,before);
  assert.deepEqual(out.ownPublic.active.printed.subtypes,['VSTAR']);
  assert.deepEqual(out.ownPublic.bench[0].printed.subtypes,[]);
  assert.equal(out.ownPublic.bench[1],null);
  assert.deepEqual(out.opponentPublic.active.printed.subtypes,['VMAX']);
  assert.deepEqual(out.opponentPublic.bench[0].printed.subtypes,['MEGA','ex']);
  assert.deepEqual(out.opponentPublic.bench[1].printed.subtypes,['TAG TEAM','GX']);
  assert.equal(publicPrizeValue(out.opponentPublic.bench[0]),3);
  assert.equal(publicPrizeValue(out.opponentPublic.bench[1]),3);
  assert.equal(publicPrizeValue(out.opponentPublic.active),3);
  assert.equal(out.ownHand[0],before.ownHand[0]);
  assert.equal(out.ownPublic.prizeCount,before.ownPublic.prizeCount);
  assert.equal(Object.isFrozen(out),true);
  assert.equal(Object.isFrozen(out.opponentPublic.bench),true);
  assert.deepEqual(before.opponentPublic.bench[0].printed.subtypes,[]);
 }
});
test('native runtime tags are not mistaken for printed permanent card tags',()=>{
 for(const seat of [0,1]){
  const v=scenario(seat),cardObj=v.state.players[seat].bench[0].getPokemonCard();
  cardObj.tags=['Radiant','V']; // test only the public printed tags getter
  const out=enrichNativePublicPokemonTags({...v,enginePin:PIN});
  assert.deepEqual(out.ownPublic.bench[0].printed.subtypes,['Radiant','V']);
 }
});
test('existing explicit subtype view preserved without duplicates',()=>{
 for(const seat of [0,1]){
  const v=scenario(seat);
  const visible=v.observation.opponentPublic.bench[0];
  const altered=frozen({...v.observation,
   opponentPublic:{...v.observation.opponentPublic,
    bench:[{...visible,printed:{...visible.printed,subtypes:['MEGA','Basic']}},v.observation.opponentPublic.bench[1]]}});
  const out=enrichNativePublicPokemonTags({...v,observation:altered,enginePin:PIN});
  assert.deepEqual(out.opponentPublic.bench[0].printed.subtypes,['MEGA','Basic','ex']);
 }
});
test('reject wrong engine pin, mismatched printed identity, mismatched occupancy',()=>{
 for(const seat of [0,1]){
  const v=scenario(seat);
  assert.throws(()=>enrichNativePublicPokemonTags({...v,enginePin:'other'}),
    x=>x.code==='NATIVE_PUBLIC_TAG_PIN');
  const native=v.state.players[seat].active.getPokemonCard();
  native.fullName='Unknown Pokémon UNKNOWN';
  assert.throws(()=>enrichNativePublicPokemonTags({...v,enginePin:PIN}),
    x=>x.code==='NATIVE_PUBLIC_TAG_IDENTITY_MISMATCH');
  native.fullName='Regidrago VSTAR SIT';
  const other={...v.observation,ownPublic:{...v.observation.ownPublic,bench:[]}};
  assert.throws(()=>enrichNativePublicPokemonTags({...v,observation:other,enginePin:PIN}),
    x=>x.code==='NATIVE_PUBLIC_TAG_BOARD_MISMATCH');
 }
});
test('reject hidden setup and mismatched actor seat before reading board',()=>{
 for(const seat of [0,1]){
  const v=scenario(seat);
  assert.throws(()=>enrichNativePublicPokemonTags({
   ...v,actorSeat:1-seat,enginePin:PIN
  }),x=>x.code==='NATIVE_PUBLIC_TAG_CONTEXT');
  v.state.phase=1;
  assert.throws(()=>enrichNativePublicPokemonTags({...v,enginePin:PIN}),
    x=>x.code==='NATIVE_PUBLIC_TAG_CONTEXT');
 }
});
