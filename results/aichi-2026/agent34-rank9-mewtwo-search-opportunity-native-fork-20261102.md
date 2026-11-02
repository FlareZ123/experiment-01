# Original rank-9 New Moon Mewtwo search: actual native owner-choice counterfactual

**Agent 34 | 2 November 2026 | developmental and retrospectively selected | zero competitive-qualified games**

## Scientific question

A same-closure four-game original-source replay found New Moon Lockbreaker v1 repeatedly attacking with Active Klefki while the candidate's five-slot Bench contained Unown AOR, Dusclops SFA, Trevenant & Dusknoir-GX SMP, Lunatone OBF and Duskull VIV. The candidate's principal Mewtwo & Mew-GX Perfection attacker was absent. Could actual own-deck search choices have obtained Mewtwo before this Bench saturation, and would correcting exactly one such choice materially change the same physical deal?

Use [Agent5's original-rank9 same-closure evidence](agent5-rank9-known-dead-same-closure-native-20261102.md) and this [original native choice audit](../../simulation/evaluation/agent34-rank9-newmoon-lastbench-owner-location.cjs). In this run, the native pinned source is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; the original opponent is published final rank 9, Absol Electrode. Frozen challenger 60s are the champion-reference and [New Moon Lockbreaker v1](../als/new-moon-lockbreak-60-candidate.md). Four original [rank-9 registered trial arms](../../simulation/evaluation/agent10-original-rank9-absol-electrode-development.cjs) are unchanged.

## Baseline: two exposed legal alternatives at genuine owner prompts

The actual pinned native original Store's own-deck `ChooseCardsPrompt` offered Mewtwo & Mew-GX UNM as a **valid** search alternative on two different turns in the same original candidate seat-A game:

| Baseline candidate owner event | Actual generic-bot choice | Core Mewtwo location before choice | Other public board |
| --- | --- | --- | --- |
| Global turn 1, real Store dispatch ordinal 11, prompt 8 | Duskull VIV | Deck **2**, Hand 0, Prizes 0, discard 0, Bench 0 | Unown on Bench, four open Bench slots |
| Global turn 23, dispatch ordinal 107, prompt 69 | Duskull VIV | Deck **2**, Hand 0, Prizes 0, discard 0, Bench 0 | Four Bench occupied, one slot open, Active Klefki |
| Global turn 23, dispatch ordinal 111 | Direct physical play of retrieved Duskull from hand to Bench | Deck **2** before/after, neither in play | Duskull consumes final available Bench slot |

For both choice prompts `pending.cards === owner.deck`, the `pending.playerId` identifies the actual owner seat, `pending.validate([actualMewtwoCard]) === true`, the offer is a real card in the owner's **own** deck, and neither ordinary Pokémon play nor Ability-Pokémon play was locked. The observer records the selected action **before** reading private card identities and never gives the post-choice zone information to the bot.

Source printed-text context: Mewtwo & Mew-GX UNM 71 is a Basic Psychic Pokémon; Fog Crystal CRE 140 searches Basic Psychic Pokémon or Psychic Energy. The native search prompt being legal is established independently of an assumed originating Trainer; precise source-Item attribution remains separate from this prompt receipt.

A 29/32 source-field identity audit does **not** supply any game results. Source ranks 23, 25 and 28 remain unauthenticated.

## One-variable original native Store replays

[Source and code for matched developer intervention](../../simulation/evaluation/agent34-rank9-mewtwo-native-search-choice-fork.cjs), [pure regression tests](../../tests/agent34-rank9-mewtwo-native-search-choice-fork.test.cjs), and actual [manual CI 41412443228](https://github.com/FlareZ123/experiment-01/actions/runs/41412443228).

For each of two alternate branches, replayed the same four source-registered physical seed and candidate-seat arms as the original baseline. At exactly one selected owner `ResolvePromptAction` (either global turn 1 **or** turn 23), the normal bot first proposed Duskull. The opt-in developer-only wrapper checked that both core Mewtwo cards were in the genuine owner deck and that the pending native `ChooseCardsPrompt` allowed the actual Mewtwo printing, then dispatched a replacement native `ResolvePromptAction` selecting Mewtwo. No prechoice owner bot code, deck 60, source roster, first-turn deal, seed, or other native action was modified. It is a **postchoice developer fork**, therefore cannot be counted as autonomous playing competence.

In each branch, the pinned native Store **accepted one replacement**, then physically transferred one Mewtwo from deck to hand, preserving two total copies. The first manual fork CI executed 4/4 pure tests plus 3/3 observer tests, and 4/4 initial full physical deals match exactly between treatment and baseline in **each** branch. The three unaffected trial's original Store action ledger digests remained unchanged; only the affected New Moon seat-A trial's ledger diverged.

Neither branch altered the recorded native game winner or final Prize counts across any of the four matched trials. The affected New Moon seat-A native game still recorded source winner seat 1 with final Prize cards **[4,0]**. These are retrospective engine outcomes under incomplete source and candidate playing policies; no independent paper-game win rate can be inferred.

## What this establishes and what remains open

- **Established:** It is physically feasible to retrieve the two-copy core Basic using an available same-deal owner-deck search instead of Duskull at global turn 1 or at the last-Bench turn 23. Both alternatives passed native `ChooseCardsPrompt.validate` and completed a real physical card transfer. The alternative turns were registered only after observing the original deal, so these results are not prospective.
- **Established:** Retrieval alone did **not** improve that one observed matchup's terminal result. A feasible search path was insufficient evidence of a better full line.
- **Unverified downstream:** Whether and when the retrieved Mewtwo was subsequently Benched, whether Klefki's own Active Mischievous Lock continued to suppress Perfection, whether Psychic/Telepathic Energy was committed to Mewtwo, whether a switch/retreat was available, and whether the attacker became payable. [Read-only physical Mewtwo Bench followthrough](../../simulation/evaluation/agent34-rank9-newmoon-lastbench-owner-location.cjs) has been instrumented separately; do not assume it occurred merely because a native search succeeded.
- **Qualification veto:** Four retrospective original source games with a partially skilled owner policy do not establish strength across the 29 authenticated originals, much less 32. No unchanged fixed challenger 60 is certified as generally best; **zero competitive-qualified games, zero validated 99.5% estimate**.

This narrow result is an example of the human-concepts warning about associativity: a native-legal search connector can return the right card without completing the attack/board transition needed to win.
