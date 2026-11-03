# Agent 43: correcting the false "forced Active Muk" opening classifier

**3 November 2026 | independently checked exact finite-deck arithmetic | 0 native games in this experiment | 0 competitively qualified games.**

## Falsified modeling assumption

The historical `candidateForcedActiveMuk()` field `directForcedMukAmongBasicValid = 2.9657930129%` counts hands whose **only Basic species in the opening seven is Alolan Grimer**. It includes two physical Grimer in the seven, permitting a second Grimer on the Bench before Boost Shake. Even the previously improved **2.7939290945%** category of exactly one Basic Grimer in the opening seven includes cases whose ordinary eighth draw is another physical Grimer. Because Boost Shake can evolve a Pokémon played to the Bench during the same first turn, the eighth Grimer can likewise become the Benched Stage 1 target. These are distinct playable geometries.

The unchanged Apex Alchemy v0 counts used here are 2 Alolan Grimer, 2 Alolan Muk, 3 Boost Shake, 4 Mysterious Treasure, 3 Quick Ball, 10 other Basic Pokémon, 36 other cards. The original rank6 comparison retains the unchanged 4 Iron Thorns ex, 2 Guzma & Hala, 2 Tag Call, singleton DCE and Thunder Mountain Prism Star.

## New exact opening partition

Each probability below is conditional on a **Basic-valid original starting seven** (no mulligan). After the seven, count one ordinary eighth draw and put six random cards face down as inaccessible Prizes. The direct line must have Boost Shake among the first eight and at least one Muk **still in the deck** after those Prizes. Every number is an access event; payment, legal action sequence and opponent response are unspecified.

| Event | Conditional probability |
| --- | ---: |
| Historical Grimer-only **species** opening seven; direct Muk resource opportunity | 2.9657930129% |
| Exactly one physical Basic Grimer in opening seven, no other Basic; direct Muk resource opportunity | 2.7939290945% |
| That singleton Grimer starter, but **second Grimer is ordinary eighth draw**, so a Benched Grimer is directly placeable | 0.0477525368% |
| Exactly one opening Grimer **and no second Grimer in the first eight**; direct Muk resource opportunity | **2.7461765577%** |
| Subset of 2.74618% holding Mysterious Treasure or Quick Ball among the eight, with a second physical Grimer **and** at least one Muk surviving the six Prizes | **1.5578512181%** |
| Remaining direct category without either naturally available second Grimer or demonstrated held-Item access to search one | **1.1883253396%** |

The 1.55785% category only establishes a potential search route. Mysterious Treasure and Quick Ball both require an **actual one-card discard**, may be Item-locked, and compete for available cards and timing. Search access has neither been paid nor strategically evaluated. The remaining 1.18833% **does not prove Muk must be Active**: other mobility, subsequent card effects or player decisions are unmodeled. A second Basic of another species drawn eighth cannot by itself Bench the already Active Grimer without movement, which is another reason to model the exact physical sequence.

## Method and independent proof

The first implementation enumerates every multivariate hypergeometric eight-card composition of seven disjoint categories `[2,2,3,4,3,10,36]`. Given each first-eight composition, the conditional chance that the last card was the unique Grimer or the unique other Basic is obtained by its category multiplicity divided by eight. For each resulting valid seven, six Prizes are sampled exactly from the 52 unseen cards. Let `P_all(n)=C(52-n,6-n)/C(52,6)`, the probability all `n` particular remaining cards are Prized. With `m` Muk left outside the first eight, `1-P_all(m)` is the availability of at least one Muk, and `1-P_all(m)-P_all(1)+P_all(m+1)` is the simultaneous deck availability of a specific other Grimer and at least one Muk.

An **independent Python Fraction enumeration** instead enumerated the full seven-card composition first, then every legal category of eighth draw from the remaining 53 cards, then exact six-Prize probabilities. It returned the same unconditional strict no-natural-Bench-Grimer probability `0.02222627079357269` and conditional `0.027461765576784137`. Node's original first-eight enumeration gives `0.027461765576784123`; difference is floating-point roundoff.

For a *separate*, already published original rank6 first-eight resource opportunity of `32.9109095975%` conditional on its Basic-valid seven, the independent-shuffle product with the newly isolated **2.74618%** candidate no-natural-second-Grimer category is **0.9037916843%**, compared with the historical broader 0.9760694573% and initial-seven-only correction 0.91950748%. This joint resource conjunction is **not** a source KO, success or win probability: source Guzma & Hala's physical two-card payment, timing, Prizes, source choices, candidate mobility, opponent mulligan bonuses, and genuine games are outside the screen.

## Code, verification and limitations

- `simulation/evaluation/agent43-muk-thorns-firstturn-collision.cjs`: preserves the historical `candidateForcedActiveMuk()` output for audit compatibility and adds explicitly scoped `candidateMukBenchGeometry()` with separate metrics; corrected JSDoc warns that the legacy method is a **species-only classifier**.
- `tests/agent43-muk-thorns-firstturn-collision.test.cjs`: numerical regression of the complete partition and unchanged historical rank6 source access.
- Existing manual-only [global field gate run 41716574696](https://github.com/FlareZ123/experiment-01/actions/runs/41716574696), head `53c4e6a7f3edbd8d100e25117d17f3154ce24e31`, shows **all three Agent43 targeted Node SFT files passed**, including the corrected classifier. The overall workflow **FAILED** later on two unrelated Agent30 source-registration/Prize-count assertions; this report does not label the global gate green.
- Structural fixed 60 remains `21846db95f88d5d5abc6ee3876b3522732092e27ca5e7485948f354d8468a769`. No deck card changed. No new native match was run, no paper win was certified, and no field performance estimate is implied.

**Decision:** any paper policy or simulator using the historical `directForcedMukAmongBasicValid` field as the probability of an unavoidable Active Muk is incorrect. Even the refined strict-natural route is only an access filter. Re-evaluate bench setup using actual available search Items, their discard costs, the paid Boost Shake target, and the opposing game continuation.
