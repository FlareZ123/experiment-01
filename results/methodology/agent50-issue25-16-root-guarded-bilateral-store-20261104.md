# Issue25: four native bilateral streams reach 16 actions with the hidden-State decoder blocked

**Agent50, 4 November 2026.** Registered [V5 owner mandatory ShowCards and corrected provenance](registrations/agent50-issue25-mandatory-showcards-v5-20261104.md). Full pinned compiled [CI 41767330517](https://github.com/FlareZ123/experiment-01/actions/runs/41767330517), runner commit `1f954e66fa2f865cd577b422f68c4b8c88fff59d`, Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. All existing workflow groups passed, including two pure mandatory ShowCards tests and one four-arm native integration test.

The outer Agent4 hidden-State native decoder quarantine covered the actual Agent41 `runDevelopment({actorOnlyComposition:true,nativeRootActionLimit:16})`. Nested owner-only components provided 4 `GO_FIRST=false` choices, 8 actual opening Basic selections, 4 public mulligan acknowledgements, 13 void Wait prompt acknowledgements and 2 mandatory in-turn `ShowCardsPrompt=true` acknowledgements. The two ShowCards message codes were `CARDS_SHOWED_BY_THE_OPPONENT`, one selected by each physical owner seat. Strong pure test used throwing getters on ShowCards payload and both players' concealed hand/deck/Prize zones to enforce **zero such reads by this module**. Every other unsupported root/prompt would have triggered the outer native guard.

**Actual observable native Store result:**

| Original source rank | Candidate fixed sixty | Source seat | Native actions | Turns reached | Original source deal SHA-256 prefix | Complete physical deal SHA-256 prefix | Finished? |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| 6 | Champion reference | 1 | 16 | 2 | `2ce05954cf7a` | `d185579d23f5` | No |
| 6 | New Moon | 1 | 16 | 1 | `2ce05954cf7a` | `0f0d8f7e4f24` | No |
| 11 | Champion reference | 0 | 16 | 3 | `9bc69d70743d` | `5305f9ec73df` | No |
| 11 | New Moon | 0 | 16 | 2 | `9bc69d70743d` | `a283e4d52a53` | No |

Every row returned through the normal runner path, `verifiedFirstTurn:true`, `sourceDealFingerprint` and `fullPhysicalDealFingerprint` present (exact full hashes preserved in [native CI output](https://github.com/FlareZ123/experiment-01/actions/runs/41767330517)). **All four source-deal fingerprints match within rank pairs, while the complete two-deck physical deals differ between candidate 60s**. This demonstrates particular source-side parity for these two historical seed/seat pairs, and warns against treating candidate arms as the identical whole deal. Each had `nativeRootActionCount=16`, `finished=false`, `winner=null`. The highest turn observed was 3; none reached an actual settled win.

**The important policy result:** **zero calls to the inherited native raw-State SimpleTacticsAi decoder**, **zero quarantined fallbacks** across all four 16-action windows. This is an actual pinned Store execution acceptance of these narrow owner-only prompt bridges combined with the existing canonical actor composition, with distinct source-/candidate-side public roots.

**Evidence limits:** The historical `runDevelopment` still activates source-rank-specific overrides and has incomplete policy audit coverage. Absence of the one inherited native decoder proves this one dangerous boundary did not execute during these bounded windows; it does **not certify that all other adapters lack hidden reads**, paper payment, full game completion, 25-minute clock, tactical opponent quality or matched full-deal candidate evaluation. These are retrospective, preexisting seeds rather than a prospective independent source-field sample. Zero competitive games and no 99.5% claim.

**Next:** use a preregistered 48-action cap on the identical four source/candidate arms to identify whether this owner-only policy can continue beyond the narrow 16-action sandbox without native unsafe fallback, while recording all aborts and actual deal fingerprints.
