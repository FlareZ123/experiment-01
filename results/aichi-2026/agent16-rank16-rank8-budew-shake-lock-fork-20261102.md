# Agent 16: the first-turn Budew attack competes with Boost Shake Garbotoxin

**2 November 2026, normal Agent16.** Evidence class: exact printed-60 hypergeometric/resource-line model, independent arithmetic and miniature exhaustive enumeration. This is a conditional **source decision-opportunity** study, not a simulated match or a field win-rate estimate.

## New question

The four published Mega Absol/Garbodor originals have a shared attack and Tool-enabled Garbotoxin lock, but the rank 8 and rank 16 printings also carry **Budew ASC 16** and **Boost Shake EVS 142**. Budew's `Itchy Pollen` costs no Energy and blocks the next opponent's Item plays; Boost Shake searches for an Evolution Pokémon, permits first-turn evolution, and **ends the user's turn**. Garbodor LTR 68 and BKP 57 have `Garbotoxin`, which turns off Pokémon Abilities while Garbodor has a Tool attached.

For a source player **going second**, an opening with Budew selected Active, Trubbish available to Bench, Float Stone attachable to Trubbish, Boost Shake available and a Garbodor in the deck creates a **mutually exclusive first-turn decision**. Attacking with Budew first establishes the attack's Item-lock effect (subject to applicable opponent effects); Boost Shake can immediately evolve equipped Trubbish into Ability-locking Garbodor, but ends the turn before Budew can attack. The source player's choice affects which opposing actions will remain possible. An actor greedy for “fast evolution” may fail to evaluate the lost immediate Item-lock attack.

The printed source cards and exact copies, rather than a generic Absol archetype, are the basis for the analysis. The previously verified [direct Garbotoxin route](agent7-absol-shake-first-turn-als.md) examines the Shake path; the [Budew opening study](budew-direct-opening.md) examines the Budew initial-seven event. Neither separately counts their **same opening coavailability** and consequential attack-versus-evolution contention.

## Exact, narrow K0 opening event

The reproducible [new exact model](../../scripts/aichi-absol-budew-shake-fork.cjs) samples a uniform seven-card opener conditioned on at least one Basic, all six Prizes and one normal draw on the first own turn. It requires:

1. At least one Budew in the **initial seven**, permitting it to be chosen as starting Active without search or switch.
2. Trubbish, Float Stone and Boost Shake in the first seven **plus the first normal draw**. Trubbish can be benched and equipped before Shake.
3. At least one Garbodor still in the **searchable deck**, after the initial hand, six Prizes and normal draw.

All four categories use physical copy counts from the exact source 60. The first draw and the six Prize cards are exchangeable random positions after the initial hand; the combinatorial tally enumerates category counts and subtracts all-Prized remaining Garbodor configurations. We separately count a **broader visibility envelope** needing only Budew in the initial seven, Boost Shake by the first draw, and at least one Garbodor searchable. That envelope makes no assumption that Trubbish or Tool can actually be found; it is an indication of how much extra opportunity connectors could create *within the initial-Budew/visible-Shake cohort*. Searches for Shake itself can also create uncounted routes, so the envelope is **not a general upper bound on all playable lines**.

| Final rank | Budew / Shake / Garbodor copies | Complete direct coaccess, conditional Basic-valid opener | Budew-in-seven + visible-Shake envelope |
| ---: | :---: | ---: | ---: |
| **8** | 1 / 1 / 2 | **0.11357716%** | **1.79250937%** |
| **11** | 0 / 2 / 2 | **0%** | **0%** |
| **16** | 2 / 2 / 3 | **0.41436272%** | **6.40335441%** |
| **22** | 1 / 0 / 2 | **0%** | **0%** |

Exact reduced fractions for the direct event: rank8 `2539354951/2235797117840`; rank16 `111430883/26892110960`. For the visibility envelope: rank8 `77763/4338220`; rank16 `6409893/100102112`.

The direct coaccess is much rarer than a basic Budew opener: the established separate Budew-alone opening probabilities are 15.74% rank8 and 28.48% rank16. The source player may use Quick Ball, Trainers' Mail, Secret Box and other connectors to obtain missing pieces, subject to three-card Box discards, search-card contention, other objectives, item-lock exposure and turn-ending effects. This computation does **not** estimate how often a competent player chooses either branch.

## Validation

The [tests](../../tests/aichi-absol-budew-shake-fork.test.cjs) compare all four independently registered printed 60s and expected exact reduced fractions, require the full direct fork to be a subevent of the earlier direct Shake route, enforce absent-piece zero cases, and independently enumerate every hand/Prize/draw physical allocation in an eleven-card miniature with a `3/1456` direct-fork fraction. The model reproduces the same toy fraction. A separate Python exact-category enumeration independently yielded the quoted four-source values and broad visibility envelopes.

The selected [existing manual-only opening-audit workflow](../../.github/workflows/aichi-opening-audit.yml) now runs these new pure tests and prints the mathematical source report. The compiled CI disposition must be read from its exact run; a green test by itself cannot certify any natural source action.

## Next first missing transition

**Prioritize a naturally selected source rank16, source-going-second original-Store trace** if this strategic branch matters in the selected challenger comparison. At the first original source turn, record the owner-visible availability and placement of Budew, Trubbish, Float Stone, Boost Shake, Garbodor after search, and whether source actor selected an actual Itchy Pollen attack, equipped Shake evolution, or another line. Trace real paper costs and the next opposing owner decision. Retain failed, absent and censored opportunities. Source rank8 has a registered 128-pair VIP/Secret Box native cohort with three actual VIP-before-Box roots; its witnessed opportunities must remain separate from the current direct-only combinatorics.

The source rank16 contains two Budew and two Boost Shake, making this specific physical fork possible. Rank11 and rank22 lack one of the two named components, so this particular first-turn fork cannot occur in those exact original sixties. Those decks have other dangerous lock/attack routes and remain strategically distinct.

**Qualification:** This is an exact resource coavailability calculation conditioned on Basic-valid opening hands. It excludes start-seat odds, prizes drawn through attack, mulligan bonuses, any tutoring or card draw, Bench occupancy, opponent effects, real root selection, Tool-target legality under locks, simultaneous Abilities, native implementation, game clock and complete opponent competency. **Zero competitive-qualified games, zero demonstrated 99.5% win rate, and ranks 23/25/28 still lacking authenticated original sixties.**

## Compiled first-node witness and subsequent expanded envelope tests

The initial direct-only version (head `9deb3fe7ed278c9fb3866cc7e12b21b7ce35e4ed`) was exercised in [manual opening-audit run 41505413512](https://github.com/FlareZ123/experiment-01/actions/runs/41505413512). Its actual `audit` job log at 18:57:44 UTC shows **four/four new Node tests passed**, including all printed-source fractions, proper-subevent containment, eleven-card physical brute enumeration and negative-control requirements. The script printed the exact 0.113577% and 0.414363% values. All subsequent audited steps reached artifact upload at 18:58:01 UTC, creating artifact [13170363217](https://github.com/FlareZ123/experiment-01/actions/runs/41505413512/artifacts/13170363217). **The overall GitHub workflow was eventually marked cancelled at 19:03 UTC**, so no overall green conclusion is asserted; this is a direct job-log test witness.

The subsequently committed visibility-envelope extension, `requireDirectPieces:false`, and its additional expected-fraction assertions are newer than this particular pinned run. Their rank8 and rank16 exact fractions were cross-checked with a separate Python enumeration but are **not** covered by that particular compiled CI test packet. Any later CI qualification must use the exact newer source commit.
