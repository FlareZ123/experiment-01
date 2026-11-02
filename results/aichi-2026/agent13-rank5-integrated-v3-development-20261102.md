# Agent 13: first integrated rank-5 Mew/Genesect source-policy release and early native abort

**2 November 2026. Research status: executed native Store attempts are all unqualified failures; no win-rate inference.**

## Decision relevant to the fixed 60 benchmark

The original rank-5 Aichi Top 32 Mew/Genesect deck (Yamato Nakano; original source printed-60 SHA256 `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`) made **zero source attack declarations** in the prior original nine-archetype developmental screen. Its ordinary DCE/Mew VMAX/Cross Fusion Strike/Genesect Techno Blast attack plan requires a competent, combined root/prompt policy. This work combines the previously separate original-Mew natural-evolution and owner-visible Genesect donor choice in **one** two-seat shared native actor and evaluates the resulting policy against the unchanged frozen v2 control on fresh, preregistered source deals.

The change is **development-only**. It does not select a new candidate sixty, validate the existing candidates, or measure any competitive win rate.

## Release custody and effective options

- **Shared integration:** `simulation/evaluation/agent7-canonical-actor-composition.cjs` passes an opt-in `preferMewGenesectTechnoBlast` into the already native-owned `agent13-actor-only-choose-attack.cjs`; the shared bilateral runner `agent41-bilateral-v2-development.cjs` exposes `actorMewGenesectTechnoBlast`, default **off**. The companion root option `actorNaturalEvolutionRoot` already exists and is also default off. Both operate on *both physical seats*, with the baseline v2's public Special Energy policy unchanged. The Genesect preference only applies to an owner-visible Mew VMAX copied-attack menu and eligible printed Genesect V Techno Blast; it cannot force a legal attack declaration or prove damage.
- **Externally pinned release profile:** [`simulation/evaluation/agent13-v3-rank5-policy-profile-20261102.json`](../../simulation/evaluation/agent13-v3-rank5-policy-profile-20261102.json), Git blob `1624cd681ef5304539e2916bd328e7b3fc7e0305`. This contains the exact frozen-v2 option object, treatment option object, original printed sixty and four code blobs. It fails closed if a pinned policy source changes.
- **Independent registration:** [`results/aichi-2026/registrations/agent13-rank5-v3-native-paired-20261102.json`](registrations/agent13-rank5-v3-native-paired-20261102.json), Git blob `ca12debcc9de93ce51f21eb9e28238f646f68205`, frozen before any native outcome. Two independent random 32-bit source seeds: candidate seat **A = 3164314730** and seat **B = 594187538**. Two fixed candidate printed sixties (champion reference and New Moon Lockbreaker) each face rank 5 in both modes; **four native attempts per mode, eight total**.
- **Runner:** [`simulation/evaluation/agent13-v3-rank5-original-release.cjs`](../../simulation/evaluation/agent13-v3-rank5-original-release.cjs) checks immutable profile/registration blob hashes, selected policy equality, original source identity and source-code exact blobs. It retains every native row and abort, separates active-source seat from candidate, and only reports source attack deltas where native full source-deal fingerprints match.
- **Compiled tests:** [10/10 pure integration, provenance and original-Mew prompt cases](https://github.com/FlareZ123/experiment-01/actions/runs/41385619135), all passed. The native Store was compiled from pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. No automatic CI workflow was introduced.

## Executed results: eight first-turn decoder failures

[First native run 41385619135](https://github.com/FlareZ123/experiment-01/actions/runs/41385619135), head `a701ec2b4ee32287ebabe6103537f30582aa80b5`, archived full [native result artifact 13115406476](https://github.com/FlareZ123/experiment-01/actions/runs/41385619135/artifacts/13115406476), artifact ZIP SHA256 `64d3a255be5db0df977cc53fab5f90f490d11935172dced7abd478e7666291b8`.

| Candidate printed sixty | Candidate physical seat | Frozen v2 | Integrated v3 | Comparative outcome |
| --- | --- | --- | --- | --- |
| Champion reference | A | `engine-error` | `engine-error` | `UNVERIFIED` |
| New Moon Lockbreaker | A | `engine-error` | `engine-error` | `UNVERIFIED` |
| Champion reference | B | `engine-error` | `engine-error` | `UNVERIFIED` |
| New Moon Lockbreaker | B | `engine-error` | `engine-error` | `UNVERIFIED` |

**All eight original-source games failed in the native bot decoder** during the first owner action turn. Six failures occurred at native accepted action ordinal **7**, and two at **12**. All eight share the identical redacted decoder exception-message SHA256 `2c46614a11dcf22b52a1fb7846368e729b6e025d698ef122062378b58d166822`. The native abort receipts retain public board snapshots, acting-seat and action-ordinal evidence, and source-deal fingerprints inside the error sidecar. The default top-level source pairing data were absent because the games aborted, so the runner explicitly labeled comparisons `UNVERIFIED` and reported **no attack deltas**. There were zero accepted source Mew VMAX evolution witnesses, zero source Genesect copied-attack selections and zero competitively qualified games.

**Important distinction:** GitHub Actions concluded *success* because it compiled and ran the tests, retained all eight aborted attempted rows, checked the denominator and archived the evidence. It does not mean any game completed successfully.

## Diagnostic follow-up and integration drift

A read-only safety-preserving exception observer now records the decoder's whitelisted error class and source **file basename/line/column only**, never error messages, full stack paths, opponent concealed hand contents or player hidden information. See [`native-dispatch-abort-evidence.cjs`](../../simulation/twinleaf/native-dispatch-abort-evidence.cjs), [`headless.cjs`](../../simulation/twinleaf/headless.cjs) and [dedicated three-case test](../../tests/agent13-native-bot-decoder-frame-audit.test.cjs). The data is produced after the bot has thrown, so it does not affect actor decisions.

[Second diagnostic dispatch 41386221783](https://github.com/FlareZ123/experiment-01/actions/runs/41386221783) **failed closed before executing any native trial**: another agent's concurrent edit changed `simulation/twinleaf/agent34-actor-only-root-policy.cjs` from the registered Git blob `23d16f1602c0152984f50c04dd6d9e97e95c5c61` to `735ee6728e6b6103bd38374fcef60793be31690d`. The checked profile rightly refused to relabel a changed actor implementation as the same frozen policy. Eleven of 13 tests passed; the two failing tests were the code-provenance veto. It adds **zero** native attempts to the denominator.

For an exact-code forensic replay, created branch [`agent13-rank5-v3-forensic-20261102`](https://github.com/FlareZ123/experiment-01/tree/agent13-rank5-v3-forensic-20261102) from the first run's pinned commit, applied only the safe error-frame observer and its regression, and verified that all **four registered policy-code blobs still match**. [Manual forensic workflow 41386564243](https://github.com/FlareZ123/experiment-01/actions/runs/41386564243) is a **retrospective same-seed diagnostic**, not new prospective validation. Its outcome must be checked separately before drawing causal conclusions.

## Qualification and next decision

No representative source attack, paid Cross Fusion Strike, settled copied Techno Blast hit or consequential opponent continuation is demonstrated here. The first effective priority is to diagnose the common root-decoder failure and restore natural-game execution. Any policy code repair requires a **new** independently pinned release profile and explicit accounting for divergence from this first eight-arm registration. Keep both the successful test job and failed game attempts as negative evidence.

The entire shared benchmark remains **29/32 authenticated Aichi Top 32 original 60s, zero competitively qualified games and no demonstrated fixed-deck 99.5% game win rate**. The three missing original lists remain ranks 23, 25 and 28.
