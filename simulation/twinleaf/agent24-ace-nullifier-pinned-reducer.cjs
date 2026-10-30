'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const native=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=p=>require(path.join(native,p));
const {Spiritomb}=load(
  'sets/06-black-and-white/set-legendary-treasures/spiritomb');
const {Genesect}=load(
  'sets/10-scarlet-and-violet/set-shrouded-fable/genesect');
const {Player}=load('game/store/state/player');
const {State}=load('game/store/state/state');
const {PlayItemEffect}=load('game/store/effects/play-card-effects');
const {SecretBox}=load(
  'sets/10-scarlet-and-violet/set-twilight-masquerade/secret-box');
const {CardTag}=load('game/store/card/card-types');
const VERSION='agent24-pinned-original-native-reducer-ace-ownership-v1';

function board(card){
  const state=new State();
  const owners=[new Player(),new Player()];
  owners.forEach((p,i)=>{p.id=i;});
  state.players=owners;
  owners[0].active.cards.push(card);
  return {state,owners};
}
/**
 * A controlled direct reduction by the ACTUAL compiled pinned Pokémon
 * card's reduceEffect, not a complete game / global Store dispatch.
 * A minimal Store PowerEffect probe accepts all such effects, so its
 * outcome isolates the tested ACE SPEC ownership and Tool predicate.
 */
function reduce(card,player,initial){
  const item=new SecretBox();
  assert.equal(item.hasTag(CardTag.ACE_SPEC),true);
  const effect=new PlayItemEffect(player,item);
  const store={reduceEffect:(state)=>state};
  try{
    const settled=card.reduceEffect(store,initial,effect);
    assert.strictEqual(settled,initial);
    return {attempted:true,blocked:false,message:null};
  }catch(error){
    assert.equal(error.name,'GameError');
    return {attempted:true,blocked:true,message:error.message,
      gameErrorCode:error.code??null};
  }
}
/**
 * Tests the owning player's and opponent's printed ACE from-hand effects.
 * @returns {object}
 */
function main(){
  const spirit=new Spiritomb(),spiritBoard=board(spirit);
  const spiritOwn=reduce(spirit,spiritBoard.owners[0],spiritBoard.state);
  const spiritOpp=reduce(spirit,spiritBoard.owners[1],spiritBoard.state);
  assert.equal(spiritOwn.blocked,false,
    'Pinned Spiritomb does not implement printed self ACE lock');
  assert.equal(spiritOpp.blocked,true);
  const gene=new Genesect(),geneBoard=board(gene);
  const geneNoTool=reduce(gene,geneBoard.owners[1],geneBoard.state);
  // A genuine attached native Tool can be placed into the active list
  // as an already-attached physical card for this isolated reducer test.
  const tool=load('sets/09-sword-and-shield/set-silver-tempest/forest-seal-stone');
  const ToolClass=tool.ForestSealStone;
  assert.equal(typeof ToolClass,'function');
  geneBoard.owners[0].active.tools.push(new ToolClass());
  const geneOpp=reduce(gene,geneBoard.owners[1],geneBoard.state);
  const geneOwn=reduce(gene,geneBoard.owners[0],geneBoard.state);
  assert.equal(geneNoTool.blocked,false);
  assert.equal(geneOpp.blocked,true);
  assert.equal(geneOwn.blocked,false);
  const nativeGenesectAbility=gene.powers.map(p=>p.name);
  const nativeGenesectAttack=gene.attacks.map(a=>a.name);
  assert.deepEqual(nativeGenesectAbility,['Ace Canceller']);
  assert.deepEqual(nativeGenesectAttack,['Magnet Blast']);
  return {schema:VERSION,enginePin:
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    testMechanism:'real compiled pinned card reduceEffect, mock Store PowerEffect',
    printedSpiritombSealingScreamBothPlayers:true,
    nativeSpiritombOwnAce:spiritOwn,
    nativeSpiritombOpponentAce:spiritOpp,
    spiritombPaperParity:false,
    printedGenesectAbility:'ACE Nullifier',
    printedGenesectAttack:'Magnetic Blast',
    nativeGenesectAbilities:nativeGenesectAbility,
    nativeGenesectAttacks:nativeGenesectAttack,
    nativeGenesectOpponentNoTool:geneNoTool,
    nativeGenesectOpponentWithTool:geneOpp,
    nativeGenesectOwnerWithTool:geneOwn,
    completeStoreDispatcherVerified:false,
    competitiveQualifiedGames:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={VERSION,board,reduce,main};
