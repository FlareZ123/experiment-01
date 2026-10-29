# Remaining 23 recovered Aichi original 60s: K0 actor first-root noninterference

**Agent 18, 29 October 2026.** **Observation:** **23/23 fixed additional published-source opponents passed**, two actual owner-root K0 invariance checks and observer-on/off native outcome parity per opponent (**46 new genuine first owner roots**). Together with the [earlier six-rank survey](agent18-aichi-six-rank-source-k0-survey-20261029.md), **all 29 available original Aichi Top32 full 60s** now have a bounded owner-root information-set control, **58 genuine owner roots** in total. All source games are censored prefixes and **zero competitive-qualified games**.

## Fixed scope and provenance

The [pre-execution protocol](../../agents/agent18/20261029-remaining23-original-field-k0-protocol.md) fixed the exact additional ranks **1,3,4,5,7,8,9,12,13,14,15,16,17,18,19,20,21,22,26,27,30,31,32**, including the original rank1 champion mirror, before execution. Six ranks already tested were **2,6,10,11,24,29**. This union equals all 29 published original complete lists in `results/aichi-2026/full-decklists.json`. The original 60-card lists for ranks **23,25,28** are unavailable and have **not** been synthesized or tested.

Every registered opponent was compared with the same **unchanged original rank1 Shadow Rider Calyrex** source 60, champion physical seat A, opponent physical seat B, deterministic seed `4246551499`, **48 native-action cap**. Pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The source resolver provided the original printing identifiers with explicit, existing same-set Basic Energy and Japanese-promo compatibility allowances. Shared development isolation/policy settings remained constant; original native bot decisions were not replaced.

At each **first true native owner root** for each physical player, [the observer](../../simulation/twinleaf/agent18-aichi-source-k0-native-root.cjs) exchanges one card from that owner's unrevealed physical deck with a different still-face-down Prize card, verifies identical detached `actorObservation` and first-return `chooseActorRootIntent`, restores the exact original card objects **before** native SimpleTacticsAi decides, and records the bot's returned action class passively. Separate source replays with and without this observer are checked for exact parity on native deck hashes, winner, action count, turn count, end reason and Prize counts. Every one of the 23 requested source matchups passed these assertions.

## Executed evidence

[Manual CI run **40973492069**](https://github.com/FlareZ123/experiment-01/actions/runs/40973492069) ran the same compiled pinned Twinleaf engine. The **remaining-23 survey step passed** at workflow head `3920b6b47788b34c0617eb8cd295b2addac6331a`; artifact [**12941761895**](https://github.com/FlareZ123/experiment-01/actions/runs/40973492069/artifacts/12941761895), name `agent18-original-aichi-k0-remaining23-survey`, retains every registered rank, actual owner root, bounded native outcome, decision intent and native first-return class. Implementation [`agent18-aichi-k0-remaining23-native.cjs`](../../simulation/twinleaf/agent18-aichi-k0-remaining23-native.cjs) asserts the union of registered six and twenty-three ranks exactly matches all published full 60s, and fails CI for any incomplete or blocked rank.

| Rank | Original opponent archetype | Actor-only first root, opponent physical B | Native bot first action class, opponent B |
| ---: | --- | --- | --- |
| 1 | Shadow Rider Calyrex | Bench Basic | PlayCardAction |
| 3 | Snorlax Stall | Bench Basic | PlayCardAction |
| 4 | Raichu Electrode Combo | Bench Basic | PlayCardAction |
| 5 | Mew Genesect | Bench Basic | PlayCardAction |
| 7 | Snorlax Stall | Bench Basic | PlayCardAction |
| 8 | Absol Garbodor | Bench Basic | PlayCardAction |
| 9 | Absol Electrode | **Pass** | **PlayCardAction** |
| 12 | Regidrago | **Pass** | **PlayCardAction** |
| 13 | Regidrago | **Pass** | **PlayCardAction** |
| 14 | Regidrago | **Pass** | **PlayCardAction** |
| 15 | Lopunny Vileplume | **Pass** | **PlayCardAction** |
| 16 | Absol Garbodor | Bench Basic | PlayCardAction |
| 17 | Raichu Electrode Combo | Bench Basic | PlayCardAction |
| 18 | Regidrago | Bench Basic | PlayCardAction |
| 19 | Raging Bolt | Bench Basic | PlayCardAction |
| 20 | Regidrago | Bench Basic | PlayCardAction |
| 21 | Regidrago | **Pass** | **PlayCardAction** |
| 22 | Absol Garbodor | Bench Basic | PlayCardAction |
| 26 | Meloetta Donk | Bench Basic | PlayCardAction |
| 27 | Regidrago | **Pass** | **PlayCardAction** |
| 30 | Lillie's Clefairy | Bench Basic | PlayCardAction |
| 31 | Dusknoir Chimecho | Pass | PassTurnAction |
| 32 | Regidrago | Bench Basic | PlayCardAction |

In **all 23 champion physical A first roots**, the limited actor policy proposed `attach-basic-energy`, while the native bot returned a `PlayCardAction`. This class is too broad to determine whether the actions were physically or strategically equivalent.

Every 48-action original source run ended by `action-limit`, with `winner=-1`. Twenty-two of the new opponent pairings ended at six versus six Prize cards, while rank15 Lopunny Vileplume ended at five versus six. The observer-on/off outcome matched in every registered case. All tests were genuine original native Store decisions, with original decks and random seed preserved after every comparison.

## Combined 29-deck opening-policy coverage census

From the archived independent [six-rank](https://github.com/FlareZ123/experiment-01/actions/runs/40973194875/artifacts/12942130058) and [remaining-23](https://github.com/FlareZ123/experiment-01/actions/runs/40973492069/artifacts/12941761895) survey receipts, opponent-side initial actor-only intents are:

- 16 `bench-basic`, all with original bot first action class `PlayCardAction`.
- 3 `attach-special-energy`, all with original bot class `PlayCardAction`.
- 10 `pass`, of which **nine** original bots returned `PlayCardAction` and one (rank31) returned `PassTurnAction`.

The nine **Pass versus PlayCardAction** source opening ranks are **2,9,10,12,13,14,15,21,27**. This is a **descriptive first-root coverage disagreement**, not evidence that an actor-only Pass is paper-illegal, that the original bot's selected card resolves correctly, or that the bot is tactically superior. The original bot has documented hidden-information and tactical defects. Separately preregistered [native dispatch attribution](../../agents/agent18/20261029-native-first-root-dispatch-protocol.md) is needed to identify actual hand printings, Store acceptance and physical consequences.

## Strict inference limits

The broad 29/29 result supports only **information-set integrity of this particular actor-only root proposal under one same-seed, first-root, temporary deck/Prize exchange per published source pairing**. It does not establish hidden-information integrity of default native SimpleTacticsAi, the correctness of printed rules, authenticated K1 knowledge, strong two-sided decision policies, card-choice utility, completed-match outcomes, or a deck's win rate. Each opponent received only one fixed original-source opening against the original champion in one physical orientation and was censored at 48 actions. This is neither a 29-match completed field benchmark nor a claim of having tested all possible initial states.

**Current complete-field benchmark remains blocked by missing ranks 23,25,28, zero competitive-qualified matchups and no evidenced fixed-60 99.5% win-rate solution.**
