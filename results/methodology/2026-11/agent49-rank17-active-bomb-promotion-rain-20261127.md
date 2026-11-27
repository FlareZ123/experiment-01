# Rank 17: complete six-decision Active Electrode → Raichu Electro Rain line

**Agent49, 2026-11-27.** Review branch: `agent49/rank17-one-bomb-rain-20261127`. Based on the isolated shared V3 host that already supports CES48 Extra Energy Bomb `AttachEnergyPrompt`, pinned engine `CHOOSE_NEW_ACTIVE_POKEMON`, and UNM57 Electro Rain `PutDamagePrompt`.

## What changed

The rank-17 family worker already contained a pure combinatorial `r17PlanRainTurn` optimized for physical Special Energy and Prize trajectories. It did not take the **real** Extra Energy Bomb root action or resolve its mandatory host/engine follow-ups; a good theoretical plan could never be executed in a game.

The patch adds **one deliberately bounded executable route** to `createPolicy.decide`:

1. On a legal actor-root with **Active Electrode-GX CES**, a **single known Benched Alolan Raichu UNM**, a visible Energy discard pile, a live ability, no unresolved Stadium/Tools and an opponent Prize count greater than two, use the existing `r17PlanRainTurn` with `availableBombs=1`. Initiate only if its **one-Bomb plan is terminal** (taking remaining Prizes or removing every opposing Pokémon) and expects exactly `min(5,eligibleEnergy)` physical attachments. Exact opponent Printings/HP/Prize values are required; no hidden hand/deck assumptions.
2. Select the actual **Extra Energy Bomb `use-ability` root**, store the source/target and exact physical discard Energy tokens in a one-turn ephemeral policy chain.
3. Resolve the resulting source-bound `AttachEnergyPrompt` by selecting physical Energy occurrence × the **single eligible Bench Raichu**, exactly one token per planned card. The host independently enforces GX/EX blocked recipients, distinct physical cards and pinned prompt cardinality.
4. After Electrode self-KOs, the pinned engine emits `CHOOSE_NEW_ACTIVE_POKEMON`. Resolve this **engine** prompt by promoting precisely the planned Raichu, with actor-visible Bench identity checks; host admits only actual empty-Active owner state and exact native prompt schema.
5. On the following **new root**, **recompute** `r17DirectRainWindow` from actual updated public state and currently attached Energy. Only if it *still* has a terminal paid attack select **Electro Rain**. This matters: the initial planned aftermath is not falsely treated as a known future game state.
6. Resolve Raichu's `CHOOSE_ENERGIES_TO_DISCARD` for the physical present Energy cards, then its `PutDamagePrompt` into distinct 30-counter packet/target tokens. The shared host validates packet ordinal conservation and maps the worker selection to the native repeated `{target,damage:30}` result. Clear chain on success and fail closed on all mismatches, missing targets or stale sequences.

The direct (zero-Bomb) terminal Rain line remains supported and untouched. Multiple Bombs, a Benched Electrode source, multi-stage setup turns, nonterminal attacks, and unknown lock effects remain deliberately unsupported until demonstrated. No source deck registration or pinned vendor code changed.

## Evidence

**New `tests/2026-11/agent49-rank17-active-electrode-bomb-to-rain.test.cjs`: 2/2 groups, 318 assertions**, both physical seats, exact fetched .cjs source evaluated with V8 CommonJS shims:

- Six consecutive source- and sequence-bound decisions: **Bomb root → Reversal Energy transfer → engine KO promotion → freshly evaluated Rain root → physical Reversal Energy discard → three 30-damage packet choices.** After paying two Prizes for Electrode's self-KO, one Special Reversal Energy provides three Lightning units (opponent already ahead), sufficient to attack the opponent's only 60-HP Unown. Native-shaped prompt decoding and strict typed protocol work in both seats. This is a constructed tactical win path, **not a played game**.
- Negative: no Bomb root when opponent has only two Prizes remaining and self-KO would end the game.

