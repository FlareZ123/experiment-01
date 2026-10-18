'use strict';

const path=require('node:path');
const {sourceGame}=require('./rank2-gh-root-score-probe.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const engine=name=>require(path.join(OUTPUT,name));
const PARTS=[
  ['hand','hand-score','HandScore'],
  ['opponent','opponent-score','OpponentScore'],
  ['player','player-score','PlayerScore'],
  ['conditions','special-conditions-score','SpecialConditionsScore'],
  ['active','active-score','ActiveScore'],
  ['bench','bench-score','BenchScore'],
  ['energy','energy-score','EnergyScore'],
  ['damage','damage-score','DamageScore'],
  ['tools','tools-score','ToolsScore']
];

/**
 * Read the existing scorer calls for the actual rank-2 root Supporter decision.
 * @template T
 * @param {()=>T} play
 * @param {number} [targetOrdinal]
 */
function observeGhScoreComponents(play,targetOrdinal=59) {
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {SimpleTactic}=engine('simple-bot/simple-tactics/simple-tactics');
  const {StateScore}=engine('simple-bot/state-score/state-score');
  const restore=[];
  const components=[];
  let ordinal=0,focus=false,candidate=null,frame=null;
  /** @param {object} proto @param {string} method @param {(old:Function)=>Function} replacement */
  function patch(proto,method,replacement) {
    const saved=Object.getOwnPropertyDescriptor(proto,method);
    if(typeof saved?.value!=='function')throw new Error('Missing method '+method);
    Object.defineProperty(proto,method,{...saved,value:replacement(saved.value)});
    restore.push(()=>Object.defineProperty(proto,method,saved));
  }
  try {
    patch(SimpleTacticsAi.prototype,'decodeNextAction',old=>
      function(state){
        const n=++ordinal,prior=focus;
        focus=n===targetOrdinal&&state.turn===5&&state.activePlayer===1;
        try{return old.call(this,state);}
        finally{focus=prior;}
      });
    patch(SimpleTactic.prototype,'evaluateAction',old=>
      function(state,id,action,passTurnScore){
        const prior=candidate;
        const hand=state.players[state.activePlayer].hand.cards;
        candidate=focus&&this.constructor.name==='PlaySupporterTactic'?
          hand[action.handIndex]?.fullName??null:null;
        try{return old.call(this,state,id,action,passTurnScore);}
        finally{candidate=prior;}
      });
    patch(StateScore.prototype,'getScore',old=>
      function(state,id){
        if(!candidate)return old.call(this,state,id);
        const previous=frame;
        const entry={candidate,values:{},stateTurn:state.turn};
        frame=entry;
        try{
          entry.total=old.call(this,state,id);
          components.push(entry);
          return entry.total;
        }finally{frame=previous;}
      });
    for(const [name,moduleName,className] of PARTS){
      const Component=engine('simple-bot/state-score/'+moduleName)[className];
      patch(Component.prototype,'getScore',old=>
        function(state,id){
          const value=old.call(this,state,id);
          if(frame)frame.values[name]=value;
          return value;
        });
    }
    return {result:play(),components,calls:ordinal};
  }finally{
    for(const undo of restore.reverse())undo();
  }
}

/** Compiled original-source rank-2 two-treatment component differential. */
function runRank2ComponentDifferential(){
  const resolved=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    });
  const ranks=new Map(resolved.decks.map(d=>[d.rank,d]));
  const [one,two]=[ranks.get(1),ranks.get(2)];
  if(!one?.playableUnderEngine||!two?.playableUnderEngine)
    throw new Error('Both published source 60s required');
  const play=mode=>sourceGame(mode,one.cardIds,two.cardIds);
  const arms=[false,true].map(mode=>{
    const baseline=play(mode);
    const inspected=observeGhScoreComponents(()=>play(mode));
    const game=inspected.result;
    const first=e=>e.decisionTrace.find(d=>d.actionOrdinal===68 &&
      d.turnBefore===5&&d.playerSlot===1);
    return {
      mode1:mode,sourceHashes:game.deckHashes,firstTurnSlot:game.firstTurnSlot,
      observerParity:JSON.stringify(baseline.decisionTrace)===
        JSON.stringify(game.decisionTrace),
      baselineRoot:first(baseline)?.card??null,
      observedRoot:first(game)?.card??null,
      scores:inspected.components,
      botCalls:inspected.calls
    };
  });
