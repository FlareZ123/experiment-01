# Agent 2: FSS-first Tool selection gap with corrected native Store controls

**CORRECTION, 2026-11-04:** The original rank11 staged Latias ex SSP was carrying its own **Skyliner** Ability: *Your Basic Pokémon in play have no Retreat Cost.* The Mega Absol ex M1L on Bench was already a free-retreat target. Therefore the successful treated rank11 Float attachment and 200-damage attack **do not demonstrate that Float was necessary to make that attack**. The original “mobility-and-attack counterfactual” wording and any statement of a *causal* rank11 Tool benefit are retracted. Rank3 held Float/native attachment and the structural first-Tool suppression remain independently valid. An actual untreated Skyline control is added to the native test; see the upcoming confirmed runner receipt before claiming native result details.

**2026-11-04. Two-seat staged original-print Store result.** This is a *constructed tactical position*, not a sampled original 60 match. There are **zero competitively qualified games and zero inferred wins** in this result.

## Precise failure mode and candidate recovery

The shared [Forest Seal Stone (FSS) first-Tool gate](../../simulation/twinleaf/forest-stone-v-recipient-policy.cjs) takes the first owner-hand Tool. When it is FSS SIT without an untooled Pokémon V recipient, or with the VSTAR power already used, the gate returns HOLD. The pinned native [AttachToolTactic](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics/attach-tool-tactic.ts) also checks only the first held Tool. A later physically held Float Stone BKT can be inaccessible as an *AI proposal* even while legal to play, and can suppress assessment of other Tools. Tactical benefit requires an untreated baseline and printed Ability checks.

The deliberately small [optional Float recovery adapter](../../simulation/twinleaf/agent2-fss-held-try-float-owner.cjs) operates solely on the acting owner's actual hand and public own board. Nested **inside** the original FSS wrapper, it proposes an actual pinned PlayCardAction when all of these hold:

- The **first** owner-held Tool is Forest Seal Stone SIT, and the current FSS predicate would HOLD.
- A genuine Float Stone BKT is also in the owner hand.
- Owner Active has printed nonzero Retreat and has an unoccupied Tool slot.
- At least one actual own Benched Pokémon exists.

