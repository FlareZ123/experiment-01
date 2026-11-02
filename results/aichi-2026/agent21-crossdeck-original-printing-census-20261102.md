# Agent 21: whole-field same-name printing collisions beyond individual original 60s

**2 November 2026 | 29 authenticated original Aichi Top 32 lists, 1,740 physical slots.** Source/English-equivalent printed-card inventory. This is a reproduced card-identity result, not an observed Twinleaf action failure or competitive win rate.

## Newly enlarged denominator

The prior [within-one-deck census](agent21-mixed-original-printing-census-20261102.md) found five mixed-printing Pokémon name groups in four decks, occupying 14 physical copies. A **common source policy** can also encounter a Pokémon name that refers to entirely different printed attacks or Abilities across different opposing decks, even when each individual list contains only one version. The latter problem has an independent full-field denominator.

I grouped **every Pokémon entry** in all 29 authenticated original registered 60s by Pokémon name, then exact source set and collector number across *all decks simultaneously*. Each distinct printing was resolved against [bundled English set/card data](../../resources/) with the multi-candidate set-code resolver; its complete printed attack and Ability objects were compared. No anonymous printing substitutes or incomplete rank-23/25/28 decklists entered this count.

**Result: eight Pokémon names, 18 distinct source printings and 42 physical copies across 13 original decks. All eight groups have printed attack and/or Ability differences.**

| Same-name family | Printed source versions | Physical copies across the 29 original decks | Source final ranks | Specific policy distinction |
| --- | --- | ---: | --- | --- |
| Mimikyu | GRI 58; PAL 97 | 6 | 1, 3, 7, 30 | GRI **Copycat** can copy a prior eligible opposing attack; PAL **Safeguard** prevents damage from opposing Pokémon ex/V and has Ghost Eye |
| Pidgey | MEW 16; FLF 75 | 4 | 2, 15 | MEW has **Call for Family** Bench search; FLF **Peck Off** discards the Defending Pokémon's Tools before damage |
| Pidgeotto | TEU 123; MEW 17 | 4 | 2, 15 | TEU **Air Mail** chooses a card from the top two; MEW has no Ability |
| Vileplume | AOR 3; BUS 6 | 5 | 2, 15 | AOR blocks Item play; BUS while Active prevents opposing Basic Pokémon attacks |
| Pikachu | LOR 52; XY 42 | 2 | 4, 17 | LOR **Pika Dash** removes retreat cost when Energized; XY has **Nuzzle** coin-dependent Paralysis |
| Trubbish | PAR 116; FST 168; CRI 56; NVI 48 | 8 | 8, 11, 16, 22 | Four separate attack menus, including Call for Family, Garbage Collection and coin-dependent Energy discard |
| Garbodor | LTR 68; BKP 57 | 9 | 8, 11, 16, 22 | Both have Garbotoxin, but **Sludge Toss** and **Offensive Bomb** have distinct costs and effects |
| Dusknoir | PRE 37; BCR 63 | 4 | 31 | PRE **Cursed Blast** places damage counters then self-KOs; BCR **Sinister Hand** redistributes damage counters |

Three groups, **Mimikyu, Pidgey and Pikachu**, involve **12 copies** and would be completely absent from a within-deck-only name collision scan. Mimikyu is especially consequential because the two versions inhabit different broad archetypes: ranks 3/7 Snorlax Stall use PAL Safeguard, whereas ranks 1/30 include GRI Copycat. The fact that a common bot knows the name Mimikyu does not certify which action or protection is available.

Five other groups intersect the earlier within-deck inventory. Thus the figures **42 and 14 are overlapping scopes** and must not be added.

## Why this changes the canonical release gate

A global policy may transfer behavior learned in one source list to another based on card name. That is unsafe without actual printed effect identity. The existing [original-Store live physical-card receipts](../../simulation/twinleaf/agent34-live-card-instance-receipts.cjs) expose a name-plus-set style `fullName` and executable class, while the [sequential join](../../simulation/evaluation/agent34-original-store-printing-join.cjs) explicitly declines to certify paper rules or full physical action-object equality.

The required follow-through is a **single common, opt-in, post-game printing/effect check in the canonical bilateral ledger**, keyed by original source rank and physical actor seat. For source-owned actions, compare the actual native printing and executable lookup to that rank's exact source manifest before attributing an attack, Ability, lock or damage protection. Where the native `fullName` omits collector number, leave full set/number attestation **unverified** if a same-name/same-set ambiguity could matter. Retain native root/prompt/payment/effect observations and physical public consequences. Never infer an observed source play, illegal action or corrected game terminal solely from this census.

A high-value first falsification case is **original rank 3 or 7 PAL Mimikyu Safeguard versus original rank 1/30 GRI Mimikyu Copycat** in a paper-effect-aware source driver. Unlike several earlier AOR/BUS or PRE/BCR studies, these differing Mimikyu printings occur across separate original source 60s, where cross-deck bot-policy reuse is the risk. Predeclare native trials and preserve all non-encounters and failing actions.

## Reproduction

- Full original register: [29 authenticated 60s](full-decklists.json), source blob `ae773f6201d7aa69d31914dbfee66f3fba692200`.
- Existing [printing-aware source analyzer](../../scripts/agent21-mixed-original-printing-census.cjs) extended with `crossDeckPrintingCensus` and `runCrossDeck`, blob `47c32e753f14d0c792165464a5d63d6d529de909`, commit `8b3f92c8f6c5c97cb8f44a7705ebc60a7323a32b`. The pre-existing within-one-deck entry point and results remain unchanged.
- [Regression suite](../../tests/agent21-mixed-original-printing-census.test.cjs), blob `b2cbc19afdc60def38019870e0bba576538ae5b0`, commit `427be2fa6171c8428e9928a7e0baf89f03aa5240`. It asserts all eight names, physical totals, exact rank coverage, unique field-only distinctions and a negative control where different printings have identical printed effects.
- **Actual manual GitHub Actions Node 22 tests passed** in the reused [Aichi published-field Energy census workflow, run 41377778390](https://github.com/FlareZ123/experiment-01/actions/runs/41377778390) against head `427be2fa6171c8428e9928a7e0baf89f03aa5240`. The existing workflow includes the entire original within-deck suite and the three new cross-field tests. No new workflow or push-triggered job was added.
- Independently resolved and inspected all 18 exact printed variants using the uploaded original English card database ZIP in local Python. All 18 names/sets/collector numbers match, and the eight families have genuinely different recorded printed texts.

**Boundaries:** The English-equivalent snapshot is evidence of source-printing differences, not full Japanese Expanded eligibility or proof of a specific native executable error. Original rank 23/25/28 complete 60s remain missing. Zero competitively qualified games, no validated unchanged best 60 and no 99.5% result.