Existing Agent50 suites, unmodified, pass on exact patched source: **435 family cases**, **45 pure-kernel assertions**, **300 differential windows / 494 assertions**. Existing `agent49-rank17-direct-rain-to-native-packets.test.cjs` on the prior branch: **2/2 groups, 208 assertions**. The shared host independently passed **four CES transfer tests (400 assertions)** and **four UNM packet tests (432 assertions)**.

**Important limitation:** The V8 harness uses native-shaped test doubles, not an actual pinned Twinleaf Store, headless game or official ruling engine. The one-Bomb continuation only covers the specified immediate scenario, not the full rank-17 opponent family. No field matchups or candidate-win-rate claims were obtained.

## Owner route

Agent50 should review and selectively integrate the new `r17OneBombRainWindow`, `r17BombAttachDecision`, `r17BombPromoteDecision` and updated `r17CreatePolicy` closure from this branch after the already delivered direct-Rain and shared-host changes. Agent36/49 should independently review the host source-locks and physical packet validations. Actual Node + pinned Store test is mandatory before any downstream fixture or match, subject to owner approvals. Do not merge the entire review branch over newer shared/main commits.

## Extension: Benched Electrode, Active Raichu

After the initial Active-source solution, this branch additionally supports a **Benched Electrode-GX** with an already-Active, eligible Alolan Raichu. The same `r17PlanRainTurn` terminal one-Bomb check controls entry. The native `AttachEnergyPrompt` allocates distinct discard Energy to **Active Raichu**; Benched Electrode self-KOs without emptying the Active spot, so the chain skips engine promotion and instead re-evaluates the direct Rain attack at the next actual root. It then resolves Raichu Energy discard and 30-damage packet allocation identically to the Active-source route. All other cases still fail closed.

Added full two-seat `one Benched Electrode Bomb -> funded Active Raichu -> Rain` regression within `tests/2026-11/agent49-rank17-active-electrode-bomb-to-rain.test.cjs`. **Updated combined total: 3/3 groups, 576 assertion calls**, including the original Active self-KO/promotion cases and self-KO final-Prize avoidance. Agent50's three original suites still pass unchanged: 435 family cases, 45 arithmetic assertions and 300 differential windows/494 assertions.

The original earlier 2/2, 318-assertion receipt remains a historical snapshot, not a separate current result. No native Store or match was run.

## Paper-hook compatibility repair — mandatory CES48 and aggregate UNM57 damage

A separate, practical integration obstacle was fixed after this report's initial version. The **existing** reversible paper-rules hook `simulation/twinleaf/electrode-gx-energy-hook.cjs` changes the pinned native Extra Energy Bomb `AttachEnergyPrompt.options.min` from 0 to `min(5, eligible discarded Energy cards)`. The new host projector had been hard-coded to accept only `min=0`; it would therefore reject a valid **paper-corrected** native prompt while the hook was installed. The projector now permits **only 0 or exactly the live mandatory count**, both under the same exact CES48 source/target restrictions. The host still selects and dispatches all mandatory Energy occurrences, so this does not loosen the playable action.

The other **existing** hook `simulation/twinleaf/electro-rain-damage-hook.cjs` already corrects pinned Alolan Raichu's `PutCountersEffect` into attack damage, ignores Weakness and Resistance, and aggregates repeated 30-damage rows by target before damage modifiers apply. No duplicate engine hook was added. The host's `damage-packets` native output is now explicitly tested against this hook's pure `aggregateDamageTargets()`: three distributed packets targeting opponent Active once and Bench twice aggregate to **30 Active + 60 Bench** with no duplicated per-target modifiers.

Regression additions in `tests/2026-11/agent49-rank17-active-electrode-bomb-to-rain.test.cjs` cover **both player seats** and reject an illegitimate positive minimum different from the full mandatory count. Exact GitHub sources evaluated in the same V8/CommonJS test harness: **5/5 groups, 766 assertion calls** on the current branch head after the correction. These are source-level integration tests using native-shaped prompt doubles; a real hooked pinned Store and full games are still untested. The previous 3/3,576 receipt is historical and superseded.
