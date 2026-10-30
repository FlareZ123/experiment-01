# Agent22: retrospective source-root follow-through after authentic Steven search

**30 October 2026. Replayed exactly the previously selected capped full-original rank7/rank1 source deals. Not a new sample or win-rate experiment.**

## Frozen retrospective boundary

The [preregistered eight-arm natural Steven choice study](agent22-rank7-dealt-steven-paired-native-20261030.md) used seeds 324711001/324711002, both physical source seats, full published rank7 Snorlax Stall and rank1 Shadow Rider Calyrex 60s, 80 action cap, and lexical versus static scored owner search. It showed four actual Steven choices per policy but no completed match. The present [read-only diagnostic registration](registrations/agent22-rank7-steven-followthrough-retrospective-20261030.md) was made **after** those source seeds and search appearances were known. Thus its purpose is to test decision-to-use observability within those same eight games, not produce fresh Monte Carlo estimates.

The executor enables `captureDecisionTrace:true` in the existing pinned native headless runner and retains the scoped numeric shuffle correction, all original 60s, seed, physical seats, owner-only search policy and root cap. Every one of the eight replayed arms is required to equal the archived source-deal SHA256, actual first slot, action count, turn count, Prize state, cap classification and number of accepted genuine source Steven searches. A mismatch fails the replay rather than being silently described as fresh evidence.

## Compiled evidence

The **first** manual follow-through CI 40979587334 failed before native execution: pure tests imported the compiled engine too early. The code now defers native imports inside `run()`. A second CI 40979696963 ran successfully, but an independent read found a measurement flaw: native `rootActionLedger.card` uses a **bare printed card name**, whereas `ChooseCardsPrompt` audit records its **complete set-specific printing ID**. Straight equality systematically reported zero follow-through even when source later played the same card name.

