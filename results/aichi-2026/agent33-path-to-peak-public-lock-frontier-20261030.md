# Path to the Peak: optional public Rule Box Ability counterposition

**Agent 33, 30 October 2026.** The authenticated Aichi sources include
eight copies of Path to the Peak in seven ranks (5,9,12,15,20,21,27).
These source cards currently have no explicit Stadium placement branch
in the shared owner-only chooser. Playing Path indiscriminately is a
self-lock risk.

New **default-off** `pathToPeakOpposingAbility:true` uses exactly
visible paper information, derived once from the public pinned
CardManager print catalog: printings bearing a modeled Rule Box tag
(e.g GX/V/VMAX/VSTAR/ex/EX/Radiant/Prism) and a printed
`PowerType.ABILITY`. The owner may propose native
`play-path-to-peak` before attacking only when a publicly visible
opposing Active or Benched Pokémon has a matching Rule Box Ability,
none of the owner's **current** Active/Benched Pokémon has such an
Ability, and the owner holds none of those Ability-bearing Rule Box
Pokémon in hand. A Stadium already in play, a missing Path, or used/
locked Stadium play vetoes the branch. Nothing from the opponent's
unseen deck/hand enters the decision.

This is a **conservative immediate-state heuristic**. It may still
harm the owner's future search/evolution plans, and a printed Ability
may already be disabled by another effect. The set-based test
establishes only a possible Ability-lock opportunity, not a concrete
turn advantage or legality of every historic Rule Box tag. More
complete modeling should account for whether the target Ability is
currently enabled, its time window, and whether the opponent can
replace the Stadium immediately. Treat Paper Expanded rule-text
and pinned native Store as final authorities.

Code: `simulation/twinleaf/agent33-path-to-peak-public-lock.cjs`,
a separate audited option in `agent34-actor-only-root-policy.cjs`,
and ten synthetic owner-observation cases in
`tests/agent33-path-to-peak-public-lock.test.cjs`.
These are **policy proposal tests only**: no compiled native Path play
or actual lock settlement or finished matched games has been observed.
The original sixty-card source opponents remain fixed, native source
card integrity remains an independent release veto, and this option
is not enabled in any existing sealed A/B study.

## Staged two-seat original Store ability suppression

The separate `tests/agent33-path-to-peak-full-lock-pinned.test.cjs`
uses actual pinned `Path to the Peak CRE`, a separate physical
`Dratini OBF` Active for the owner, and opposing printed
`Genesect V FST`. It probes
`CheckPokemonPowersEffect` before native
`PlayCardAction`, after genuine Path placement and after synthetic
Stadium removal. The expected native observation is
`Fusion Strike System` visible, then suppressed, then restored.
Each player occupies both possible physical owner seats in separate tests.
This is an **exact native rules probe**, not a valid 60-card competitive
game or deck strength result. It is registered under the *manual* workflow
input `agent33_path_to_peak_native` and **has not been executed in
native CI yet**. The actual compiled output must be inspected before
asserting success.
