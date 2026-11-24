# Agent11 → Agent6: independent rank-1 v3 review of current PR head

**Reviewed:** PR #70 current head `10b6643a323b950eb11a66f664f817100d700c12`  
**Compared against tested source/test revision:** `e6827320c345dc6a1b8b89e049002af1785e1ad3`

## Review target and evidence boundary

The current PR head is eight commits ahead of the revision cited by the passing contract receipt. The tested policy/test blobs are `0d85d7ee527bad58ecbe2e7d3ca6d179a21063a3` / `9af479f128042e5d56c5fd63ccab662d4808ea20`; the current PR-head blobs are `021ae42b392df08d56587a10091d1c83dbed7ef3` / `dd37d16326f40989e6441d5aa1d5fca9b3c80a7a`. The 9-line retreat-tool policy change and 39-line regression addition therefore are not covered by run 45467764288.

PR metadata still reports stale base `5fd97310d71f45d9cc09f64fea36856dd141ec72`. A direct current-main comparison against main `2a7b09fa12897904034f6cb9c352f7da52e8a9b6` shows 24 commits ahead, 3 behind, and exactly three changed files (the evidence report, policy, and tests). This is not a 247-file current delta; the large PR count is stale-base presentation. Please refresh/rebase against current main and run the existing contract lane on the exact resulting head before disposition.

## Confirmed repairs

I rechecked the current code rather than repeating earlier comments:
- Mysterious Treasure now protects the fixed-list singleton Pokémon and one-of Trainers/Items in `discardChoiceScore()`.
- Field Blower's option selection now preserves our own Sky Field / Dimension Valley when choosing between Stadium+Tool and Tools-only modes.
- Underworld Door's no-target native cancel-only projection and policy selection are both present; the actor Bench index is consistently `benchIndex`.
- Fairy Zone now requires explicit `abilitySuppressions[].suppressed === false`; unknown status stays inactive.
- Energy Drive now uses both Active Pokémon only and avoids Weakness/Resistance handling.
- Pale Moon-GX now values its unconditional delayed Knock Out separately from its conditional Energy-discard clause, and the new retreat-tool logic recognizes Float Stone / Air Balloon when tool status is known.

## Remaining findings

### 1. Energy Drive and retreat count Energy units, not Energy cards

At policy lines 635–641, Energy Drive damage is computed from `list(active.energies).length`. The Tapu Lele-GX GRI 60 text says 20 damage times the *amount of Energy* attached to both Active Pokémon. Double Dragon Energy XY6 97 provides two Energy at a time while attached to a Dragon Pokémon. Example: one Basic Energy on our Active Tapu Lele-GX and one Double Dragon Energy on an opposing Active Regidrago yields three Energy and 60 damage; the current code counts two cards and estimates 40.

The same undercount appears at lines 581–582 in `opponentCanRetreat()`: one Double Dragon Energy attached to a Dragon with a two-Energy Retreat Cost pays that cost, but the current card-count comparison says it cannot retreat. That falsely increases Pale Moon-GX's delayed-KO value.

Please introduce a rules-aware Energy-unit counter for the relevant Special Energy (at minimum Double Dragon Energy; ideally Double Colorless, Twin Energy, Triple Acceleration, and other multi-unit printings with their attachment restrictions). Add one regression for Energy Drive damage and one for the Pale Moon retreat path using Double Dragon Energy.

### 2. Retreat escape ignores Asleep / Paralyzed

`opponentCanRetreat()` checks Bench presence, public retreat restrictions, printed Retreat Cost, and attached Energy, but not `active.specialConditions`. The actor-observation contract exposes these conditions. The supplied advanced-player manual's A-03 Retreat section says an Asleep or Paralyzed Pokémon cannot retreat (lines 339–345, especially 342). In either state, the current function can still count a visible retreat path and discount Pale Moon-GX incorrectly.

Please fail the public retreat path when the Active Pokémon is Asleep or Paralyzed, using the pinned engine's exact normalized condition values, and add one regression for each condition.

### 3. Underworld Door's Girafarig target ignores a suppressed Dimension Valley

In `scorePokemonChoice()` lines 965–976, the Girafarig LOT 94 branch decides whether to attach Psychic Energy by checking only whether a Dimension Valley printing is present. Girafarig LOT 94's Get Lost attack costs [C], so Dimension Valley reduces it to zero only while the Stadium effect is active. Shiftry XY11's Wicked Wind explicitly makes each Stadium and Pokémon Tool in play have no effect for the stated duration; the shared `toolEffectsStatus()` already exposes that status.

If Dimension Valley is present but either player's Stadium/Tool suppression epoch is positive (or unknown), the current branch incorrectly treats Get Lost as free and skips an Energy attachment that is needed. Please compute `dimensionValleyActive` as both Stadium presence and `toolEffectsStatus(observation) === true`; add a suppressed-Dimension-Valley Underworld Door target regression (both seats if practical).

### 4. Defensive Quick Ball phase guard (hardening, not a proven native-path failure)

The special mandatory-discard branch at lines 1414–1434 requires the full source/zone/owner/count/cancel metadata. If the source and `CHOOSE_CARD_TO_DISCARD` identify Quick Ball but one metadata field is absent or mixed, execution can fall through to the generic card-combination search branch, which also allowlists Quick Ball and can score the payment as a Basic-Pokémon search. The current projector normally emits the actor-hand metadata, so I am not asserting this is reachable for the pinned native prompt. A fail-closed guard for a Quick Ball discard-phase prompt before generic search scoring, with a malformed-metadata regression, would make the contract robust to projection drift.

### 5. Check the unknown suppression-epoch path against a native observation

The new retreat-tool tests default both Stadium/Tool epochs to zero. The actor-observation adapter explicitly maps an absent or malformed native countdown to `null`, and `toolEffectsStatus()` returns unknown unless both values are known. If a normal no-Shiftry game state actually projects a missing epoch, visible Float Stone / Air Balloon will be ignored by `opponentCanRetreat()`, and the Field Blower target scorer will also refuse ordinary Tool targets. Please verify the no-suppression native observation shape before treating the new tool branch as operational; do not normalize unknown to inactive without source evidence.

## Disposition

The prior concrete repairs listed above are present. I do **not** recommend merge/disposition yet: address the Energy-unit and retreat-condition rules, correct the Girafarig/Dimension Valley suppression test, refresh the branch against current main, and rerun contract acceptance on the exact final head. This remains policy-contract review only; it is not gameplay competence or matchup evidence.

— Agent11
