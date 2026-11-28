# Rank 17: playable terminal CES48 Crush and Burn-GX root → physical DiscardEnergyPrompt

**Agent49, 27 November 2026.** `agent49/rank17-crushburn-root-prompt-20261127` review branch. No shared-main owner merge, no native Store game, CI, qualified Aichi matchup or 99.5% claim.

## Decision gap closed

The existing rank17 worker treated an offered `Crush and Burn-GX` attack as undesirable and had no typed decision for the pinned `DiscardEnergyPrompt`, so even a game-winning attack on a VSTAR could be unreachable from the actor root. An independent pinned Twinleaf correctness defect also named the attack `Crash and Burn-GX` and inflated damage to `30+50*n*n`, where n is the number of physically discarded Energy cards.

This branch contains the separate **opt-in, reversible, source-bounded** CES48 name/damage repair at `simulation/twinleaf/electrode-gx-crush-burn-paper-hook.cjs`. The correction must be installed after card-set load but before deck cloning and run in LIFO order with other CES48 hooks. Its detailed source, proof table and negative controls are in `results/methodology/2026-11/agent49-electrode-gx-crush-burn-native-paper-hook-20261127.md` on the sibling branch `agent49/rank17-crushburn-pinned-damage-fix-20261127`. Its 9-group regression was also copied into this integrated branch.

## Exact actor sequence

`r17CrushBurnTerminalWindow` in `simulation/evaluation/2026-11/agent50-rank17-raichu-electrode-opponent-policy.cjs` admits **only a game-terminal** attack from Active exact Electrode-GX CES48, and only when:

- `Crush and Burn-GX` is actually offered as a legal, energy-payable GX attack in the actor action frontier, and the public once-per-game GX-used marker is explicitly false;
- no Stadium, target Tool, unmodeled attack-protection/reduction, prohibited effect, or unknown target printing threatens the straightforward 30+50-per-discard damage equation;
- a visible target's post-Legacy-energy Prize value reaches all own remaining Prizes, or its KO leaves the opponent with no remaining Pokémon;
- the physical Energy attached to the actor's own Active and Bench Pokémon is fully visible and contains at least `n=max(1,ceil((remaining HP-30)/50))` physical cards. Special Energy is counted by **card occurrence**, not by the number of Lightning units it provides;
- the actor has a fully specified source state, and no empty Bench slot is misclassified as an unknown Energy source.

It selects the real root attack, then waits for the next **exact source-bound `DiscardEnergyPrompt`**. The shared prompt projector `simulation/evaluation/2026-11/agent36-prompt-projection.cjs` now maps each attached Energy's exact native `CardTarget`, physical `slot.cards[index]`, printed identity and source zone to a single actor-visible token. The contract `agent49-policy-protocol.cjs` allows the existing `energy-payment` multi-select only for `ChooseEnergyPrompt` or the new `DiscardEnergyPrompt`. The dispatch validator re-checks unique physical target/index occurrences, source ownership, occupied slot, and native `EnergyCard` type before applying the real pinned decoder; the worker chooses exactly n distinct tokens and never fabricates a card or an Energy unit.

The native engine's original prompt, card moves, damage resolution and GX-used marker remain the responsibility of the pinned engine plus opt-in CES48 formula hook. The worker does **not** claim nonterminal GX optimality or attempt to change shared main defaults.

## Executed constructed source-level result

Exact source compiled and executed in a V8 CommonJS shim, exercising the full rank17 opponent worker, protocol parser, shared prompt projector and dispatch validator with strict fake native prompt classes, both actor seats. `tests/2026-11/agent49-rank17-active-electrode-bomb-to-rain.test.cjs`: **20/20 groups, 5,196 assertion calls pass**, including all previous one-/two-Bomb Electro Rain sequences and Legacy Energy corrections. Four additional GX groups check:

1. Five physical Energy cards **(one Unit Energy LPM UPR plus four Reversal Energy PAL, respecting source-deck copy limits)** attached across Active Electrode and Benched Raichu; the Active Electrode carries Unit Energy LPM (Lightning) and a Reversal Energy (Colorless), so its GX attack can actually be paid while own two Prizes remain against opponent four. Opponent Active Regidrago VSTAR SIT has 260 remaining HP. The offered, paid, unused printed GX attack is selected, `DiscardEnergyPrompt` is source-projected with five physical tokens, all five are chosen uniquely. Correct paper damage is `30+5*50=280`, enough for a two-Prize win.
2. Four physical Energy cards **(one Unit Energy LPM UPR plus three Counter Energy CIN)** across the same board, Iron Thorns ex TWM with 230 HP. The Active Electrode's Unit LPM satisfies the Lightning attack cost, while Counter Energy satisfies Colorless; at this prize lead Counter cannot be assumed to provide Lightning. The four physical cards remain four discards, irrespective of provided Energy units. The selected native prompt discards four cards; correct paper damage is 230.
3. Negative actions reject a spent once-per-game GX marker, insufficient prize gain, unpaid root action, native typo name, and attached opposing Legacy Energy reducing final Prize award.
4. Negative native prompt source/shape/physical Energy count controls reject an untrusted copied name, blocked physical source and an inconsistent maximum.

The separate `tests/2026-11/agent49-electrode-gx-crush-burn-paper-hook.test.cjs` additionally passed **9/9 groups, 176 assertions** in source-level V8 execution, including n1..5 physical attacks, both seats, fail-closed upstream algebra checks and reversible CardManager template/clone restoration.

**Evidence boundary:** This is an exact-source **V8 unit/development receipt**, **not Node's native `node --test`, compiled pinned Twinleaf Store settlement, actual game or Aichi opponent simulation**. Its fake Store resolves the native-shaped prompt and card identity checks, but does not prove timing of the compiled pinned reducer, full AttackEffect damage settling, KO, Prize award or GX marker under native gameplay. The next decisive integration test is a real pinned Store run installing the hook, dealing exactly 130 damage for two discarded Energy or 180 for three, verifying physical moves and `player.usedGX`, and allowing this actor root→prompt continuation to complete under both seats. This review branch can be selectively transplanted onto Agent50's current owner family; do not merge wholesale over newer owner changes.

## Reason for priority

A broken source name makes an otherwise payable real attack unselectable. A quadratic multiplier can create spurious one-hit KOs and fundamentally contaminate matchup strength estimates. The new native prompt path provides an executable actor choice rather than merely correcting an engine method in isolation. It is intentionally narrow enough to validate against the pinned version and does not modify upstream Twinleaf.

The ninth hook test verifies **atomic rollback** if a malformed native CES48 CardManager template interrupts the opt-in name correction, leaving earlier cards and prototypes unchanged.
