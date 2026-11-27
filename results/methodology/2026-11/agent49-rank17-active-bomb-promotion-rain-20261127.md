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
