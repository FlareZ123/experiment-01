# Every authenticated Aichi 2026 source has an ACE SPEC: Spiritomb versus Genesect conditional denial

**Agent 24 | 30 October 2026 | new card-pool hypothesis and exact source census, zero competitive wins.**

## Concrete finding: 29/29 authentic original source lists contain one ACE SPEC

A new [source-verified census](../../scripts/agent24-spiritomb-ace-source-census.cjs) joins the 29 original [ranked source 60-card decklists](full-decklists.json) to the supplied BW-onward [printed English card database](../../resources/cards/en/) and set code registry. Each ACE SPEC is matched by **name + set abbreviation + card number**, rather than an optimistic name-only lookup. The card search is bounded to the **10 May 2026** event date. The reproducible [pure tests](../../tests/agent24-spiritomb-ace-source-census.test.cjs) deliberately forge a same-name wrong print in rank1 and assert that it is rejected.

**All 29** currently authenticated rank placements, from 32 total, have **exactly one verified ACE SPEC**. These are the seven distinct printed categories:

| ACE SPEC printing name | Opposing original ranks | Original decks |
| --- | --- | ---: |
| Secret Box | 4, 5, 8, 9, 11, 16, 17, 19, 22, 30 | 10 |
| Megaton Blower | 6, 7, 12, 13, 14, 20, 21, 24, 29, 32 | 10 |
| Grand Tree | 2, 15, 31 | 3 |
| Prime Catcher | 10, 18, 27 | 3 |
| Unfair Stamp | 1 | 1 |
| Scoop Up Cyclone | 3 | 1 |
| Dowsing Machine | 26 | 1 |
| **Total** | **29 known ranked original decks** | **29** |

All 29 verified ACE SPEC cards in this roster are Trainers played from hand in their normal use; the **three Grand Tree ACE SPEC cards are Stadiums**, whereas the other **26 are Items**. This is printed-card inventory only; the experiment has **no confirmed actual ACE SPEC plays to block** and no established win advantage. The exact lists for final ranks **23, 25, and 28** remain missing. Neither of the following **exact proposed denial printings** appears in the 29 original decks.

## Two legal Basic passive-lock candidates, with opposite opportunity costs

**Spiritomb (Legendary Treasures, LTR 87; Black & White-era Basic Darkness, 80 HP)** has **Sealing Scream**, an unconditional in-play Ability preventing **both players** from playing ACE SPEC cards from their hands. It requires no Tool, attachment, damage, turn attack, or Active position. It denies use of the player's own ACE SPEC too. The card is listed as legal for paper Expanded, including Japanese Expanded, by [Limitless](https://limitlesstcg.com/cards/ltr/87); the general 2026 [official Expanded rules](https://www.pokemon.com/us/pokemon-news/2026-pokemon-tcg-standard-format-rotation-announcement) retain Black & White onward and the official banned-card list does not name LTR Spiritomb. It also has a Japanese Extra Battle Day promotional reprint available before the May 2026 Aichi event.

**Genesect (Shrouded Fable, SFA 40; Basic Metal, 110 HP)** has **ACE Nullifier**, which prevents **only the opponent** from playing ACE SPEC from their hand, conditional on a Pokémon Tool being attached to Genesect. This preserves one's own ACE SPEC, at the cost of occupying one additional Tool and acquiring both pieces. [Limitless](https://limitlesstcg.com/cards/SFA/40) identifies this exact printing as legal in Expanded and Expanded (JP). The [Japanese FAQ summarized on Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Genesect_%28Shrouded_Fable_40%29) further says that **Jamming Tower's Tool-effect shutdown does not remove the attached Tool**, so ACE Nullifier's bare attachment condition can still hold. It cannot deny an ACE SPEC moved into play without being played from the hand, for example an Energy attached from the deck by another effect.

**Both are non-Rule-Box Basic Pokémon.** The printed Iron Thorns ex **Initialization** applies Ability shutdown only to Pokémon with Rule Boxes, so it does not by itself suppress either of these Basic locks even in the three original Iron Thorns source decks. The printed **Path to the Peak** has a similar Rule Box restriction. That advantage disappears against unrestricted Ability suppressors such as **Garbodor Garbotoxin**, Basic Ability suppressors such as **Silent Lab**, or an Active **Wobbuffet Bide Barricade**. These specific original source lists contain possible bypass pieces:

| Source-printed possible Ability suppression | Original ranks containing it |
| --- | --- |
| Garbodor with Garbotoxin | 8, 11, 16, 22 |
| Silent Lab Stadium | 9, 13, 15, 32 |
| Wobbuffet PHF 36 | 7, 10, 21 |

