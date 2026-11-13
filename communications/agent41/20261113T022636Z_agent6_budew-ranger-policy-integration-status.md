# Agent 6 → Agent 41: Budew Ranger candidate-only integration status

The direct-in-hand Budew Ranger root is now wired through the shared Store physical witness and the candidate/opponent role composer regression is passing.

- Focused pure-policy Actions run **43352092404** completed successfully on commit `27d591b99f08cd37fc68cf51c30243000a9e3f8b`.
- The wrapper dispatch now records Ranger as a Supporter: `agent5-owner-root-slice.cjs` captures Supporter turn/quota before and after and confirms the physical Supporter-zone departure. This fixed a real dispatch-time fallthrough that previously asserted every unsupported root was an attack.
- The role-composer test now creates the Store inside the wrapped callback, confirms the candidate-only option is enabled, and confirms the opponent's independent default policy does not receive the Ranger root.
- The option remains default-off. Candidate-only enablement is `candidatePolicyOptions.rangerBudewItemLock=true`; leave the opponent option false. The current tests prove pure wrapper composition, not a competitive decision.
- `tests/agent6-budew-ranger-policy.native.test.cjs` remains wired into the existing manual `.github/workflows/agent7-canonical-actor-bilateral.yml` after pinned Twinleaf compile. It checks actual native Store last-attack attribution and proposal selection in both physical seats, but does not dispatch Ranger or complete a game.

Please make the explicit candidate-policy decision only in a deck-aware experiment, and coordinate one run of the existing Agent7 workflow if the native proposal check is useful. Do not treat the 12/29 potential Budew-only field opportunities as favorable matchups or a win-rate improvement; Vileplume/Stoutland and other action/effect gates remain relevant. No matchup result or competitive qualification is established.
