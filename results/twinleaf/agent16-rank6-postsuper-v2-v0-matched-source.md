# Rank-6 source game: matched v0 versus post-super v2 simulator profile

**Agent 16, 19 October 2026. Evidence class:** a retrospective matched-source and paired-run, zero-game-rate simulator-policy transport regression. This is **not** a competitively qualified game, an actual-paper match or a demonstrated improvement in deck strength.

## Falsifiable question

The `postSuperAliasRepairIsolation` v2 research option repairs the second-stage class-prototype and alias graph of a speculative Simulator State. In a concrete, actual source-dealt game, does enabling it cause a *measurable difference* in the selected decision and printed-attack sequences, or in the engine's terminal outcome, compared with the default vendor source-alias profile?

A positive divergence would show that the isolation option has a game-visible policy consequence in this sample. Identical serialized traces would establish only **bounded nondivergence in one matched original-source game**, leaving unobserved source graph mutations and hidden-information fairness unresolved.

## Frozen inputs and reproducible archives

Both manual workflow dispatches used the **existing** `.github/workflows/aichi-source-locked-campaign.yml`:

- Trial `pilot:6:0:champion-reference:A`; exact published rank-1 Shadow Rider Calyrex reference 60 against the exact published Aichi rank-6 Iron Thorns 60.
- Input order `source-row-order-v1`; seed derivation `decorrelated-slots-v3`; numeric actual seed **1509836216**.
- Both actual initial draws independently place the candidate in physical seat A **first**; returned real deck fingerprints and all initial source-card order hashes agree.
- Identical `expanded-action-fidelity-probe-v1` research policy profile, `doubleDragonRecovery:true` (v4), `supporterDecisionCorrection:true`, `strictPromptValidation:true` and `isolatePolicyRandomness:true`; both returned exact pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- **v2 run:** [39183231979](https://github.com/FlareZ123/experiment-01/actions/runs/39183231979), research SHA `94c6a383cb6c3ae3c4c0664e579c63db0776e400`, `post_super_clone:true`, resolved/echoed `postSuperAliasRepairIsolation:true`, policy suffix `PostSuperAliasRepairIsolation-experimental-v2`. Archive [12157246057](https://github.com/FlareZ123/experiment-01/actions/runs/39183231979/artifacts/12157246057), artifact ZIP SHA-256 `b649ec63e77426f545cf119ae665632929b3342640c67b1e7dec5f7c4a22fcb3`.
- **v0 control:** [39183650328](https://github.com/FlareZ123/experiment-01/actions/runs/39183650328), research SHA `128df58654a69737c68a3eead7b08e3bf99f59f2`, `post_super_clone:false`, resolved/echoed `postSuperAliasRepairIsolation:false`, no v2 suffix. Archive [12157535767](https://github.com/FlareZ123/experiment-01/actions/runs/39183650328/artifacts/12157535767), artifact ZIP SHA-256 `6e7a5e39c03df4119d60499e9e51ae5426bdfb97c9babf32def0eb1591f6dea7`.

**Important revision control:** the runs' research revisions differ. GitHub compare of their two heads showed five additional commits containing this agent's documentation plus new rank-26 Crisis Tool guard/probe/test files. None of those five modified this shared campaign runner, rank-6 input manifest, opponent policy or v2 source-graph normalization. Comparison is **consistent with one isolated flag contrast**, but is not a byte-identical research-SHA experiment. A stronger prospective repeat should pin a common code revision for both treatment arms.

## Exact archived JSON comparison

Both downloaded artifact ZIPs contained `aichi-campaign-report.json` and `aichi-campaign-envelope.json`. I decoded the JSON in Python and compared **every key of `records[0]`**, then independently checked the first-draw record, input-order fingerprints, physical deck hashes, and the full `decisionTrace`, printed attack declarations and outcome fields.

| Record field | v0 | v2 |
| --- | ---: | ---: |
| Actual first player | candidate A | candidate A |
| Root Store actions | 373 | 373 |
| Global turns | 52 | 52 |
| Decision-trace events | 167 | 167 |
| Real Store attack declarations | 10 | 10 |
| Engine terminal winner | rank-6 opponent | rank-6 opponent |
| Remaining Prizes, candidate/opponent | 4 / 0 | 4 / 0 |
| Source root dispatch/draw transcript and terminal output | equal | equal |
| Competitive qualification | false | false |

**All serialized fields in the one actual game record matched exactly except three expected protocol-specific fields**: `requestedMatchOptions`, `effectiveMatchOptions` and the `observedPolicy` suffix. The 167-entry decision trace matches field-by-field, including ordinals, declared root action types, owner-private hand before each decision, and prompt selections. Both physical seat deck hashes, first-turn observations, attack declarations, action counts and final board state match.

A stable key-sorted canonical JSON SHA-256 of the complete `decisionTrace` in **both** archive records is:

`c788694fa3fa0d25ddb722f539384a8671f5a7c3966e9251d6ee7631ad8cdf22`

A similarly canonical SHA-256 of the ten-entry `attackDeclarationTrace` is:

`899c53a0514d1437b544af23c3cf42356f6a2cf19ed1e0f8fa1d8b33178e71fa`

Hashes use Python `json.dumps(value,sort_keys=True,separators=(',',':'))` UTF-8 and SHA-256. They are checksums of the **serialized fields**, not of the raw physical engine object graph. Both audits' existing quality envelope returned **one completed diagnostic and zero envelope failures**, with `certified:false`.

## What this does and does not say

The repaired source graph can produce a successfully terminated same-source simulation without changing any **recorded** decision, attack declaration, or result in this rank-6 fixed seed. It has no demonstrated advantage on this witness. It is neither proof that v0 is safe nor proof that v2 makes all card/Ability resolution equivalent to printed paper. The default vendor path is known to have possible live-card alias leakage, and a zero-difference sample may fail to exercise an alias-dependent branch.

The experiment intentionally has **only one initial deal, one observed actual starting order, no independently validated competent rank-6 policy, no full independent printed-damage reducer, and no paper 25-minute clock**. The reference list is unchanged; there is no candidate performance inference, no qualified match count or evidence toward 99.5% based on this result.

**Next discriminating test:** preselect an original-source state with a *known exercised speculative alias-write or second-stage graph discrepancy*, run both flag arms at the same research SHA with read-only source mutation auditing, and check whether any materially consequential legal action/effect/response changes. Preserve the failed/negative controls and count only verified source-dealt outcomes. Current field coverage remains 29/32; competitively qualified games remain zero.
