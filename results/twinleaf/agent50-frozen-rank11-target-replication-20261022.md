# Independent frozen-policy native target replication (Agent 50, 22 October 2026)

**Evidence class:** fixed historical same-physical-deal replay; actual Store accepted actions. **Not** a competitive matchup trial. This independently reproduces the earlier [Agent 8 native target report](agent8-rank11-source-physical-target-native-counterexample-20261022.md).

## Inputs and audit
Derived branch `agent50-rank11-frozen-native-target-20261022` starts from the original Agent50 physical source fork at head `242b57930c67b7c733a7f0ba4911f3be9125ed79` and backports only the read-only native accepted target witness. It preserves original two 60s, rank11 source-first seat0, New Moon seat1, seed `482443328`, existing 16 policy env flags, source Marnie/Guzma owner roots, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The initial wrapper placement supplied an outer `{result,actorAudit}` object and correctly abstained on source-ordinal linking, despite capturing all 25/29 native target events. Corrected wrapper passes the *direct headless game result* to the observer's strict ordinal join, with the exact Telepath printed-name alias already independently compiled on main.

## Genuine native evidence
[Manual workflow 39713718282](https://github.com/FlareZ123/experiment-01/actions/runs/39713718282) compiled and passed the dedicated paired-source-replay step and immutable-regression tests; artifact `12397579102` stores both complete root ledgers and native target receipts. The enclosing workflow failed later at the preexisting, separate Canceling Cologne regression.

Both branches reproduced original source-deal fingerprint `60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31`. The compact root labels were identical for **144 actions** even though physical choices first differed earlier:

| Root | Control native recipient | Treatment native recipient |
| --- | --- | --- |
| 49, source turn 7 | Darkness Energy MEE to Active Garbodor BKP | Darkness Energy MEE to Benched Crobat V DAA, Bench index 1 |
| 64, source turn 9 | Second Darkness Energy MEE to Active Garbodor BKP | Second Darkness Energy MEE to Benched Crobat V DAA, Bench index 1 |

Both real Store sidecars were root-ordinal linked with zero missing PlayCard/Retreat target geometry: 25 control accepted target roots versus 29 treatment. The strict first difference was `{status:'different',index:9,firstOrdinal:49,secondOrdinal:49}`. All source printings and public board consequences are present in the artifact.

The original retrospective game outcome replicated: control native root digest `b6ccc668fa4bf99058e57606e4efe7b01e629a9c7505cb2f897b9ea1b6357468`, **0 source attacks**, candidate winner and `[6,0]` public Prizes; treatment digest `1fe3df677e5f9204e8675171e31dcc1302ddadf310811e41040f146e63cc5434`, **7 source attacks**, source winner and `[0,3]` Prizes.

## Interpretation
This is an independent read-only reproduction of Agent8's already confirmed root49 result. It separately tests a failure mode in wrapping the observer: a native sidecar without direct root provenance must abstain rather than invent root ordinals. The exact Telepath alias and direct-result fix preserve game behavior.

These are two retrospectively selected untimed development games, not independent competitive outcomes. Root PlayCard/Retreat target receipts do not cover typed Energy prompt physical geometry or broad hidden-information-safe policy behavior. Full-32 source coverage remains 29/32 (ranks 23, 25, 28 missing). Qualified competitive games: **0**. The 99.5% target is unproven.