This is intentionally weaker than [Agent14's strategically constrained funded Float frontier](../../simulation/twinleaf/agent14-generic-funded-floatstone-frontier.cjs). It neither proves retreat is desirable nor screens the full opponent lock and Stadium graph. **Do not adopt as a universal competitive policy.** Its purpose is to provide a falsifiable alternative for the native action-choice omission.

The adapter is reversible, scoped by player seat (native IDs 101 and 202) and genuine owner turn and no-prompt root. No vendor files were modified. It never queries own deck or Prize identities or opposing concealed cards.

## Real pinned Store A/B stages

A/A/B physical state construction uses identical prints, board, own hand order, turn, Energy and actual seat. The control explicitly calls the existing FSS wrapper: it returns HOLD with no Tool action. Treatment nests the new adapter inside FSS, obtains native PlayCardAction for the **second** Tool, and passes that action through **real pinned Store.dispatch**, not a mock callback. All tested axes are repeated in both actual physical seats 0 and 1.

| Constructed original source context | Exact in-play and held printed cards | Native treatment result |
| --- | --- | --- |
| Original rank **3** mobility | Active Snorlax **PGO**, Bench Galarian Stunfisk **SSH**, owner hand FSS **SIT** first and Float Stone **BKT** second | **Float attached and remained on the same physical Pokémon after a genuine zero-Energy retreat**, in both seats. The unplayed Stone remained in hand. No attack evidence was claimed. |
| Original rank **11** powered pivot | Active Latias ex **SSP** holding one Darkness **MEE**; Bench Mega Absol ex **M1L** with three Darkness MEE; held FSS SIT first and Float BKT second; opponent Active Mega Absol ex M1L | Native accepted Float on Latias, then genuine retreat and a **200-damage Claw of Darkness** attack. **This is a non-causal treated action receipt**: Latias ex SSP has Skyliner, granting Basic Pokémon no Retreat Cost even without Float. The treated attack cannot be credited to the Tool. |

Original Aichi rank11 shows Mega Absol ex as publisher group MEG86; Twinleaf's pinned legal equivalent instance is named M1L. The rank3 and rank11 stages are explicitly **hand-constructed from source-present card printings**. The state is reachable in principle, but actual matched whole-deck shuffle, cards drawn, opponent response, sequential choices and complete paper match clock are not established by these stages.

## Tests, identity and native acceptance receipts

- [Source-locked exact original-field opening collision census](agent2-original29-fss-first-tool-starvation-20261104.md) establishes 12/29 Stone+other Tool inventories, with rank11 FSS-first/no initial Basic V event **2.1419% per valid seven**. That number is an opportunity incidence, not the fraction of naturally encountered native tactical states.
- [Direct Stone-first selector counterexamples](../../tests/agent2-first-tool-structural-counterexample.test.cjs), [pure Float fallback regression](../../tests/agent2-fss-held-try-float-owner.test.cjs).
- [Both-seat native rank3 Store attachment and actual retreat](../../tests/agent2-fss-float-actual-store.native.test.cjs).
- [Both-seat native rank11 treatment, 200 damage and a new untreated Skyliner causal control](../../tests/agent2-fss-rank11-funded-attacker.native.test.cjs).
- [Pinned source compilation and native workflow](../../.github/workflows/agent2-fss-float-rank3-native.yml) uses checkout + exact submodule source, npm ci, npm compile, Node tests.
- [CI 41896916131](https://github.com/FlareZ123/experiment-01/actions/runs/41896916131) **SUCCESS** at source checkout **a9ad8e6d36fda4f4cb5e7e64d479958788baeefb**, rank3 both seats. [Artifact 13356541973](https://github.com/FlareZ123/experiment-01/actions/runs/41896916131/artifacts/13356541973), ZIP sha256 **ad4ae5a869a44b760f6dac3cbcf30ed5c1b0bc6ffc39ab8d813fff1ee646edff**.
- [CI 41897615995](https://github.com/FlareZ123/experiment-01/actions/runs/41897615995) **SUCCESS** at research checkout **d31597b98f1ac51a53311b9c7193cf6cadce1ba3**, adds a rank11 treated attack in both seats; its Float causality claim was subsequently retracted because of Skyliner. [Artifact 13356282523](https://github.com/FlareZ123/experiment-01/actions/runs/41897615995/artifacts/13356282523), ZIP sha256 **64cb5b2ea6e0c8bb0fd5f3dc6da0ab896b618c0558ff5742019b004275fd1042**. ZIP digest differs from the text file hash; a user should inspect the actual log in the artifact to reproduce.
- The original initial source hand, public board and source-print code are in the committed deterministic native fixtures. This is *constructed-state custody*, not a natural 60-card deal fingerprint.

## What the correction changes

The prior rank11 comparison compared **Tool selection**, with the control returning no Tool action, while the treatment was manually advanced through retreat and attack. The control was **never tested for its own legal RetreatAction**. Since Skyliner was in play, the original comparison was improperly interpreted as evidence for an exclusive attack line. A proper baseline must attempt the very same RetreatAction and paid attack with both original Tools still in hand. The paper card archive confirms the printed Skyliner effect. The independent Tool-score-blindness result, where the *same Active attacker* deals 200 with Float and 220 with Muscle Band, is unaffected.

## Relevant follow-up for the common symmetric policy

First test whether Agent14's [generic funded Float selector](../../simulation/twinleaf/agent14-generic-funded-floatstone-frontier.cjs) runs **before** the FSS-first Tool tactic in the actual Issue #25 selected stack and whether it rescues this source state already. A full policy fix should enumerate all eligible Tool/target pairs and compare their action values under Supporter/retreat/Bench contention, current lock effects, stadium effects and paper legality. If the selected shared policy already has a stronger upstream generic funded root, do not double-install this simplistic fallback. Staged response evidence alone is insufficient for a globally superior strategy.

**All global release gates remain failed:** 29/32 authenticated original opposing 60s, no full selected symmetric paper-competent policy, zero competitively qualified games, and no demonstrated fixed-list 99.5% win rate.
