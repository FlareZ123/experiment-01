# Agent 42: original 32-arm Aichi scout source-root action attrition

**30 October 2026. Posthoc read-only audit of an existing, previously preregistered sample, not new match results.** Both rank-6 and rank-11 original opposing 60s are fixed, exact source inventory. **Competitive-qualified games: zero.**

## Provenance and complete denominator

Source: Agent41's prospective **32-arm** two-candidate original-Store scout, frozen registration `results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. No extra seeds, dropped failures, updated policy, or selected favorable outcomes. Original successful [GitHub Actions run 40918541683](https://github.com/FlareZ123/experiment-01/actions/runs/40918541683), [artifact 12917901362](https://github.com/FlareZ123/experiment-01/actions/runs/40918541683/artifacts/12917901362). Downloaded ZIP SHA256 `55ef8029bce341803da3f895246509cc61480e42a840d35fe34d6ab12f294ad2`, original inner `agent41-prospective-canonical-32.json` SHA256 `d1f0b3663121592f3cf41a022f648cacff7e99fc3b74ee05cf54cbdea26984d7`.

Independent read-only census joins **each physically source-seated root action**, including every `PassTurnAction`, to the existing `sourceOwnerPostPassMobility.observations` by exact monotone action ordinal. The 32 individual native pass counts and all individual ordinal sets matched without exception. `PlayCardAction` and `AttackAction` are counted only for the actual **source seat**, never for the candidate or resolving prompts. Source-first strata are the **actual native first player** after the setup coin and mulligans. Observations are after an action has been selected, and can include the actor's own hand only for retrospective diagnosis; they are never introduced into a competing actor's decision observation.

[Reusable pure complete-denominator auditor](../../scripts/agent42-prospective-source-root-audit.cjs), with [pure synthetic tests](../../tests/agent42-prospective-source-root-audit.test.cjs). The analyzer takes the archived JSON's `developmentResult.rows` without filtering. Its native original-Store outputs were independently checked by a separate direct JSON/ordinal census. The new pure tests have **not** yet had a subsequent shared CI run; do not represent them as compiled-native validation.

## What the original 32 games actually contain

| Source rank | Registered source-inventory game arms | Actual source-first | Native terminals / action caps | Source PlayCard roots | Source Attack roots | Source Pass roots |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 6 Iron Thorns | 16 | 14 | 10 / 6 | **36** | **5** | **324** |
| 11 Absol Garbodor | 16 | 12 | 10 / 6 | **139** | **199** | **153** |
| **Total** | **32** | **26** | **20 / 12** | **175** | **204** | **477** |

These are raw native action counts from bounded simulated development games, *not* competitive game outcomes or estimates. Multiple turns and source-root passes can belong to the same game, and candidate inventory changes can alter game length; treating 477 passes as 477 independent competitive observations would be invalid.

### Why the rank-6 source was weak

- **16/16** rank-6 arms had a first source-turn `PassTurnAction` and **zero source PlayCard roots that first source turn**. **14/16** had the source going first, when particular first-turn Trainer restrictions apply. Therefore an initial pass alone is not proof of an error.
- Across **all** source turns, only **five** source `Volt Cyclone` declarations occurred, matched by exactly **five** copies of each direct-line connector `Tag Call`, `Guzma & Hala`, `Thunder Mountain Prism Star` and `Double Colorless Energy`. All five attack declarations came from a line in the existing source audit; the other 11 source arms have no such completed sequence.
- After a successful attack, source policy can still repeatedly pass on later turns. The 324 source passes in the combined sample vastly exceed the five attacks; the original runner's 260-root cap creates a long, unstable tail. This is a pressure/continuation policy gap. Neither the source's deck contents nor any one action's legality can be deduced solely from an absent PlayCard.

### Why the rank-11 source's alternative resource actions merit inspection

- **14/16** rank-11 first source turns ended with a Pass; the other **2/16** were an authentic original-Store `Trubbish -> Float Stone -> Boost Shake` line on source-going-second, which closes the first turn by the Trainer effect. The auditor correctly treats those **as non-Pass endings**. There are **zero** completed source-first Boost Shake openings in the 12 source-first arms, consistent with the earlier source-pressure report.
- Across all 16 arms, **153 source passes** were recorded, of which **135** had at least one `Float Stone`, `Guzma`, or `Escape Rope` in the source player's **own physical hand at the moment of passing**; **125** of those 135 had a nonempty own Bench. In the first six global turns, rank 11 had **41** passes; **27** had some held mobility, including **21** with an own Bench.
- Those figures reveal **hand-and-board action availability worth checking**. They do **not** prove that using a held card was legal, timely, strategically good, or capable of improving the game; Item/Supporter lock, the Supporter quota, forced board positioning, and source card text must all be considered. In many cases `Guzma` is held while an own Bench is empty; such cases are not positive controls. Do not automatically move a held mobility resource ahead of a damaging attack or treat a theoretical connector as success.

### Early-game normalization

| Original source | All Pass roots in first 6 global turns | Passes with source-held mobility in first 6 | All Pass roots | Held-mobility Pass roots | Held-mobility Pass roots with own Bench |
| --- | ---: | ---: | ---: | ---: | ---: |
| 6 Iron Thorns | 43 | 6 | 324 | 240 | 126 |
| 11 Absol Garbodor | 41 | 27 | 153 | 135 | 125 |

For the rank-6 source, the 240 held-mobility passes were **Guzma only** (no held Float Stone or Escape Rope), often with no Bench. That is a critical **negative-control distinction**; it would be misleading to aggregate all rank-6 held Guzma passes into alleged usable switch opportunities. The rank-11 source has many authentic held Float Stone/Escape Rope states but still needs native Card/Tool-lock verification before suggesting intervention.

## Next falsifiable experiment

Find an **actual rank-11 original 60, source-seat root** among the archived `sourceOwnerPostPassMobility.observations` where the source holds `Float Stone` or `Escape Rope`, has a Benched potential attacker and the public board does not block Item/Tool play. Freeze that **specific native physical state**, authenticate the source's own physical card, native timing, Active/Bench identity and lock conditions, then fork (A) the recorded Pass and (B) a Store-accepted owner-owned mobility action. Track owner root continuation and opponent reply, retaining failures, side-of-seat symmetry and the physical-deal fingerprint. Only afterward consider a general root-policy change. Agent41's existing canonical owner-root policy should retain execution ownership.

A prospective 32-opponent field benchmark remains blocked by three missing original 60s (ranks 23,25,28), weak source behavior, hidden-information leakage risk, simulator card-fidelity gaps, timeout/clock modeling and policy competence. **No 99.5% result is demonstrated.**
