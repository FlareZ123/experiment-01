# Issue #25 integrated source-independent policy and mirrored original-source seat evidence

**Agent 1. 4 November 2026, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Status: DEVELOPMENT ONLY. Competitive games admitted: ZERO.**

This report records actual executing adapter results against the **two authenticated original Aichi 2026 source ranks 6 and 11**, with champion-reference and New Moon fixed contender 60s. It does **not** compare win rates, select the final fixed 60, certify a complete owner-information-safe player, or cover the full Top 32. The original source inventories remain available for **29/32**, and ranks **23,25,28** remain unavailable. The extreme 99.5% overall objective remains entirely unproven.

## What changed

Before this run, the normal research repository had **two separate strengths**: Agent36 **v1** selected the same resource-handling wrappers on both actual physical seats with `sourceIndependentCommonPolicy:true`, but its selected historical **v3** sourced two printed ATTACK choices (Night Watch, Future Sight) while still selecting separate rank-specific original-source scripts. Neither was a complete single policy.

- **v4** `simulation/evaluation/agent1-issue25-joined-two-seat-attacks-v4.cjs` joins the same two-seat source-independent resource runner to exact source-marked **Night Watch** and **Future Sight** owners, preserving the historical four source-deal arms and fixed 48-root censoring. Night Watch uses one private 256-bit `crypto.randomBytes(32)` campaign seed, with per-native-game-Store HMAC-derived subkeys and per-event public nonce. The private seed is disclosed only after execution. This avoids v3's prepublished fixed-seed failure mode; complete physical-randomness qualification remains UNRESOLVED. A default-off sequential-Store correction keeps all four distinct native Store roots reachable. Legacy v3 defaults remain intact.
- **v5** `simulation/evaluation/agent1-issue25-joined-three-attacks-v5.cjs` adds the source-marked **Girafarig LOT Get Lost** owner choice on the *public* opposing discard. A pinned source-local correction reduces an unsatisfiable 2-card prompt to the actual available count, including zero. Its first-two public-card selection is deliberately tactically weak and cannot be called competitive; the printed effect itself is not globally validated.
- **v6** `simulation/evaluation/agent1-issue25-mirrored-r6-r11-v6.cjs` registers **eight fresh preregistered arms**, placing **each source rank in both actual physical seats**, with both frozen 60-card contenders. The registration and four integer seeds were committed *before inspecting any native result* to `results/aichi-2026/registrations/agent1-issue25-mirrored-r6-r11-20261104.json`. The shared source-independent policy and source-attributed attack handlers are unchanged from v5. This addresses the rank×seat confounding in the historical four-arm panel, but one experiment over 8 attempts remains extremely limited. The 48-root horizon prevents most games from ending.

## Actual native Store executions

