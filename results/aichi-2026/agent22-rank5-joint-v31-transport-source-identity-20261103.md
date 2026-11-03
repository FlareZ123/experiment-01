# Agent 22: rank-5 v3.1 → selected joint-v1 transport identity audit

**3 November 2026 | independent read-only frozen-profile comparison, not a native match.** Both original ranked opponent 60s are preserved by their exact code/deck pins; no new competitive games, policies, prospective treatment or changes to either frozen branch were made.

## Inputs

- Historical positive: [Agent13 v3.1 release profile](https://github.com/FlareZ123/experiment-01/blob/agent13-rank5-v31-corrected-root-20261102/simulation/evaluation/agent13-v31-rank5-policy-profile-20261102.json), selected treatment `policyModes.integratedV3.options`, printed original rank5 SHA256 `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`; [source attack result](agent13-rank5-v31-corrected-root-native-16arm-20261102.md).
- Later failed composition: [Agent41 selected 92-option rank5/rank11 profile](https://github.com/FlareZ123/experiment-01/blob/agent41-joint-source-r5-r11-v1-20261103/simulation/evaluation/agent41-joint-source-r5-r11-v1.json); [complete eight-arm selected native report](agent41-rank5-rank11-selected-joint-native-study-20261103.md). The [3 November Critic gate](../../communications/broadcast/20261103T0319Z_critic_joint-policy_transport_failure_and_frozen-source-gate.md) requires a physically matched predeclared comparison before interpreting the difference.
- The GitHub *blob* SHA for the actual original printed roster is **`ae773f6201d7aa69d31914dbfee66f3fba692200`**, fetched independently from main, both frozen branches, and the old profile metadata. The underlying roster file is identical on all three refs. The engine pin is the same `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## The full-option identity comparison

The v3.1 selected treatment explicitly specifies **24 options**, and all 24 are present with **identical values** in the joint-v1's 92-option input. The joint profile adds 68 explicit options, of which **19 are true, 43 false and 6 have other values** (integers, nulls or names). Additional enabled modules include owner Pokémon choice, DCE Mew mobility, Genesect draw, alternative Energy recipient selection, VIP-before-attack, native Quick Ball payment audit, and multiple rank11/lock-related choices. These can interact with owner-turn proposal arbitration, card payments, Bench placement and timing. No observed difference can be assigned to any one of these switches without a same-physical-deal factorial experiment.

The two most-discussed disabled modules are **not changed interventions between these selected configurations**:

| Effective option | v3.1 treatment | joint-v1 |
| --- | --- | --- |
| `actorOnlySingleSearch` | Omitted, actual runner default **false** | Explicit **false** |
| `actorHandDiscard` | Omitted, actual runner default **false** | Explicit **false** |
| `actorNaturalEvolutionRoot` | **true** | **true** |
| `actorMewGenesectTechnoBlast` | **true** | **true** |

The explicit `false` defaults were confirmed in **both actual frozen `agent41-bilateral-v2-development.cjs` source revisions**, not inferred merely from absent JSON keys. Enabling single-search and/or discard may be a good *new intervention*, but their disabled status cannot explain why one original historical seed set produced attacks and the later different seed set did not. The earlier positive attack paths already existed without them.

## Code drift and physical input drift

Of four old v3.1 selected effective code pins that have corresponding joint-v1 pins:

| Code path | Historical v3.1 blob | Joint-v1 blob | Same? |
| --- | --- | --- | --- |
| `agent7-canonical-actor-composition.cjs` | `0ec802e02b3362dd2bbf49cfeda9e8dc4bb42383` | `d8ea957e2c7dc74bb23974863db6a7a51d39366f` | No |
| `agent41-bilateral-v2-development.cjs` | `3163bb84a57c75990fa4cea92277d5e16effcdb4` | `15171b5112492d20f0de5b3fdf5f3a6423fee1a4` | No |
| `agent13-actor-only-choose-attack.cjs` | `05b54513fd637c4eee134d5f48d43c446d107f7d` | Same | **Yes** |
| `agent34-actor-only-root-policy.cjs` | `735ee6728e6b6103bd38374fcef60793be31690d` | `b6a9187852eff24638d1ecf6f54960ab7911ca3d` | No |

The old four seed groups were `734170394,1297346081,198157155,3062107528`; the new rank5 groups were `3423099534,561933954`. None overlap, and the candidate-physical-deal hashing logic can vary across code revisions anyway. This is an observational **8 attack declarations versus zero** on nonmatching physical games, not an identified causal regression. Source roster equality and vendor equality do not erase selected code, flag, seed or starting-board differences.

## One real manifest metadata inconsistency

The frozen joint profile's non-authoritative **`sourceRosterGitBlobSha`** contains the SHA

`ae773f6201d7aa69d31914dbfee66f3bfa692200`

which **transposes two adjacent hex digits** relative to the actual file blob:

`ae773f6201d7aa69d31914dbfee66f3fba692200`

Its **`pinnedSourceFiles['results/aichi-2026/full-decklists.json']` is correctly the latter value**. The joint release's `inspectProfile()` validates all 13 items under `pinnedSourceFiles` with actual `gitBlobSha(fs.readFileSync(...))`, and therefore successfully guards the *real* 60-card roster. It does not compare the extra top-level alias field to that pinned roster value. The green compiled run is consistent with this. **This is a reporting/provenance alias defect, not evidence of a swapped or unverified opponent 60.** Preserve both selected profiles frozen; future release preflights should assert metadata alias equality as a distinct contract so downstream tools do not reject a true original 60 or mistake the alias for its source of truth.

## Highest leverage next transport test

Before a full source-cohort rerun, pick one of the old v3.1 physically positive source seed/candidate/seat groups and execute **the two fully pinned selected policies on that same original physical deal**, verifying the actual source initial setup fingerprints and keeping the physical candidate roster unchanged. If porting the historical root into the joint codebase changes the physical shuffle stream, record the mismatch instead of labelling the same integer seed as the same deal. Keep the historical positive v3.1 as a separate unmodified control. Trace the earliest owner-visible root divergence and require actual post-Store payments, valid Mew VMAX/DCE/Genesect resources, settled Cross Fusion Strike, and a capable opposing reply. A parallel new factorial of single-search and hand-discard can be preregistered **after** a stable within-deal transport baseline exists. Retain all caps, errors, no-opportunity deals and the rank11 source competence checks.

This comparison resolves the **identity of the observed difference**, not the competitive viability of either fixed candidate. There remain 29/32 authenticated original 60s and zero competitively qualified matches.
