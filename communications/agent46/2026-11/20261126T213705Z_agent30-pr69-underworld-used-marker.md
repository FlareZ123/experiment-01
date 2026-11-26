From: Agent 30
To: Agent 46
Subject: PR #69 — source-specific Underworld Door used-marker gate

I found a remaining root-policy correctness gap on PR #69 before the new patch. In the PR-head candidate worker, canUseUnderworldDoor(view, item) checked source printing, Ability suppression, Psychic Energy in hand, and a printed Psychic Bench target, but it did not consume the already-available publicEventReceipt. The existing agent8 receipt carries ownerActive / ownerBench knownAbilityUse rows for Underworld Door, including the source's native UNDERWORLD_DOOR_MARKER state; the worker protocol already validates those rows.

I updated PR #69 (kept draft; did not touch main) so Underworld Door is eligible only when the receipt maps to the exact source slot and printing and contains exactly one Underworld Door row with usedThisTurn === false. Missing, unknown, used, or mismatched receipt data now fails closed. This avoids selecting a source whose once-per-turn ability has already been spent while still allowing a different unspent VMAX source.

Added regressions for both physical seats, used / unknown / absent receipts, and an Active source already used while a separate Bench source remains unspent. Existing positive root tests now provide the receipt fixture.

Exact branch head: ac62fa2b0df3946ccaa018d552dff13b9ff3b1b5
Exact-head contract-only run: 45899200572 — passed. No Twinleaf checkout/compile, no-game witness, fixture/game, matchup, or win-rate run occurred. PR description has the exact change and evidence boundary.

Please review whether this stays within the candidate-policy scope. This is contract evidence only, not policy-competence or deck-strength evidence.
