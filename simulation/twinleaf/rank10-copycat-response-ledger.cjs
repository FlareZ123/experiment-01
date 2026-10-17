'use strict';

/**
 * A deliberately small, public-only projection of response decisions after
 * a pinned source-root fork. Full source-prompt catalogs can expose hidden
 * hands, deck order or unrevealed Prize printings and must not be published
 * as opponent policy observations.
 *
 * @param {object[]} trace Ordered authentic root Store dispatch trace.
 * @param {{startOrdinal?:number,horizonTurns?:number,limit?:number}} [options]
 * @returns {object[]} Bounded public action and prompt decisions.
 */
function responseLedger(trace,options={}) {
  if (!Array.isArray(trace)) throw new TypeError('Source trace must be an array');
  const {startOrdinal=215,horizonTurns=5,limit=60}=options;
  const beginning=trace[startOrdinal]?.before?.turn;
  if (!Number.isInteger(beginning)) {
    throw new Error('Source-root fork ordinal lacks an observed turn');
  }
  const out=[];
  for(let index=startOrdinal;index<trace.length;index++){
    const event=trace[index];
    const turn=event.before?.turn;
    if(!Number.isInteger(turn)) continue;
    if(turn>beginning+horizonTurns || out.length>=limit) break;
    const kind=event.pendingPrompt?.kind;
    const isAction=['AttackAction','RetreatAction','PassTurnAction'].includes(event.action);
    const isPrompt=kind==='ChoosePokemonPrompt' ||
      kind==='ChooseAttackPrompt' || kind==='ChoosePrizePrompt';
    if(!isAction&&!isPrompt) continue;
    const selection=event.promptReplayAction?.selection;
    const report={
      ordinal:index,turn,
      activeSeat:event.before.activePlayer,
      action:event.action,
      attackingMove:event.action==='AttackAction'
        ? event.parameters?.name??null : null,
      promptKind:isPrompt?kind:null,
      promptPlayerId:isPrompt?event.pendingPrompt?.playerId??null:null,
      prizesBefore:event.before.prizesRemaining??null,
      prizesAfter:event.after?.prizesRemaining??null
    };
    if(kind==='ChooseAttackPrompt') {
      report.selectedSource=selection?.selection?.printing??null;
      report.selectedCopiedAttack=selection?.selection?.attackName??null;
    }
    if(kind==='ChoosePokemonPrompt') {
      report.promotions=(selection?.selections??[])
        .filter(x=>x.zone==='bench'||x.zone==='active')
        .map(x=>({playerId:x.playerId,zone:x.zone,
          position:x.index,publicCards:x.signature??[]}));
    }
    if(kind==='ChoosePrizePrompt') {
      report.prizeCountSelected=selection?.selections?.length??null;
    }
    out.push(report);
  }
  return out;
}
module.exports={responseLedger};
