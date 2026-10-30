# Native GX/EX printing aliases can suppress public Rule Box classification

**Agent 42, 30 October 2026.** Evidence class: observed pinned original-Store printing, frozen source-card inventory census, printed-card database lookup, and an isolated Node 22 pure contract smoke test. **No newly completed full games, naturally dealt action-policy study, or competitive win-rate claim.** This note follows [the fully native Buddy Pulse winner-reversal proof](agent42-buddy-pulse-two-prize-native-20261030.md).

## Observed mismatch and why it matters

The actual pinned original Store `actorObservation` returned **`Dedenne GX UNB`** as the face-up Pokémon `printing` on *both* physical seats. This was independently archived in [native workflow 40998043115](https://github.com/FlareZ123/experiment-01/actions/runs/40998043115), JSON `agent42-buddy-pulse-two-prize-native.json`, SHA-256 `62283cfeb3f0315b65f1b2b4aa6b161dbcb7b7afca2cdd7efdd1b0a7b72bb4f3`.

The provided exact English card database has card `sm10-57` named **`Dedenne-GX`** with a printed GX Rule Box. Consequently the existing public printing map `buildPublicPokemonProfileIndex` indexes **`Dedenne-GX UNB`**. Its original `visiblePrintedProfile` function performed only an exact `Map.get` after a diamond-symbol normalization. It returned `null` for the native **`Dedenne GX UNB`** identity.

The same mismatch is independently present in the **pinned** Twinleaf source for `Mewtwo EX NXD`: the card database's `bw4-54` is named `Mewtwo-EX`, while the engine `fullName` uses `Mewtwo EX NXD`. Importantly, **not all** GX/EX printings use spaces; pinned Tapu Lele GX and some other prints retain hyphenated fullNames. Therefore a safe public classifier must support both spellings and preserve any exact-match result first.

This matters because `agent17-public-context-special-energy.cjs` consumes `visiblePrintedProfile` when building public `hasRuleBox`, `isEvolution` and `isPokemonGXorEX` context. `actor-energy-payability.cjs` explicitly returns **unknown** for Counter Energy under a Prize deficit if GX/EX status is not established. Unknown is a conservative fallback, but it needlessly discards known public printing information and can alter the accessible action frontier. The canonical actor wrapper attaches the profile index when the public-context Special Energy opt-in is enabled; this patch can therefore change decisions in development-only, opt-in native profiles. Such effects have **not been measured**.

## Original Aichi field prevalence, without native-alias extrapolation

From the unchanged [29 complete exact published field lists](../aichi-2026/full-decklists.json):

| Printed card name | Complete opponent ranks containing it | Total exact-list copies |
| --- | ---: | ---: |
| `Dedenne-GX` | **18 / 29** | **22** |
| `Tapu Lele-GX` | **18 / 29** | **20** |
| Any `-GX` or `-EX` card | **24 / 29** | Not used as an alias estimate |

This **does not** mean every such Pokémon has a mismatched native name. The specifically witnessed `Dedenne GX UNB` card is frequent in the frozen opposing inventories, while `Tapu Lele-GX` may already match the card database exactly. Original ranks 23, 25 and 28 are still absent; the denominator must not be treated as 32.

## Minimal conservative correction

The repository's [public printed-profile lookup](../../simulation/twinleaf/agent10-original-printing-energy-flags.cjs) now:

1. checks the original exact indexed printing first, including any intentionally ambiguous `null` entry;
2. only for unrecognized `<name> GX <set>` or `<name> EX <set>` strings, checks whether the **known exact public index** contains `<name>-GX <set>` or `<name>-EX <set>`;
3. leaves all other unmatched names unknown.

It never fabricates a Rule Box, modifies card names or rewrites upstream simulator printings. It preserves the invariant that the card database must contain the precise canonical name/set key and independently consistent GX/EX attributes; no unrestricted fuzzy matching is added.

New pure tests in [agent10-original-printing-energy-flags.test.cjs](../../tests/agent10-original-printing-energy-flags.test.cjs) check authentic Dedenne GX and Mewtwo EX aliases against database profiles, correct Counter Energy exclusion, unrecognized aliases, ambiguous `null` and exact-match precedence. A separate **5/5 isolated Node 22 contract smoke** with the exact replacement lookup logic and known database-derived aliases passed locally. These new committed tests **have not yet received full-repository CI execution**; the previous native suite predates this profile lookup edit. The relevant tests were added to the existing manually dispatched actor-root workflow for subsequent review. No extra workflow or automatic trigger was introduced.

## Limits and next checks

- Run the newly registered pure tests with actual checked-out `resources/cards/en/` and `resources/sets/en.json` in CI; confirm no unexpected alias or ambiguity resolution changes. The local isolated smoke establishes only the exact changed lookup contract.
- Audit a sample of the 29 exact opponent field's **real engine** GX/EX `fullName` values, rather than assuming all 24 relevant source ranks use space aliases.
- Consider carrying verified printed Rule Box and prize-award metadata directly in the detached public actor observation, with explicit provenance and absence behavior. The current optional two-Prize veto still uses conservative name heuristics.
- Use source-dealt paired native evidence before inferring that alias recognition improves move quality. **29/32 exact opponent 60s, 0 competitively qualified games, and no demonstrated 99.5% fixed-list benchmark.**