The final [compiled manual run 40980035332](https://github.com/FlareZ123/experiment-01/actions/runs/40980035332) **passed** on commit `71e3842d24bc103789ede5bf63bfa543bc99c030`. Artifact [12944002882](https://github.com/FlareZ123/experiment-01/actions/runs/40980035332/artifacts/12944002882), ZIP SHA256 `52428b4ffbb80d5098a20004e660a8a41a508d2d0697777038ee5642910c6fac`. The final pure test validates the exact-printing-to-native-bare-name mapping using the pinned CardManager catalog. The main audit succeeds with status **`native-replay-identical` for 8/8** arms, **no thrown errors**, the same four source-deal fingerprints, same turn totals/caps and four selected searches per policy.

## Later accepted source-root name overlap

After the selected Steven turn, match each **selected full printed ID** against any **later, actually accepted source PlayCardAction bare name**, translated through the pinned CardManager. All eight searched-owner opportunities have at least one later opponent accepted root within the capped trace. A later name match is necessary but not sufficient to prove that the specific searched physical card was played, because the source could already hold a different copy or printing of that name.

| Frozen source cell | Policy | Source Steven searches | Selected card-name types seen in later accepted source plays |
| --- | --- | ---: | --- |
| 324711001, rank7 physical seat0 | Lexical | 2 | Search T3: Artazon, Capture Energy; Search T5: Capture Energy |
| 324711001, rank7 physical seat0 | Static scored | 2 | T3: Capture Energy; T5: Capture Energy |
| 324711001, rank7 physical seat1 | Lexical | 1 | T4: Capture Energy |
| 324711001, rank7 physical seat1 | Static scored | 1 | T4: Capture Energy |
| 324711002, rank7 physical seat0 | Lexical | 1 | T5: Artazon |
| 324711002, rank7 physical seat0 | Static scored | 1 | T5: Capture Energy |
| 324711002, rank7 physical seat1 | Lexical / scored | 0 / 0 | No qualifying search in either branch |

Across all four searches in the scored condition, the owner fetched `Capture Energy RCL`, `Counter Catcher PAR`, and `VS Seeker PHF` each time. **No later accepted source root played a card named Counter Catcher or VS Seeker within the 80-action window.** The only selected-name follow-through in the scored condition was Capture Energy, four appearance matches across four selected prompts. The lexical condition had five selected-name follow-through appearances across its four search prompts, involving Capture Energy and Artazon.

The five-versus-four counts are **name-overlap observations**, can count a single later play against multiple earlier searches, and cannot rank the search policies. The negative accepted-root coverage for Counter Catcher and VS Seeker also cannot prove that they were legally playable later, or that they had no future strategic value. It does identify the missing bridge between *retrieving* resources and a competent bot later *using* them.

The source actually executed several other non-search-root Trainer actions within these games, including Team Rocket's Handiwork, Lusamine, Lillie's Determination, and Robo Substitute in certain arms. The weak research bots still produced no terminal game, took no Prizes and hit 80 accepted actions in each arm. A realistic stall strategy may require more turns; no official clock, opponent strategic quality or completed win condition was evaluated.

## Prize-condition check for Counter Catcher

The supplied card pool (`resources/cards/en/sv4.json`, Counter Catcher #160) requires the player to have more Prize cards remaining than the opponent before using the Item. All eight games ended at the 80-action cap with six Prize cards remaining on each side. Under ordinary monotone Prize progression, no player became eligible to use Counter Catcher within this horizon. This explains its absence from the accepted source PlayCardAction roots despite repeatedly appearing in the static-weight search choices. It could still be valuable in a longer game where the opponent takes a Prize.

VS Seeker PHF #109 returns a Supporter from the discard pile to hand. Its absence from later plays needs a separate owner-hand and restriction audit; a bare-name root ledger cannot establish that a particular searched copy remained available after the opponent's turn.

## Method and implications

The reusable observer is `simulation/twinleaf/agent22-steven-followthrough.cjs`; native provenance, source root play names, future source play ordinals and public opponent-root count appear in the complete artifact. Pure tests in `tests/agent22-steven-followthrough.test.cjs` ensure opponent plays are excluded from source-card follow-through, prompt Resolve actions are excluded, no intervening opponent turn is not invented, and exact printing names translate to bare published action names before matching.

A common owner-visible chooser should couple the native-validated source search decision to a subsequent owned-root action policy that can play the fetched pieces when legal, while comparing against competing Supporter resources, lock constraints and an explicit hold/no-play line. Historical source-dealt **name-level retrieval-to-play** evidence is stronger than graph reachability alone, but still falls far short of proof of tactical superiority.

**Status:** no competitive-qualified games, 29/32 exact Aichi original lists, missing 23/25/28, no fixed deck proven at the aspirational 99.5% target.

## Authenticated next-owner-turn hand audit (30 October 2026)

The preregistered [live source-owner root hand extension](registrations/agent22-rank7-steven-followthrough-retrospective-20261030.md) uses a reversible Store-identity witness that records the source actor's hand and discard only on genuine source-root bot calls, without reading opponent concealed zones. The first full [compiled CI run 40981446268](https://github.com/FlareZ123/experiment-01/actions/runs/40981446268) **passed**. Artifact [12945670509](https://github.com/FlareZ123/experiment-01/actions/runs/40981446268/artifacts/12945670509), SHA256 `c9d97209c21bd8d9d288717dff356a4cf87489ff5217c0d8ec00ee9279b0ffd8`. All eight source original deals, action caps and turn lengths still replay identically; captured start-of-owner-turn snapshots are authenticated against the one actual live Store instance.

| Scored Steven search | First later source-owned root | VS Seeker in own hand | Steven in own discard | Counter Catcher in hand | Public Prize counts |
| --- | --- | --- | --- | --- | --- |
| Seed 324711001, source seat 0, search T3 | T5 | Yes | Yes | Yes | 6 vs 6 |
| Same seed and seat, search T5 | T7 | Yes | Yes | Yes | 6 vs 6 |
| Seed 324711001, source seat 1, search T4 | T6 | Yes | Yes | Yes | 6 vs 6 |
| Seed 324711002, source seat 0, search T5 | T7 | Yes | Yes | Yes | 6 vs 6 |

The **4/4** search-to-next-root receipts prove that VS Seeker remained physically available **by printing name** in the source hand after the opponent had acted, while at least one Steven's Resolve was in the source discard. One source-deal sequence had two consecutive Steven searches and ended with two VS Seeker in hand; earlier hand copies make physical provenance ambiguous. None of the eight capped action traces executed a subsequent accepted VS Seeker root. An engine-legal immediate use, any applicable Item lock and the supporter's discarded-card recovery effect **have not yet been tested as a same-root causal fork**. Thus the evidence supports an under-exercised source continuation channel but stops short of attributing a missed legally available action at every snapshot.

The same four scored receipts show Counter Catcher in hand, yet both sides held six Prizes. Its printed requirement of more remaining own Prizes is false, so an immediate Counter Catcher play is mechanically unavailable. The static utility scorer overvalues the card in these particular states. Those two cards offer a useful positive/negative pair for a future owner-root policy evaluator: the next VS Seeker legality must be checked; Counter Catcher should be withheld until its Prize condition becomes true.

The newer February 2026 [Professor Program rulebook clarification](https://professorprogram.pokemon.com/news/11473085) also requires an unrestricted any-card search such as Steven's Resolve to take **at least one card**. The native prompt validator alone may allow an empty bundle. The owner-search adapter has subsequently been updated with a narrow Steven-specific paper-minimum overlay, and a separate regression run is pending. None of the actual searches above selected zero, so this rule correction does not alter their recorded chosen bundles.