| Profile | CI / native job | Exact original attempts returned | Actual outcome disposition | Source-stamped selected action results | Qualified games |
|---|---|---:|---|---|---:|
| Joined v4 first compiled sample | [41891673661](https://github.com/FlareZ123/experiment-01/actions/runs/41891673661) (dedicated Issue25 job **success**, unrelated full workflow red) | 4/4 | rank6 reference terminal at 41; rank6 New Moon cap48; rank11 reference engine error17; rank11 New Moon cap48 | Night Watch 2 genuine Store accepted hand→deck moves, Future Sight 1 | 0 |
| Joined v4 per-Store random correction | [41892334445](https://github.com/FlareZ123/experiment-01/actions/runs/41892334445) dedicated job **success** | 4/4 | Same status pattern | Native stores **4**, previously detached state delegations **62 → 0**, distinct subkey digests each Store; Night Watch 2 genuine physical moves | 0 |
| Joined v5 added printed Get Lost | [41893046249](https://github.com/FlareZ123/experiment-01/actions/runs/41893046249) dedicated job **success** | 4/4 | rank6 reference terminal41; other three cap48, including rank11 reference now continues beyond its 17-root error | Get Lost 3 prompts with **zero cards available** and 3 native accepted empty selections, **zero physical discard depletion**; Night Watch 2 real moves; Future Sight 1 | 0 |
| Mirrored v6 fresh rank×seat | [41894027367](https://github.com/FlareZ123/experiment-01/actions/runs/41894027367) entire workflow **success** | **8/8** | **7 capped at root48; rank11 source-seat1 champion-reference engine error at root25** | All 8 source-deal/store registrations auditable, 0 selected source-stamped attack prompts in the 48-root windows | 0 |

Artifacts are ZIP files containing locked atomically-written JSON and SHA-256 sidecar. The v5 actual native JSON checksum was `a5a38f904ad390165c90e9966048ef6df66c66a7c022d8c454b4e532d843b746`; v6 native JSON checksum was `7ce7d32391074d9802a92c56056641b89b71ac16cd1e52f38f0fb2d0933b7f59` (145,149 JSON bytes). Both receipts include exact 60 source/candidate external hashes, observed pinned vendor Git commit, per-arm physical-deal fingerprints, four/eight original IDs, every engine abort, accepted public action counts, a SHA on raw root actions, policy-version evidence where present, and separate FAIL/UNRESOLVED admission gates. All companion pure/native tests passed their compiled dedicated jobs.

### New caution: a shared seed does not prove identical source deals

The fresh v6 group `6:101:B` deliberately holds rank, initial source physical seat, integer seed, and engine code constant across the two contender decklists. Its **original source physical-deal fingerprints differ**:

- With champion-reference: `04be1f33cf67365affd0c8b95c32b5346093f78ef21fc8a43a23febcac1e2fae`.
- With New Moon: `509bc6e44713a30eb38ddfd59efb20540f9f3a6cac37d9d9f4c19fe2adf0faee`.

Three other rank×seat groups did share their corresponding source-side physical fingerprints. This proves that fixed integer seeds and corresponding source seat are insufficient by themselves to certify matched physical deals between different candidate 60s. The engine's shuffle/RNG mechanism remains to be investigated. Treat any paired causal conclusion as **UNRESOLVED** until raw physical-deal fingerprints are compared for every intended pair. The v6-v7 protected-opening policy comparison therefore uses the **same eight candidate IDs as well as their seeds**, and independently verifies source **and full physical** opening fingerprints for each arm.

### Source-locked Get Lost correction proves liveness only

In the historically selected rank11 v5 cohort, Get Lost offered zero opposing discard cards every time. Native Store accepted three empty lists; no card was moved to the Lost Zone or removed from discard. The counter is protected against vacuous `[].every` evidence, following Agent10's concurrent correction. This is a sound *prompt liveness* result, **not positive proof of its disruption effect, correct Lost Zone destination, or overall tactical competence**. Future tests need a nonempty discard and native custody on the opponent's Lost Zone, in addition to continuing a real opponent response.

### Unresolved competitive admission gates

1. Full authenticated Top32 exact source field missing 3 original 60s; English display chronology is a separate concern from Japanese event-day print legality.
2. Whole-policy owner-information noninterference and paper-valid costs remain uncertified. Exact source-stamped attack handlers do not establish other root or prompt correctness.
3. The 48-root cap is mostly consumed by prompt acknowledgment and setup overhead; terminal and capped raw attempts cannot form a valid game-win denominator.
4. Matched original-source physical initial deals must be verified independently of equal seeds, even with mirrored source seats.
5. Realistic opponent decisions, paired starting orientation, per-card print interactions, and the official 25-minute clock remain unverified.
6. Native positive *Get Lost* Lost Zone movement still lacks a selected source match with eligible discard.
7. **0 competitively qualified games, no demonstrated 99.5%**, and no selected final 60.

## Reproduce or extend

The existing manual-only `.github/workflows/agent50-rank26-koko-dual-recipient-native.yml` has a dedicated `issue25-joined-v4` job that executes v4/v5/v6 plus pure and native Store gates. It now accepts optional `workflow_dispatch.inputs.issue25_only=true` to run only the Issue25 job without paying for unrelated Koko diagnostics. All native outcomes are retained as action receipts even if one assertion fails. Historical v0/v1/v2/v3 entry points are preserved.

The next preregistered single-variable intervention is an explicit **protected turn-entry Basic opening** using the same eight rank×seat/candidate 60/seed arms. Registration: `results/aichi-2026/registrations/agent1-issue25-protected-opening-v7-20261104.json` and source module `simulation/evaluation/agent1-issue25-protected-opening-v7.cjs`. Actual v7 game and initial physical-deal A/B results are **unresolved in this section pending the dedicated CI receipt**; do not infer an improvement from the theory alone.

**Attribution:** Agent1 assembled and executed the single entry with reusable Agent36, Agent41, Agent30, Agent12, Agent50, Agent3, Agent4 and Agent7 owners and receipt infrastructure. Agent9 independently analyzed actual v4/v5 Get Lost and artifact-custody claims; Agent10 identified the zero-depletion counter bug and rank-seat confounding; Agent41 reviewed source independence. This is a shared-progress synthesis, with all previous findings retaining provenance.
