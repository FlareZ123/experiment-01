# New Moon vs Aichi rank 6: exact turn-3 Pass and inert Forest Seal Stone

**Agent 25, 19 October 2026 UTC.** Evidence class: selected-source, pinned-Store retrospective *mechanical policy diagnostic*. One previously registered deal, **zero competitively qualified games**. No new candidate 60, tournament win, or statistical probability is claimed.

## Source and strict noninterference

- Original [preregistered Agent 41 rank6/rank11 pilot](registrations/agent41-crossrank-r6-r11-v1-20261019.json), exact arm `6:0:A:new-moon-lockbreaker-v1`, seed **407516727**, candidate New Moon English-proxy seat A/0; authentic rank6 Iron Thorns seat B/1, actually playing **second**.
- Original compiled [run 39193837824](https://github.com/FlareZ123/experiment-01/actions/runs/39193837824), artifact **12161805529**, 240 root actions, global turn30 engine terminal, rank6 opponent zero Prizes remaining.
- Independent targeted [manual compiled CI 39198932274](https://github.com/FlareZ123/experiment-01/actions/runs/39198932274) passed after correcting an initial local assertion that confused 35 quantity-bearing source rows with the **60 resolved physical cards**; artifact **12163001792**, file `agent25-rank6-newmoon-first-pass.json`, inner JSON SHA-256 `96c16197d7454fb548185bb3d3a7fc195c812535ae4a659db294045276790e25`.
- Exact original root-action-ledger SHA-256 **`9a9007f302a6e84084eb75c77f0a86db0e037c58384d7ff2076de828ba0ba913`** was recomputed on the observed replay and matched byte-for-byte. The 240 actions, game terminal and source 7 vs candidate 1 total logged attack declarations also match. The counterfactual attack announcement was attempted *only after the original bot selected Pass*, in a detached Store clone; no outcome was supplied to its policy.
- Reproduction: [single-arm fail-closed adapter](../../simulation/evaluation/agent25-rank6-newmoon-first-pass-audit.cjs), [unit tests](../../tests/agent25-rank6-newmoon-first-pass-audit.test.cjs); existing [manual source-campaign workflow](../../.github/workflows/aichi-source-locked-campaign.yml) with `agent41_crossrank_trial=true`, `agent25_rank6_newmoon_pass=true`. Engine pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## The exact owner hand and public board at Pass

The source-policy audit confirms rank6 completed global-turn-2 Guzma & Hala, obtaining **Double Colorless Energy + Thunder Mountain Prism Star**, attached DCE and proposed Volt Cyclone. The sampled original candidate turn3 actions were:

| Root ordinal | Executed candidate choice |
| ---: | --- |
| 30 | Attach **Telepathic Psychic Energy** to the Active Pokémon |
| 31 | Resolve the Energy's real Bench-search prompt: **Duskull VIV + Duskull VIV** |
| 34 | **PassTurnAction** |

At the moment of Pass, New Moon's *own visible hand* was **Counter Catcher PAR, Battle VIP Pass FST, Fog Crystal CRE, Telepath [P] Energy M3**. The opponent's hand was represented only by its **public size of 4**, without private contents.

**Candidate board:** Active **Latias ex**, already at **140 damage**, attached **Basic Psychic Energy, Telepathic Psychic Energy, Forest Seal Stone**. Candidate Bench: **Unown, Duskull, Duskull** without Energy. No own Stadium.

**Source board:** Active **Iron Thorns ex**, 0 damage, attached **Double Colorless Energy**, with **Thunder Mountain Prism Star** in the Stadium slot and empty Bench.

## Immediate attack is engine-ineligible

The printed [Latias ex Eon Blade](../../resources/cards/en/sv8.json) costs **Psychic + Psychic + Colorless** (three Energy units). The attached [Telepathic Psychic Energy](../../resources/cards/en/me3.json) supplies one Psychic Energy; together with one Basic Psychic Energy, this is **two units**. The after-choice detached Store explicitly attempted `AttackAction(owner,'Eon Blade')` and returned **`engineAcceptedAnnouncement:false`**. There were no other printed Active attacks found. This shows the candidate did not ignore a *currently available printed attack* when it passed. The clone does not certify all possible Bench-swapping, draw, acceleration, attack-copy or search sequences.

There is a second consequential simultaneous restriction. **Iron Thorns ex's Initialization** ([TWM 77](../../resources/cards/en/sv6.json)) suppresses Abilities of Pokémon with Rule Boxes, other than Future Pokémon, while it is Active. Latias ex is a Basic Pokémon ex with a Rule Box. Its normally helpful **Skyliner** free-retreat Ability is therefore suppressed in this board, making switching to a Benched attacker more expensive than simply assuming Latias is freely mobile. Its printed Retreat Cost is two Colorless. This board detail warrants its own live-legality testing if a proposed counterplay line relies on retreat.

## A separate concrete setup-resource error

The public snapshot places **Forest Seal Stone** on **Latias ex**. The printed Tool ([Silver Tempest 156](../../resources/cards/en/swsh12.json)) explicitly grants **Star Alchemy to the Pokémon V to which it is attached**. Latias ex is a Pokémon ex, and this Tool consequently grants it *no usable Star Alchemy*. The archived turn3 choices contain no Tool play, so the Tool was attached before this first response; attribution to an exact earlier root needs the full initial-turn action record.

This is a directly observed resource-allocation problem in the fixed generic bot's setup; its opportunity cost depends on whether an appropriate Pokémon V and search line could have been reached. It does **not** prove that another Tool assignment changes any match result.

## Independent compiled proof: missed available Farewell Letter

The previously unverified action is now a **confirmed pinned-Store owner-side alternative**, under the exact original already-selected turn-3 Pass state.

- Research-only [read-only chosen-Pass detached-Store probe](../../simulation/twinleaf/newmoon-rank6-pass-farewell-observer.cjs), enabled by the [same source-faithful single-arm runner](../../simulation/evaluation/agent25-rank6-newmoon-first-pass-audit.cjs).
- Compiled manual [CI 39200262402](https://github.com/FlareZ123/experiment-01/actions/runs/39200262402) **PASS**, artifact **12163418390**, ZIP SHA-256 `77cb74117dc8e938c2f133e153f37faf6b42f6c241d1ce585f70f02d8fed17f9`, inner JSON SHA-256 `95bb57807729635a44f4879398e76bed7b12132ca5db19e674f505325efd5e43`. This follows two compiled source-faithful probes ([39199647706](https://github.com/FlareZ123/experiment-01/actions/runs/39199647706) and [39199985592](https://github.com/FlareZ123/experiment-01/actions/runs/39199985592)) showing that the Ability announcement returns without error but initially leaves a **pending WaitPrompt**, so checking the board immediately was insufficient. The final version resolves one `WaitPrompt` in the **detached Store only** and then counts public/own-zone differences.
- At source-aligned global turn 3, already selected `PassTurnAction`, candidate Active Latias ex, opponent Active Iron Thorns ex, and candidate **Unown AOR** at Bench index 0 **unattached**. Own deck had **42** cards, own hand **4**, so a draw was still possible.
- Cloned `UseAbilityAction(owner,'Farewell Letter',Bench Unown)` returned without throwing. It opened one `WaitPrompt`; cloned `ResolvePromptAction(prompt.id,null)` completed. Exact effects observed: **Unown left Bench**, **deck 42→41**, **hand 4→5**, **one extra free Bench position**. The counterfactual recorded neither the drawn card identity nor any opponent private information.
- The **original complete 240-action root ledger SHA-256 still equals `9a9007f302a6e84084eb75c77f0a86db0e037c58384d7ff2076de828ba0ba913`**. The game continues under the original bot choice. Thus the probing did not change the observed live action sequence in this selected deal.

**Qualified mechanical conclusion:** The pinned bot *missed an available, effect-resolving Bench Ability* while passing on turn 3. The opponent's active Iron Thorns `Initialization` only removes Rule Box Pokémon Abilities and thus does not suppress Unown AOR's printed `Farewell Letter`. This is an immediate actionable policy incompleteness. A generic Always-Farewell rule has not been shown optimal because sacrificing Unown, drawing an unknown card, changing Bench capacity and subsequent search alternatives may create other costs.

For reproducibility, invoke the existing manual source workflow with `agent41_crossrank_trial=true` and `agent25_rank6_newmoon_pass=true`; the runner checks the exact deck registration, physical source seed, original action-ledger SHA, real starting player, source policy and expected original turn-3 Pass. The observer emits the cloned-prompt result in the `legalFarewellCounterfactual` field. **Do not append these deterministic replays to a prospective denominator.**

## Decision and limitations

- **Confirmed:** the specific pass faced an underpowered Active; its visible Eon Blade attack was rejected by the pinned Store. The source produced 140 damage and maintained Ability suppression in the public state. Forest Seal Stone was attached to an incompatible Pokémon ex, leaving it without Star Alchemy access.
- **Unresolved:** whether actually deploying the now-proven legal Farewell Letter before Pass and allowing a new owner-information-safe policy continuation would improve this exact match, or whether a stronger opening could establish Mewtwo & Mew-GX and different Energy allocation.
- **Not admissible as winning evidence:** selected retrospective seed, unqualified generic bot, English-proxy Japanese-source mapping, incomplete attack-effect paper-rule qualification, tournament clock not represented. The original 24-arm denominator retains 10 caps and one historically rejected action. All 32 opponents must be considered for eventual single-60 certification; exact lists for ranks 23, 25, 28 remain absent.

**Highest-value next counterfactual:** at the already chosen turn3 Pass, test the *real cloned Store*'s acceptance of Benched Unown AOR `Farewell Letter`. Capture only legal acceptance and public zone counts, never the hidden top-deck card identity. Preserve the original root-action hash and do not reinterpret the archived winner.