These are **11 distinct ranks**, a structural *possibility* of counterplay rather than 11 confirmed ACE escapes. Garbotoxin needs its own Tool before working, Wobbuffet must be Active, and Silent Lab must be in play; timing and competing lock effects matter. A protective Stealthy Hood can change some Ability-lock interactions, itself consuming a Tool and potentially being removed. Genesect's attached Tool can also be discarded by Field Blower, Faba or other applicable effects. The opponent must be able to execute those interactions under the actual turn state.

## Exact direct first-eight access cost

As a transparent *toy sensitivity analysis*, assume a 60-card deck has **14 Basic Pokémon**, of which 1–4 are the relevant Spiritomb or Genesect prints. For the Genesect alternative, assume **four genuinely compatible Tools** in the other 46 cards. Condition on a valid opening **seven** containing at least one Basic, deal six face-down Prize cards, then draw the first normal turn card. The [independent exact combinatorial enumerator](../../scripts/agent24-ace-nullifier-opening-frontier.cjs) sums multivariate physical first-seven configurations and one subsequent card draw; its [regression tests](../../tests/agent24-ace-nullifier-opening-frontier.test.cjs) use independently enumerated rational expected values.

| Copies of the denial Basic | Spiritomb directly in first eight | Genesect **and** Tool directly in first eight |
| ---: | ---: | ---: |
| 1 | 15.17495% | 6.12079% |
| 2 | 28.51346% | 11.57697% |
| 3 | 40.20552% | 16.42831% |
| 4 | 50.42443% | 20.73020% |

For every row, the total Basic count remains 14. These probabilities **exclude all search and Supporter lines, opponent mulligan bonus draws, Bench contention, Tool's alternative purpose, Prize discovery, opponent timing, Ability suppression, and any actual game success**. Search Items such as Nest Ball and Level Ball can improve either Basic's access, but that improvement competes for connectors and Bench spaces; Genesect additionally needs a usable attached Tool. A Tool such as Forest Seal Stone may be technically attachable but strategically expensive to redirect away from its intended VSTAR access line. Spiritomb's no-Tool simplicity is offset by losing access to one's own ACE SPEC until Spiritomb leaves play or its Ability is suppressed.

### The setup phase creates a sharper turn-order asymmetry

The eight-card access table above is most relevant when **our player goes first** and can place the Basic and then play a Tool before the opponent's first normal turn. **When we go second**, the opponent gets its first normal turn before we can play a Tool. Spiritomb can already be **face up in play at the start of the game** through an opening-seven Basic Bench or Active selection, while the ordinary setup rules do **not** allow attaching a Pokémon Tool. Thus Genesect's Tool-dependent ACE denial has **zero ordinary setup-phase activation chance**, even if Genesect and the Tool were both among the opening seven. This is a timing constraint, not a statement about future-turn success.

The same exact 14-Basic toy 60 and valid-opening-seven conditioning gives:

| ACE-denial Basic copies | Spiritomb in setup seven and therefore potentially lock-ready before *either* player acts | Genesect ACE lock active during ordinary game setup |
| ---: | ---: | ---: |
| 1 | **13.54370%** | **0%** |
| 2 | **25.71007%** | **0%** |
| 3 | **36.61785%** | **0%** |
| 4 | **46.37744%** | **0%** |

The underlying exact fractions are `682689/5040640`, `80997/315040`, `922887/2520320`, and `5313/11456`. These are present in the [extended exact enumerator](../../scripts/agent24-ace-nullifier-opening-frontier.cjs) and [new regression test](../../tests/agent24-ace-nullifier-opening-frontier.test.cjs). They do not account for how often the opponent's particular ACE SPEC is physically drawn or playable, and cannot be translated into wins. Bench slot availability remains an additional condition, though the owner can ordinarily reserve a slot for a chosen Basic while setting up.

A 100% source decklist-level ACE SPEC exposure is an **upper bound on potential relevance**, not a 100% lock success rate. Opponents may use their ACE SPEC before the denial Basic enters play, draw no ACE SPEC until after it is Knocked Out, remove the denial Pokémon, disable its Ability, or instead win without their ACE SPEC. The actor's own game plan must still function while the Basic occupies a Bench or Active slot and any associated Tool is occupied.

## New real pinned Twinleaf finding: Spiritomb's own ACE SPEC is wrongly playable

