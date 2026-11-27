'use strict';

/*
 * Aichi rank 14 original-source Regidrago family worker.
 * Deliberately shares rank32's donor, Apex, resource, and engine-setup
 * policy, but supersedes the printed differences in this source 60:
 * Sky Field, Squawkabilly ex, Oricorio-GX, Sudowoodo, Carmine,
 * Professor's Research. Not a game-competence or win-rate claim.
 */

const base = require('./agent3-rank32-regidrago-opponent-policy.cjs');

const POLICY_VERSION='agent3-rank14-regidrago-opponent-v1';
const SOURCE_RANK=14;
const SOURCE_LIST_BLOB_SHA1='ae773f6201d7aa69d31914dbfee66f3fba692200';
const ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const EXECUTABLE=new Set(['play-card','attack','retreat','use-ability','use-stadium','pass']);

function list(x){return Array.isArray(x)?x:[];}
function print(x) {
  if(typeof x==='string')return x;
  return x?.printing??x?.actorPrinting??x?.targetPrinting??
    x?.publicMetadata?.cardPrinting??x?.label??'';
}
function board(p){return[p?.active,...list(p?.bench)].filter(Boolean);}
function benchCapacity(p) {
  const bench=list(p?.bench);
  return bench.length>0 ? bench.filter(x=>x===null).length : Math.max(0,5-bench.filter(Boolean).length);
}
function turnOne(obs){
  return Number.isSafeInteger(obs?.globalTurn)&&obs.globalTurn>=1&&obs.globalTurn<=2;
}
function isDonor(x){
  return /^(?:Dialga-GX UPR 100|Hisuian Goodra VSTAR LOR 136|Mega Dragonite ex ASC 152|Noivern ex PAL 153|Kyurem SFA 47|Dragapult ex TWM 130)\b/i.test(print(x));
}
function discardCost(ownHand) {
  // Only burn entire hand while preserving enough attack Energy/resources.
  const hand=list(ownHand);
  const hasProtectedDde=hand.some(x=>/^Double Dragon Energy ROS 97\b/i.test(print(x)));
  const uncommittedApexPayload=hand.some(isDonor);
  return hasProtectedDde && !uncommittedApexPayload ? 70 : 0;
}
function rank14RootScore(item,request){
  const obs=request?.observation??{},own=obs.ownPublic??{},opp=obs.opponentPublic??{};
  const name=print(item),hand=list(obs.ownHand),cardCount=hand.length;
  const open=benchCapacity(own),priorKO=request?.publicEventReceipt?.priorOpponentTurnKO?.any===true;
  const opponentBench=board(opp).slice(1).length;
  if(item.kind==='play-card') {
    if(/^Sky Field ROS 89\b/i.test(name)){
      const supports=hand.filter(x=>/^(?:Dedenne-GX UNB 57|Squawkabilly ex PAL 169|Tapu Lele-GX GRI 60|Oricorio-GX CEC 95|Regidrago V SIT 135)\b/i.test(print(x))).length;
      // Only pay the Stadium slot to unlock a real occupancy constraint.
      return open===0&&supports>0?258:(open===1&&supports>=2?180:0);
    }
    if(/^Squawkabilly ex PAL 169\b/i.test(name)){
      const existing=board(own).some(x=>/^Squawkabilly ex PAL 169\b/i.test(print(x)));
      return turnOne(obs)&&open>0&&!existing&&cardCount<=4 ?
        225-discardCost(hand) : 0;
    }
    if(/^Oricorio-GX CEC 95\b/i.test(name)){
      const existing=board(own).some(x=>/^Oricorio-GX CEC 95\b/i.test(print(x)));
      return priorKO&&open>0&&!existing?200:0;
    }
    if(/^Sudowoodo GRI 66\b/i.test(name)){
      const existing=board(own).some(x=>/^Sudowoodo GRI 66\b/i.test(print(x)));
      return opponentBench>=4 && open>0 && !existing ? 145 : 0;
    }
    if(/^Professor's Research JTG 155\b/i.test(name)){
      // Discarding a singleton DDE hand without another payload can destroy
      // the copied-attacker route; make the risk explicit.
      return cardCount<=3 ? Math.max(0,180-discardCost(hand)) : 25;
    }
    if(/^Carmine TWM 145\b/i.test(name)){
      const already=obs.ownTurnResources?.supporterPlayedTurn;
      return turnOne(obs)&&cardCount<=3&&already!==obs.globalTurn ?
        Math.max(0,165-discardCost(hand)):0;
    }
  }
  if(item.kind==='use-ability') {
    const name=String(item?.publicMetadata?.abilityName??item?.label??'');
    if(/Squawk and Seize/i.test(name))
      return turnOne(obs)&&cardCount<=4?Math.max(0,260-discardCost(hand)):0;
    if(/Dance of Tribute/i.test(name)) return priorKO?200:0;
  }
  return null;
}
function bestAction(request) {
  const listActions=list(request?.actionFrontier?.items).filter(a=>EXECUTABLE.has(a.kind));
  if(!listActions.length)return {kind:'abstain',reasonCode:'NO_SUPPORTED_ROOT_ACTION'};
  const ranked=listActions.map((a,i)=>{
    const special=rank14RootScore(a,request);
    return {item:a,index:i,score:special===null?base.scoreAction(a,request):special};
  }).sort((a,b)=>b.score-a.score||a.index-b.index);
  if(ranked[0].score>0)return {kind:'select-action',token:ranked[0].item.token};
  const pass=listActions.find(a=>a.kind==='pass');
  return pass?{kind:'select-action',token:pass.token}:
    {kind:'abstain',reasonCode:'NO_SUPPORTED_ROOT_ACTION'};
}
function promptDecision(request) {
  const p=request?.prompt??{},meta=p.publicMetadata??{};
  const source=[p?.source?.effectName,p?.source?.sourcePrinting,
    p?.description].filter(Boolean).join(' ');
  if(/Squawk and Seize|Dance of Tribute/i.test(source) &&
     p.promptType==='ConfirmPrompt'&&meta.selectionType==='confirm') {
    const req=request??{},obs=req.observation??{};
    const turn=turnOne(obs),priorKO=req.publicEventReceipt?.priorOpponentTurnKO?.any===true;
    const enabled=/Squawk and Seize/i.test(source)?
      (turn&&list(obs.ownHand).length<=4&&discardCost(obs.ownHand)===0):priorKO;
    const choice=list(p.choices).find(c=>c.kind==='confirm'&&
      new RegExp(enabled?'^yes$':'^no$','i').test(c.label??''));
    return choice?{kind:'select-choice',token:choice.token}:
      {kind:'abstain',reasonCode:'UNRECOGNIZED_SIMPLE_PROMPT'};
  }
  return base.promptDecision(request);
}
function createPolicy({role,seat,policyVersion,config,rng}){
  if(role!=='opponent'||(seat!==0&&seat!==1)||
     policyVersion!==POLICY_VERSION||!config||
     typeof config!=='object'||Array.isArray(config)||
     Object.keys(config).length!==0||typeof rng!=='function')
    throw Error('AGENT3_RANK14_POLICY_INIT_MISMATCH');
  return Object.freeze({decide(request){
    if(!request||request.role!=='opponent'||request.seat!==seat||
       request.observation?.actorSeat!==seat)
      return {kind:'abstain',reasonCode:'ROLE_SEAT_BINDING_MISMATCH'};
    const decision=request.prompt!==null&&request.prompt!==undefined?
      promptDecision(request):bestAction(request);
    return base.protocolSafeDecision(decision,request);
  }});
}
module.exports={POLICY_VERSION,SOURCE_RANK,SOURCE_LIST_BLOB_SHA1,ENGINE_PIN,
  createPolicy,bestAction,promptDecision,rank14RootScore,discardCost,turnOne};
