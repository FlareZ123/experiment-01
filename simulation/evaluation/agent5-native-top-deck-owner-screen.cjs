'use strict';

const assert=require('node:assert/strict');
const {initializeCards}=require('../twinleaf/headless.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * Conservative text-to-reducer static risk screen, rather than a card rules
 * verdict. Look for an owner-top-deck discard described in native text while
 * the same native reducer includes direct opponent-deck-to-opponent-discard
 * movement. Manual copied-attack and full Store transaction tests remain
 * necessary to confirm a defect.
 *
 * @param {object[]} all
 * @returns {object}
 */
function screen(all){
  const owner=/(?:discard|put) the top \d+ cards? of your deck/i;
  const opponent=/(?:discard|put) the top \d+ cards? of your opponent['’]s deck/i;
  const opponentMove=/MOVE_CARDS[\s\S]{0,150}opponent\.deck[\s\S]{0,100}opponent\.discard/;
  const ownerMove=/MOVE_CARDS[\s\S]{0,150}player\.deck[\s\S]{0,100}player\.discard/;
  const rows=[],positive=[],inverse=[];
  for(const card of all){
    const chunks=[
      ...((card.attacks??[]).map(x=>({origin:'attack',name:x.name,text:x.text??''}))),
      ...((card.powers??[]).map(x=>({origin:'ability',name:x.name,text:x.text??''}))),
      ...(typeof card.text==='string'?[{origin:'trainer',name:card.name,text:card.text}]:[])
    ];
    const own=chunks.filter(x=>owner.test(x.text));
    const opp=chunks.filter(x=>opponent.test(x.text));
    if(own.length===0&&opp.length===0)continue;
    const reducer=String(card.reduceEffect);
    const base={name:card.name,fullName:card.fullName,
      set:card.set,number:String(card.setNumber),
      className:card.constructor.name,
      printedOwnerTopDiscard:own,
      printedOpponentTopDiscard:opp,
      reducerOpponentMove:opponentMove.test(reducer),
      reducerOwnerMove:ownerMove.test(reducer)};
    rows.push(base);
    if(own.length>0&&base.reducerOpponentMove)positive.push(base);
    if(opp.length>0&&base.reducerOwnerMove)inverse.push(base);
  }
  assert.ok(rows.length>0,'No native source text for top-deck discard found');
  assert.ok(positive.some(x=>x.fullName==='M Charizard EX FLF'),
    'Previously experimentally verified FLF69 regression disappeared');
  assert.ok(!positive.some(x=>x.fullName==='M Charizard-EX FLF 69'),
    'Correct duplicate top-deck effect should not be flagged by this screen');
  return {
    schema:'agent5-native-text-reducer-topdeck-owner-screen-v1',
    engineRevision:PIN,
    nativeInstances:all.length,topdeckTextInstances:rows.length,
    positiveTextVersusOpponentMovementFlags:positive.length,
    inverseTextVersusOwnMovementFlags:inverse.length,
    proofStatus:'static-risk-screen-only; FLF69 independently native-tested',
    competitiveQualifiedGames:0,
    flaggedOwnerTextOppositeReducer:positive,
    flaggedOpponentTextOwnerReducer:inverse,
    allTopdeckTextInstances:rows
  };
}

/** @returns {object} */
function run(){
  return screen(initializeCards().getAllCards());
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={screen,run};
