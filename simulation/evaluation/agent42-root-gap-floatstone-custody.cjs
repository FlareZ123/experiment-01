'use strict';

const {isDeepStrictEqual} = require('node:util');

/**
 * Independently audit printed, native-accepted Float Stone -> Retreat ->
 * settled Max Geist lines. The intervening same-turn Underworld Door and
 * its prompt resolutions are permitted.
 *
 * @param {object} row One original source native Store attempt.
 * @param {number} sourceSeat The physical original-source player slot (0 or 1).
 * @returns {Array<object>} Strictly evidenced source tactical chains.
 */
function findSettledSourceFloatStoneLines(row, sourceSeat) {
  if (sourceSeat !== 0 && sourceSeat !== 1) {
    throw new TypeError('sourceSeat must be 0 or 1');
  }
  const roots = row.rootActionLedger ?? [];
  const events = row.nativeAcceptedTargetSidecar?.events ?? [];
  const attacks = row.sourceAttackSettlement?.attacks ?? [];
  const receipt = (root, action) => events.find(event =>
    event.rootActionOrdinal === root.actionOrdinal &&
    event.playerSlot === sourceSeat &&
    event.action === action && event.storeAccepted === true
  );
  const boardChange = (event, position) =>
    event?.publicBoardChanges?.find(change =>
      change.seat === sourceSeat && change.position === position
    );
  const lines = [];

  for (const tool of roots) {
    if (tool.playerSlot !== sourceSeat ||
        tool.action !== 'PlayCardAction' || tool.card !== 'Float Stone') continue;
    const toolReceipt = receipt(tool, 'PlayCardAction');
    if (toolReceipt?.declared?.ownerHandPrinting !== 'Float Stone BKT' ||
        toolReceipt.declared.target?.slot !== sourceSeat ||
        toolReceipt.declared.target?.index !== 0) continue;
    const toolActive = boardChange(toolReceipt, 'active');
    // A paper Tool cannot replace an occupied Tool slot. In addition,
    // the attachment itself cannot mutate Pokémon, Energy, or damage.
    if (toolActive?.after?.pokemon !== 'Shadow Rider Calyrex VMAX CRE' ||
        !Array.isArray(toolActive.before?.tools) ||
        toolActive.before.tools.length !== 0 ||
        !isDeepStrictEqual(toolActive.after?.tools, ['Float Stone BKT'])) continue;
    if (!isDeepStrictEqual({...toolActive.before, tools:[]},
                           {...toolActive.after, tools:[]})) continue;

    for (const retreat of roots) {
      if (retreat.actionOrdinal <= tool.actionOrdinal ||
          retreat.playerSlot !== sourceSeat ||
          retreat.turnBefore !== tool.turnBefore ||
          retreat.action !== 'RetreatAction') continue;
      const retreatReceipt = receipt(retreat, 'RetreatAction');
      const oldActive = boardChange(retreatReceipt, 'active');
      const movedToBench = boardChange(retreatReceipt, 'bench');
      if (retreatReceipt?.declared?.benchIndex !== movedToBench?.index ||
          !isDeepStrictEqual(oldActive?.before, toolActive.after) ||
          !isDeepStrictEqual(movedToBench?.after, oldActive?.before) ||
          !isDeepStrictEqual(oldActive?.after, movedToBench?.before) ||
          oldActive?.after?.pokemon !== 'Shadow Rider Calyrex VMAX CRE' ||
          (oldActive.after.energies?.length ?? 0) < 3) continue;

      const attack = roots.find(root =>
        root.actionOrdinal > retreat.actionOrdinal &&
        root.playerSlot === sourceSeat &&
        root.turnBefore === tool.turnBefore &&
        root.action === 'AttackAction' && root.attack === 'Max Geist'
      );
      const settled = attacks.find(packet =>
        packet.actionOrdinal === attack?.actionOrdinal &&
        packet.attackName === 'Max Geist' &&
        packet.settledPromptChain === true &&
        packet.settlementCrossesClockReset === false
      );
      if (!settled ||
          !Number.isSafeInteger(settled.completionRootOrdinal) ||
          settled.completionRootOrdinal < attack.actionOrdinal ||
          !Number.isSafeInteger(settled.prizesBefore?.[sourceSeat]) ||
          !Number.isSafeInteger(settled.prizesAfter?.[sourceSeat]) ||
          settled.prizesBefore[sourceSeat] < settled.prizesAfter[sourceSeat])
        continue;
      // The legal owner turn cannot contain a foreign nonprompt action or
      // jump across turns. Opponent-side prompt resolutions are permitted.
      const interveningRoots = roots.filter(root =>
        root.actionOrdinal > tool.actionOrdinal &&
        root.actionOrdinal < attack.actionOrdinal);
      if (interveningRoots.some(root =>
        root.turnBefore !== tool.turnBefore ||
        (root.playerSlot !== sourceSeat &&
         root.action !== 'ResolvePromptAction'))) continue;
      // An intermediate Active mutation can break physical custody even if
      // a later event returns to a byte-identical board snapshot.
      const changedActiveBeforeRetreat = events.some(event =>
        event.storeAccepted === true &&
        event.rootActionOrdinal > tool.actionOrdinal &&
        event.rootActionOrdinal < retreat.actionOrdinal &&
        event.publicBoardChanges?.some(change =>
          change.seat === sourceSeat && change.position === 'active' &&
          !isDeepStrictEqual(change.before, change.after)
        )
      );
      // Fail closed if another accepted action changed the source Active
      // between Retreat and attack. Intervening Bench Abilities remain valid.
      const changedActive = events.some(event =>
        event.storeAccepted === true &&
        event.rootActionOrdinal > retreat.actionOrdinal &&
        event.rootActionOrdinal < attack.actionOrdinal &&
        event.publicBoardChanges?.some(change =>
          change.seat === sourceSeat && change.position === 'active' &&
          !isDeepStrictEqual(change.before, change.after)
        )
      );
      if (changedActive || changedActiveBeforeRetreat) continue;
      const completion = roots.find(root =>
        root.actionOrdinal === settled.completionRootOrdinal);
      if (!Number.isSafeInteger(completion?.turnBefore) ||
          completion.turnBefore < tool.turnBefore ||
          completion.turnBefore > tool.turnBefore + 1) continue;
      const attacker = settled.publicBoardBefore?.[sourceSeat]?.active;
      if (attacker?.name !== 'Shadow Rider Calyrex VMAX' ||
          (attacker.energyCards?.length ?? 0) < 3) continue;

      // A later opponent action is not evidence of immediate continuation
      // if the source has already taken a subsequent substantive turn.
      const firstNextDecision = roots.find(root =>
        root.actionOrdinal > settled.completionRootOrdinal &&
        root.action !== 'ResolvePromptAction'
      );
      const opponentFirstNonPrompt =
        firstNextDecision?.playerSlot === 1 - sourceSeat &&
        firstNextDecision.turnBefore === tool.turnBefore + 1 ?
          firstNextDecision : null;
      lines.push({
        sourceSeat,
        toolOrdinal: tool.actionOrdinal,
        retreatOrdinal: retreat.actionOrdinal,
        attackOrdinal: attack.actionOrdinal,
        globalTurn: tool.turnBefore,
        interveningActionOrdinals: roots.filter(root =>
          root.actionOrdinal > retreat.actionOrdinal &&
          root.actionOrdinal < attack.actionOrdinal
        ).map(root => root.actionOrdinal),
        prizeGain: (settled.prizesBefore?.[sourceSeat] ?? 0) -
          (settled.prizesAfter?.[sourceSeat] ?? 0),
        settledCompletionRootOrdinal: settled.completionRootOrdinal,
        opponentFirstNonPrompt
      });
      break;
    }
  }
  return lines;
}

module.exports = {findSettledSourceFloatStoneLines};
