# Original Aichi source dynamic-attack audit: actual lookup versus enumeration

**Agent 50, 1 November 2026.** Structural triage with independently compiled runtime receipts. This report does not estimate deck win rates.

## Exact scope and reproducibility

The input is [29 authenticated exact Aichi Top-32 source decklists](full-decklists.json). The [reproducible CJS audit](../../simulation/evaluation/agent50-original-source-pinned-attack-census.cjs) uses the original pinned Twinleaf CardManager under [compiled CI 41357772292](https://github.com/FlareZ123/experiment-01/actions/runs/41357772292). Three [isolated regression tests](../../tests/agent50-original-source-pinned-attack-census.test.cjs) include an adversarial scenario where the enumerated class differs from the executable lookup class. The existing manual full adapter workflow passed, including both-seat original rank19 attack controls.

Each source entry is a distinct Pokémon entry in a decklist, rather than each physical copy. Set number is checked independently of the human-readable printing name.

| Measured event | Final count |
| --- | ---: |
| Authenticated original opponent 60s represented | 29 |
| Original-source Pokémon entries inspected | 309 |
| Native `getCardByName` entries with concrete matching fullName | 286 |
| Entries unmatched by that exact fullName comparison | 23 |
| Entries matched by `getAllCards` registry enumeration | 268 |
| Prototype differences between enumeration and executable lookup, where both matched | 268 |
| Entries with `x`, `+` or `-` printed damage calculation | 52 |
| Distinct exact printings among those dynamic entries | 16 |
| Original decklists represented among the 52 entries | 24 |
| Dynamic entries whose executable prototype owns a specialized `reduceEffect` | 0 |

The 23 unmatched fullNames include several Mega Evolution ex, Prism Star, and older GX/V printings. These observations may arise from aliases, catalog registration, or missing native support. **They do not demonstrate that 23 Pokémon are unavailable or unplayable.** Resolve each through the same exact-source deck-loading path before treating it as an engine-coverage failure.

## Important rejected inference

An earlier enumeration-only run [41356464870](https://github.com/FlareZ123/experiment-01/actions/runs/41356464870) appeared to find 245 card-own reducer entries and no problematic dynamic-damage entries. It missed the already reproduced rank19 Bellowing Thunder issue. That was a method error: the enumerated CardManager objects and the classes returned by the executable card lookup differ. A second intermediate run overcounted executable lookup hits because `undefined` was compared only against `null`. The final audit uses a nullish check and actual executable lookup.

The reverse shortcut is also unsound. Across these 286 matched executable source entries, zero classes own `reduceEffect`, **yet a physical native positive control proves that some important attack effects still work** via inherited or generic handling. Therefore the count of 52 is a **test-priority queue**, neither a count of 52 broken attacks nor a fraction of supported abilities.

## Sixteen dynamic printed attack candidates

- Lillie's Clefairy ex JTG
- Tapu Lele-GX GRI
- Marshadow UNB
- Vileplume-GX CEC
- Galarian Stunfisk SSH
- Regirock XYP
- Rotom V LOR
- Electrode-GX CES
- Gengar & Mimikyu-GX TEU
- Wobbuffet PHF
- Sableye V SSH
- Oranguru V ASR
- Pikachu XY
- Raging Bolt ex TEF
- Minior PAR
- Radiant Alakazam SIT

Some already have native physical tests elsewhere in this repository. Each candidate needs a paper-valid staged board with a predicted effect, owner decision/prompt evidence, actual physical outcome and a positive control where applicable. The list establishes prioritization and source reach, not a claim of absent support.

## Confirmed rank19 differential and next gate

The [Raging Bolt report](agent50-rank19-raging-bolt-public-basic-energy-20261101.md) contains the exact rank19 source printing, the owner-public optional nominal KO policy and the native control receipts. Both physical seats offered Bellowing Thunder, advanced through exactly three WaitPrompts and ended their attack turns without discarding Basic Energy or changing the defender's 90 pre-existing damage, despite two Basic cards being enough for a nominal knockout. In contrast, **Burst Roar** on the same printing genuinely drew six owner cards and removed six from deck in both seats. The final CI also required original **TEF 123** rather than relying solely on the card name.

A paper attack may legally choose zero cards for an optional any-amount discard. Thus a zero result alone does not prove an engine defect. The missing observable nonzero payment pathway makes the current bot and native result unsuitable as validation of its nominal knockout proposal.

Next useful work is to establish native nonzero Basic selection and prompt/payment settlement under a reversible adapter, then verify damage, KO, Prize handling and source-opponent reply, alongside targeted runtime tests of other repeated dynamic printings. **Benchmark remains 29/32 exact source 60s, zero competitively qualified games and no evidenced 99.5% performance.**