**Compiler-backed isolated native card-reducer run:** [CI 41146369433](https://github.com/FlareZ123/experiment-01/actions/runs/41146369433), [native original pinned reducer harness](../../simulation/twinleaf/agent24-ace-nullifier-pinned-reducer.cjs). This job's actual compiled-native portion **passed**. Its separate pure test job failed on an initial synthetic mock whose Ability text lacked the literal `ACE SPEC` string. That mock was corrected afterward. The native result below is independently reported from the actual passed native job's narrow `ORIGINAL_ACE_REDUCER_PARITY` log line:

| Exact direct pinned reducer probe | Actual native output | Printed rule |
| --- | --- | --- |
| Spiritomb LTR87 in our Active; **our** Secret Box ACE SPEC Item PlayItemEffect | **Allowed** (`spiritOwn:false`) | Should be **blocked** by *Each player* |
| Same Spiritomb; **opponent's** Secret Box | **Blocked** (`spiritOpp:true`) | Blocked |
| Genesect SFA40; opponent's Secret Box, **no Tool** | Allowed | Allowed |
| Same Genesect with genuine attached Forest Seal Stone; opponent's Secret Box | **Blocked** | Blocked |
| Same Genesect + Tool; **our** Secret Box | Allowed | Allowed |

The stage creates real compiled pinned Pokémon, Trainer and effect classes, original native State/Player/PokémonCardList objects, and calls **their actual `reduceEffect` functions**. It supplies a minimal Store-like `PowerEffect` no-lock response to isolate card-local ownership predicates. This is **direct native reducer evidence**, not a complete playable-deck Store action sequence, global game reducer audit, or enemy move-quality result. Full Store integration remains a separate gate.

A specific paper-fidelity failure is established in Spiritomb's real pinned native reducer: its four ACE play branches only search the **opponent** of the ACE-playing player for this particular Spiritomb, never its controller's own board, despite the correct displayed printed text `Each player can't play any ACE SPEC cards from his or her hand`. This makes an uncorrected Spiritomb strategy artificially asymmetric in engine calculations and risks overvaluing a candidate that includes its own ACE SPEC. It is a **direct discrepancy** between the pinned implementation and the supplied card, not an invented opponent interaction.

The native **Genesect SFA40** card is registered with exact matching print and an opponent-only Tool-dependent reducer. Its **native Ability name** is `Ace Canceller` and native attack name is `Magnet Blast`; the supplied printed English card database says `ACE Nullifier` and `Magnetic Blast`. The exact-print registry audit correctly reports that the name does not match while retaining the functional ACE-text evidence. Name divergence may undermine attack/Ability-name matching across research tooling, even where reducer behavior is locally consistent.

A default-OFF, reversibly installed, research-owned [paper Spiritomb shared ACE hook](../../simulation/twinleaf/agent24-paper-spiritomb-shared-ace-hook.cjs) has been added outside `vendor/twinleaf` to block the missing owner side while retaining the native opposing side. It restores the pinned prototype after the scoped callback and is explicitly **a limited correction**, not complete paper fidelity. The headless engine's generic `AttachEnergyEffect` does not independently reveal whether an ACE SPEC Energy was attached *from hand*, so full parity for hypothetical Special Energy ACE cards remains unproven. This hook is not enabled in the canonical benchmark.

## Required next experiments before any deck swap

1. **Native CardManager and actual effect coverage.** Run a pinned exact printing/Ability registration check. A registered printed Ability does not establish that the Store actually disallows native opponent ACE SPEC actions. If the engine cannot execute it, write a reversible research adapter for the actual pinned behavior and test both the lock and its removal.
2. **A representative real 60 versus unchanged original source**, especially one of the ten Secret Box decks and one of the ten Megaton Blower decks. Pre-register the exact legal candidate 60 with and without the denial package. Log genuine source ACE eligibility in owner hand, whether each game actually attempts that ACE, whether the legal option disappears from native action opportunities, and whether an opponent can still play enough Items/Supporters to win.
3. **Compare symmetric and asymmetric policies.** Spiritomb may harm an otherwise valuable singleton ACE SPEC on one's own side. Genesect may fail because compatible Tool search consumes the exact Arven / forest Tool connector needed by the original tactic. The experiment needs both-player Policy/Supporter/resource contention, genuine adversarial response, and play-clock evidence.

This screen yields **no nominated finished 60-card list, no measured matchup win rate, zero qualified competitive games**, and no evidence of a 99.5% achievement. The research priority is converting the universal **potential ACE denial** into an actually accessible, asymmetric, opponent-relevant line that increases real terminal strength.
