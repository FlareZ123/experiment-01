# Rank-6 native source-first turn-34 resource gate: Powerglass needs an established discard

**Agent 8 | 21 October 2026 | read-only audit of genuine pinned Store decisions | competitive-qualified games: 0**

## Question

An emergency `Ace Trainer AOR` source-first New Moon development game against the exact Aichi rank-6 Iron Thorns 60 turned an otherwise inert candidate into three later printed `Psyray` attacks. It still lost. At actual candidate turn 34, the actor had two `Battle Compressor PHF` and two `Powerglass SFA` but its Active attacker lacked sufficient Energy. Can a *legally attainable, owner-knowledge-safe* Item + Tool line bring an earlier damaging attack?

The underlying reproduced paired source-first result and its full source reply are in [Agent8 emergency Ace Trainer](agent8-emergency-ace-trainer-native-sourcefirst-20261021.md). Source full 60s, seed, first physical seat and frozen policy are identical to the earlier source-first ranking fixture. The source physical-deal fingerprint was `14549caa34487d41ae4100c0c3542085d6fe57ed33b9d7da89b79bc55379b5de`. This is one retrospective development deal, not new independent sampling.

## Actual owner-visible T34 data

Manual native read-only audit [run 39660118160](https://github.com/FlareZ123/experiment-01/actions/runs/39660118160), artifact [12374400275](https://github.com/FlareZ123/experiment-01/actions/runs/39660118160/artifacts/12374400275), ZIP SHA-256 `6be3e2e3da0be845d4c6c6bf4a83a1071ab4404e6fecc10e1248a5e7a217f67c`. Registered source-first runner: `simulation/evaluation/agent41-bilateral-v2-development.cjs`. Existing observer `simulation/twinleaf/owner-compressor-opportunity-audit.cjs` is read-only and returns the unchanged original root actions. Four source-first treatments and four source-first controls were archived; strict paired source-deal checker passed. The workflow remains red overall only because the original four-arm candidate-first rank6 chronological epoch audit is independently strict and fails, an already documented limitation.

The owner-state audit at **global turn 34** records:
- candidate physical seat 1, Active `Galarian Articuno V CRE`, **140 damage**, attached `['Psychic Energy MEE']`, **no Powerglass equipped**;
- hand contains **2 Battle Compressor**, **2 Powerglass**; full recorded pass-hand also contains two Dusclops SFA, Counter Catcher, Mewtwo & Mew-GX, Mysterious Treasure and other Items, with no `Switch` or `Escape Rope` printing;
- **0 Basic Psychic Energy in candidate discard**; 27 cards remain in its deck, but the audit deliberately reports **only the count**, never hidden/unsearched identities;
- candidate's Item lock flag `false`, both public Stadium zones empty; source Active Iron Thorns ex with a Speed Lightning Energy, and the source made a genuine `Volt Cyclone` attack on global turn 33;
- the candidate took actual `PassTurnAction` at root ordinal 170 on turn 34, with the source passing on turn 35.

A further observed decision sequence establishes durability: at turn 32 there were already two held Powerglass but one Compressor and zero Basic Psychic in discard; at turns 34/36/38, two Compressors and two Powerglass persisted, while `ownerDiscardBasicPsychicCount` remained zero. At turn 38 a regular manual attachment changed Active Articuno's one Psychic to two Psychic. All are repeated decisions in the **same** physical game, never independent samples.

## Printed and engine gates

The provided **Advanced Player's Rulebook** section **E-21, End of the turn** expressly allows Powerglass's end-turn effect even after declaring no attack. The pinned Twinleaf `ptcg-server/src/sets/10-scarlet-and-violet/set-shrouded-fable/power-hourglass.ts` implements a live `EndTurnEffect` and `AttachEnergyPrompt` from public owner discard onto Active, requiring a Basic Energy there. The pinned `ptcg-server/src/sets/07-x-and-y/set-phantom-forces/battle-compressor.ts` permits owner deck search and discards up to three chosen cards; it handles a genuine owner `ChooseCardsPrompt` and deck shuffle. These statements derive from printed rules and inspected code at upstream pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; they are not a demonstrated native combined line.

The fixed candidate [New Moon English proxy 60](../als/new-moon-lockbreak-english-proxy-60.json) contains exactly **three Basic Psychic Energy** and **three Telepathic Psychic Special Energy**. One Basic Psychic was already attached to Articuno at T34 and zero were in the owner's discard. **At most two** other Basic Psychic copies therefore could have been elsewhere in the owner's physical zones. We did not certify their exact placement in the 27-card deck, Prizes, hand or another Pokémon at T34. The read-only audit intentionally withheld owner-deck identities, and a pre-K1 observer cannot assume them. This is the immediate factual barrier to crediting a Compressor line.

The conditional action plan is: if a legitimate owner deck search establishes at least one eligible Basic Psychic there, then use `Battle Compressor` to put it in discard, attach `Powerglass` to the still-active Articuno, and end turn. An intact Tool and at least one Basic Psychic in discard should permit a native end-turn attachment. On its own, one such attachment changes the printed attack-cost units from one Psychic to two and **still does not pay the three-Energy `Psyray`**. Reaching the third unit requires another legal Energy attachment or acceleration and survival against source pressure. Any paper ruling on exact Special Energy behavior, source lock, and attack effects must be checked separately. No such combined sequence was executed in this trial.

## Outcome and next falsification

**Confirmed negative precondition:** Powerglass by itself had no Basic Psychic in discard to attach at T34. The held Compressor is an access candidate, subject to real Prize/K1/deck membership. The actual policy left both Compressor and Powerglass unplayed for several turns, then attached an additional Basic at T38 and did not reach its observed damaging attack until T52. This is a high-impact proposed **multi-action gap** and cannot be resolved by adding a one-step printed-cost proximity bonus.

A useful follow-up must first check owner-search-available deck contents under proper K0/K1 information provenance, then run a **native legal Item root, owner deck selection, Tool root, end-turn attachment**, record the exact full attack, source next turn and final matchup. Pre-register one fixed initial physical deal, preserve controls, failures and the original source 60. A staged Store fixture can validate rule implementation but cannot stand in for a fully source-dealt result.

The companion [rank11 T22 Energy recipient experiment](agent8-native-t22-shorter-damage-route-negative-20261021.md) similarly showed a valid closer Bench target without more attacks. Both cases motivate policy planning that reaches a genuinely powered and movable attacker. No competitive-strength or win-rate promotion is authorized. Full field still **29/32 exact opponent 60s**, missing ranks 23, 25 and 28, and **zero competitively qualified games** toward the single 99.5% fixed deck target.
