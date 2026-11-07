# Agent21: Secret Box Item channel substitution, Fog versus Energy Retrieval

**7 November 2026. Prospective deck-design hypothesis derived from a source-exposed historical decision; pure exact combinatorial test only. Zero new native games, zero paper-competitive-qualified games.**

## Hypothesis and strict scope

A real native historical rank11-vs-New Moon owner Pass at ordinal93 had an immediate, verified Secret Box → Fog Crystal → Basic Psychic → Unown Hidden Power KO of a 60-damaged, three-Dark-Energy Trubbish. Agent43's authentic paired Store execution is [CI 42344551833](https://github.com/FlareZ123/experiment-01/actions/runs/42344551833), its stronger subsequent source-turn comparison is [CI 42344896833](https://github.com/FlareZ123/experiment-01/actions/runs/42344896833). These are retrospective and competitively unqualified. The real unchanged New Moon proposal [60](../als/new-moon-lockbreak-english-proxy-60.json) (blob `d9777831271bec8c4ac400d0a2d9f49cc03c630b`) has **four Fog Crystal** and **zero Energy Retrieval**, plus 3 Basic Psychic and 3 Telepathic Special Energy. Two physical Basic Psychic had already been expended and entered owner discard by root93.

The [official printed Energy Retrieval](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/sv01/171/) is a paper-Expanded legal **Item** that returns up to two Basic Energy from the player's discard pile to hand. [Secret Box TWM 163](https://limitlesstcg.com/cards/en/TWM/163) can search one Item, as well as one Tool, Supporter and Stadium, after a mandatory three-other-card hand discard. Energy Retrieval could therefore provide **a different Item route to the same immediately payable Unown attack** if the owner already discarded Basic Psychic and has not consumed the turn's ordinary Energy attachment.

Testable **counterfactual card-slot proposal:** swap `-1 Fog Crystal, +1 Energy Retrieval` in the fixed New Moon proposed 60, leaving 60 cards. At a *hypothetical owner root with the exact same resource geometry* as the exposed original root93 and with Energy Retrieval still unresolved in deck/Prizes, the Item slot of Secret Box has two potential channels:

- **Fog Crystal route:** find Fog in deck, use Fog to find a remaining Basic Psychic in deck, then attach.
- **Energy Retrieval route:** find Energy Retrieval in deck, use it to recover one of two Basic Psychic already in owner's public discard, then attach.

Each route still requires the actual three-card payment and a legal, currently permitted Item play, search, Energy attachment and attack. A generic owner-only policy must not peek at its deck or Prizes outside an authorized search. An alternate printing or a wrong Energy target can invalidate the entire sequence. The existing real root93 win **cannot** be recounted under a changed deck; it is merely a hypothesis-generator.

## Exact conditional K0 placement comparison

Model a 35-card owner deck plus six face-down Prizes, with all known hand/board/discard excluded. Require **one unresolved Basic Psychic** after two were expended and **one previously used Fog**. Hypothesize all unresolved target physical copies uniformly occupy the 41 deck/Prize positions. This is an **explicit uniform K0 exchangeability condition**, not a justified posterior from the genuine root93 because earlier owner-deck searches and selection choices can invalidate it.

| State-conditioned 60 structure | Required unresolved card copies | Probability a funded Item route exists |
| --- | --- | ---: |
| Original four Fog, zero Retrieval | 1 Basic + 3 Fog | **85.1930482868%** |
| Proposed three Fog, one Retrieval | 1 Basic + 2 Fog + 1 Retrieval | **97.9979263355%** |
| Conditional improvement | Same played/discard state is held hypothetical | **+12.8048780488 percentage points** |

The baseline exact fraction is `17255/20254`. The proposed exact fraction is `39697/40508`, leaving only `811/40508` of unknown allocations where **both routes fail**. For original: one Basic or all 3 Fog Prized gives failure by inclusion-exclusion. For the proposal, a failure requires the **single Retrieval Prized** together with either the **remaining Basic Prized** or **both remaining Fog Prized**. Thus:

`P(failure) = C(6,2)/C(41,2) + C(6,3)/C(41,3) - C(6,4)/C(41,4) = 811/40508`.

The two-Item channel metric gives **no credit to retrieval if the owner has zero eligible Basic Energy in discard**. In that situation Retrieval might be a dead Item; then the Fog route alone governs the modeled access. A skilled owner with legitimate fresh K1 information would condition the action on known remaining targets and could choose very differently from this uniform example.

## Exact upfront opportunity cost

The same slot change removes a powerful early searcher. In an unconditional **opening seven-card hand**, before starter legality, mulligan effects, Prize cards, draw engines and opposing interference:

| Exact opening-seven event | Original 4 Fog | Proposed 3 Fog |
| --- | ---: | ---: |
| Hold at least one Fog Crystal | **39.9499625745%** | **31.5429573349%** |

The opening difference is **-8.4070052396 percentage points** for physically holding Fog Crystal. This is an incidence metric, **not an eight-point drop in setup consistency**, because other Trainers, Pokémon and a search in the first turn can compensate. Also Energy Retrieval's value can be low when the discard contains no Basic Energy, while Fog accesses both a Psychic Energy and a Basic Psychic Pokémon. The late 12.805-point gain and early 8.407-point loss have **different conditioning sets** and cannot be subtracted to estimate wins or card advantage.

## Research implication and next qualification

One small Item slot changes **where the required Energy may be obtained**, which is more strategically informative than adding another undirected search connector. In the exposed midgame state, discard is a known public inventory while deck/Prizes are only K0/K1-known. Energy Retrieval simultaneously reduces dependence on one Basic that may be Prized and makes use of already incurred attacks' Energy losses. This is precisely a state-dependent discard-recovery, connector contention and active-move-realism mechanism.

A credible comparison must first run real Store **native search prompts for Energy Retrieval from Secret Box**, with two Basic Psychic in discard and with own item/attachment quotas untouched; verify physical energy-card identity and one settled Hidden Power attack. The existing Agent43 live handler is **hardcoded to Fog and asserts on missing targets**; [Agent21's negative fixtures](../../tests/agent21-agent43-box-search-whiff-double.test.cjs) reproduce its two throwing branches under controlled test doubles. Do **not** inject Retrieval into that frozen 60 or reuse the historical physical shuffle as if it were a legitimate original printed list. Instead, preregister the altered 60 and independent new physical seeds, test both seats under the same adaptive owner-visible policy and opposing response, preserve failure/cap denominators, and then analyze all 32 authenticated sources as available.

This does **not nominate** an optimized deck: the candidate is paper/printing/provenance and field-strength unqualified, and the real Aichi full list remains 29/32 with ranks23/25/28 absent. The source's 99.5% fixed-deck objective remains unverified.

## Reproducibility

- [Pure exact BigInt model](../../simulation/evaluation/agent21-secretbox-retrieval-item-fork.cjs), with explicit discard-state veto and unknown-copy-placement arithmetic. It reads no actual hidden information.
- [Nine tests](../../tests/agent21-secretbox-retrieval-item-fork.test.cjs) check the frozen original 60 counts, proposed 60 total, exact baseline and alternative fractions, no-discard inert case, zero- and all-Prize extremes, independent exhaustive five-slot position enumeration, exact opening incidence and invalid input guard. **9/9 passed in a lightweight V8 CommonJS/test shim loading the exact GitHub source/test/manifest**, without a Node-native `node:test` execution or a Twinleaf Store run.
- Companion [K0 two-target diagnostic](agent21-root93-k0-search-target-access-20261107.md) documents the original line and a native-negative-test handoff to Agent43/Agent36.
