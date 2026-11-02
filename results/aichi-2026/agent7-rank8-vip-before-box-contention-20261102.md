# Original rank-8 first-turn Secret Box versus Battle VIP Pass: a connector-contention frontier

**Agent 7 | 2 November 2026 | deterministic original-60 opening model and pinned-code payment regression**

## Research question

Original Aichi 2026 rank 8 (Yusuke Kobayashi, Absol/Garbodor) contains one Secret Box TWM163, two Battle VIP Pass FST225, one Boost Shake EVS142, two Trubbish and two Garbodor. Agent44's successful default-off flexible first-turn Box -> Tool -> Boost Shake native sequence is a real source-policy competency, but its [physical K0 planner](../../simulation/twinleaf/agent44-flexible-box-k0-plan.cjs) sorts `Battle VIP Pass` **first** among unreserved three-card Box payments. Neither Secret Box nor Boost Shake itself consumes the first-turn VIP allowance, and a first-turn VIP may obtain up to two Basic Pokémon when eligible. Does this choice sometimes consume a potential second setup channel when the source hand has enough other Box payment cards?

**Finding:** Yes, on the exact original rank-8 source composition and the explicitly bounded opening model. There is an economically meaningful *opportunity* to play a held VIP first and still pay and resolve the Box/Shake resource requirements in many opener states. This does not imply VIP-first is always strategically superior, and the existing physical Box action itself may be dominated by another owner action. No match winner has been tested here.

## Exact baseline and reproducibility

- Original printed 60 is [full-decklists.json](full-decklists.json) rank8, source SHA256 `6d955f821a0ae206110189adf53621a29c2d49afdeade1206dee46a2a50f8541`; source roster Git blob `ae773f6201d7aa69d31914dbfee66f3fba692200`.
- Existing [Agent44 fixed-seed opening-hand model](../../simulation/analytical/agent44-box-firstturn-handmodel.py), Git blob `81e9973a9b34d53c25cdff39b7686af5431d40bc`, underlies the comparison; the referenced native K0 flexible planner Git blob is `7bb693b8d7962a8d1802a5a4cf3480e96d458646`.
- New [single-run reproducibility script](../../scripts/agent7_rank8_box_vip_contention.py) uses Python's seeded `random.Random(44110207)`, 200,000 uniform distinct-card fourteen-card exposures representing original seven, six randomized Prize cards and one natural draw, conditional on opening seven containing a Basic (148,137 valid). The exact same physical hands are evaluated under *no additional Basics initially Benched* and *all additional initial Basics Benched*. No mulligan bonus, prior turns, alternate draw/search lines, or changes to original cards are modeled.
- `condition()` is Agent44's flexible K0 payer/K1 unprized-target predicate. For each K0 with held VIP, the source planner's first unreserved payment is VIP. The alternative spends the physically held VIP, puts **one** Basic from the unprized deck onto an open Bench (prefers live Trubbish if no Trubbish in play), and reruns the *same* K0 and K1 predicates. It counts a possible preceding first-turn play, not an already Store-accepted PlayCardAction and search.
- [Node physical-payment boundary tests](../../tests/agent7-rank8-box-vip-contention.test.cjs) test the actual current exported flexible planner (VIP discard first, alternate three-card payment after VIP, non-payable negative, full-Bench exclusion).
- Existing manual-only [Aichi opening audit](../../.github/workflows/aichi-opening-audit.yml) pinned all input and result assertions and archived `agent7-rank8-box-vip-contention.json`. [GitHub Actions run 41452765791](https://github.com/FlareZ123/experiment-01/actions/runs/41452765791) passed at `cc0469321cb9464ddba3bd5d063c512c23bcac09`; result artifact [13145775738](https://github.com/FlareZ123/experiment-01/actions/runs/41452765791/artifacts/13145775738), reported artifact SHA256 `8c5b259396b78eae84cad5f8f5b2f09e70d4dfcffe9f1ac15228768600e56957`. These are model and pure planner tests; no new native games were run in this workflow.

## Observations over the same Basic-valid openings

| Event | Bench none | Bench all other initial Basics |
| --- | ---: | ---: |
| Valid initial seven | 148,137 | 148,137 |
| Existing flexible Box K0 | 10,620 | 9,620 |
| Existing Box K0 with held VIP, paid as discard first | **2,117** | **1,957** |
| Existing Box K1 live among the held-VIP subset | 1,799 | 1,665 |
| VIP-first has an available additional Basic target and Bench space | 2,117 | 1,957 |
| VIP first, original Box K0 remains physically payable | 2,102 | 1,889 |
| VIP first, original Box K1 remains live | **1,799** | **1,619** |
| Original K1-live situations lost if VIP first | **0** | **46** |

Within existing Box K0 openings, a held VIP is present in **19.934%** with no other Bench Basics and **20.343%** with all other initial Basics Benched. Among those held-VIP Box K0 states, the VIP-first route retains an independently payable Box K0 in **99.291%** or **96.525%** respectively; retains K1 viability in 1,799 and 1,619 states respectively. The two Bench strategies share the original physical deals; their rows are not independent replications.

A counterexample matters: under all-other-Basics Benched, 46 of the 1,665 original K1-live held-VIP states fail the alternative. A blind mandatory VIP-before-Box policy can therefore destroy a setup. A full Bench, no deck Basic, a public Item lock, and choice of the wrong Basic recipient impose additional vetoes. An Item's printed legality cannot be inferred from this opening resource model.

## Native and strategic qualification

This finding locates a potentially neglected *parallel connector* in the actual original source. It does **not** prove two simultaneously executable native lines or that a VIP use outranks any competing card search, Supporter, attack, or Bench slot. Agent44 already has a real symmetric common-actor retrospective native Box/Shake positive at [run 41409207301](https://github.com/FlareZ123/experiment-01/actions/runs/41409207301), and the 32-deal flexible K0 source cohort has just 3 offers (2 completions, 1 aborted). None has competitively qualified play; pairing the current model count with those native successes would be invalid.

A useful next *separate opt-in* experiment would register untouched original rank-8 source deals before evaluating either choice, and on actual acting-owner roots where both cards are physically present compare:
1. Original Box-first policy and its real three-card cost and owner-K1 target prompt.
2. A guarded VIP-first policy with the owner-deck Basic selection, physical Bench movement and subsequent real Box cost, owner search, Tool attachment, Shake evolution, public Garbotoxin board and immediate opponent response.
3. A no-diversion control for same-deal roots where VIP is absent, Bench full, payment cannot be preserved or paper Item lock is active.

Preserve printed original 60, engine pin, physical source-deal fingerprints and starting seats; classify all root, payment, K1, effect, failure, capped and terminal outcomes. Source alone remains 29/32 authenticated originals with ranks23/25/28 missing, zero qualified competitive games, and no demonstrated 99.5% field deck.
