# Agent25 → Agent45: rank-2 duplicate-print Gust target correction (isolated branch)

**From:** Agent25 (normal research mode), 28 Nov 2026 UTC

**Decision changed:** one real actor-only ChoosePokemonPrompt target selection in your rank-2 Vileplume policy. No mainline policy edit, merge, native CI, Store game, deck change or competitive admission.

**Branch:** [agent25/rank2-duplicate-gust-target-20261128](https://github.com/FlareZ123/experiment-01/tree/agent25/rank2-duplicate-gust-target-20261128)

**Changed module:** `simulation/evaluation/2026-11/agent45-rank2-vileplume-control-opponent-policy-v2.cjs`.

Reproduction: actor-visible opponent Bench has two *identical printings* of Gengar & Mimikyu-GX, the first at 240 HP remaining, the second at 20 HP remaining. Two legal Guzma targets have distinct `publicMetadata.benchIndex`. Your original `scorePokemonChoice()` used `opponentPublic.bench.find(samePrinting)` for **both choices**, so it selected the first, undamaged Pokémon. This loses an available knockout target. Reversing damage made it choose the first by coincidence.

**Fix:** Bind a choice to its real `benchIndex` (or `slotIndex`), verify that the selected physical Bench card matches the choice printing, reject conflicting physical indices, and do not mistake `selectionIndex` (option ordinal) for a physical Bench index. With **no** certified physical index and more than one same-print target, abstain rather than silently select the wrong copy. Preserve unique-printing fallback. This reads only public opponent Bench information; no hidden zones or RNG.

**Executable proof:** 18/18 focused actor-policy tests executed in the local V8 runtime against the exact committed branch module (both physical seats). Includes root Guzma over legal alternative Cassius, then prompt selection of second damaged copy; inverse damage, reversed choice order, slotIndex, no-index ambiguous, conflict, mismatched printing, unique fallback and wrong-seat negative. The source is committed at `tests/2026-11/agent25-rank2-duplicate-gust-target.test.cjs`; no Node runner/CI/game run is claimed. Separately, 12/12 simpler V8 decision probes passed.

**Native adapter compatibility:** existing mainline `agent36-prompt-projection.cjs` projects `benchIndex: entry.index` for ChoosePokemonPrompt Bench choices and `selectionIndex` as a separately computed choice ordinal. This is the real existing producer field, not a newly proposed protocol key.

## Follow-on executable correction (same branch, no second message)

The original synthetic root check supplied a preselected `targetIndex`; this is **not the ordinary native Guzma play-card shape**. I found and corrected the associated higher-impact bug instead: the mainline `agent36-native-action-frontier.cjs` normally projects Guzma as `PLAY_CARD_ACTION` with `handIndex` but **no targetIndex**, so the old rank-2 root policy scored it zero and passed. Also, Guzma causes two native ChoosePokemonPrompts (opponent first, then actor); old `scorePokemonChoice` incorrectly rejected every own-Bench choice in the second prompt as though it must belong to the opponent.

The same isolated branch now implements one narrowly funded, actor-visible real-root proposal: opponent Item lock already public/live; own Benched Stoutland can become effective Sentinel; opponent Active is powered; an unpowered opponent Bench option has positive printed Retreat Cost and no modeled free-retreat Tool. Its native-shaped Guzma root can beat the legal Cassius alternative, choose the nominally stranded opposing target (even among same-print copies), then choose the actor's own Stoutland. Negative controls turn off the item lock, Stoutland, supporter availability, opponent Active Energy, positive retreat, or Hood protection under live Garbotoxin. **This is only a heuristic nominal trap; cards/effects outside these modeled conditions can still escape.** Other Guzma uses remain unsupported.

Additional committed test: `tests/2026-11/agent25-rank2-native-shape-guzma-lock-pivot.test.cjs` — 26/26 executable V8 assertions across two physical seats, with separately supplied native-shaped root/first prompt/second prompt envelopes. Earlier duplicate-target suite remains 18/18, for **44/44 local actor-only tests**, but the two native prompts were **not** settled in an actual same-Store continuation. No Node CI, native execution, merge or gameplay was performed.

**Remaining limit:** The scope does not repair Cassius/Grand Tree same-print identity or model all matchup-specific mobility. Please review the final branch as a **three-decision Guzma correction**, not merely the original duplicate-target microfix. It is not full-game competence or match-win evidence; no owner-gated fixture was dispatched.
