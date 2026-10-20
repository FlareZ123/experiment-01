# Agent 41: live-Store decision authentication and Fog Crystal inter-game reset

**20 October 2026. Normal research mode. Development evidence only.**

## Question and risk

The canonical five-component actor policy in `simulation/evaluation/agent7-canonical-actor-composition.cjs` wraps genuine Twinleaf `SimpleTacticsAi.decodeNextAction` calls. Native bot tactics may also score a speculative cloned `State`. An actor-only interceptor must authenticate the original live `Store.state` before constructing owner decisions, modifying per-owner history or taking actor-only execution credit. Otherwise a hypothetical clone can consume a once-per-turn resource plan, mutate a prompt handler's decision counts or trigger hidden-State-dependent composition side effects. This is a policy-fidelity concern independent of Pokémon card strength.

The previously integrated root and SelectPrompt handlers already imposed a live-State identity guard. The Fog Crystal, SelectOption and ChooseAttack interceptors did not. The Fog Crystal handler also retained its `perOwner` turn ledger when an entirely new native Store began, allowing a same-owner-ID and same-turn second game to inherit an `itemUsed` state from the preceding game.

## Reversible research-owned correction

- Commit [`c048fc8`](https://github.com/FlareZ123/experiment-01/commit/c048fc8544baf81ae2322d486f2dc4d819133954) adds `state === liveStore.state` authentication for the Fog Crystal, actor SelectOption and copied-attack hook. A non-live hypothetical State delegates to the original decoder, contributes **zero actor-owned selection credit**, and increments a separate `nonLiveSpeculativeFallbacks` counter. Their existing print-sensitive prompt handling and genuine Store action identity are unchanged.
- Commit [`db7572c`](https://github.com/FlareZ123/experiment-01/commit/db7572cf898e0a310b45e7bc0f89e6ec18f7d043) clears Fog Crystal's `perOwner` ledger on a new, independently authenticated `AddPlayerAction` Store instance. The new test runs a second mock native Store with the exact same player ID and global turn, verifies a fresh legal Fog Crystal root can again be selected and dispatched, and verifies the prior first-game search audit.
- The original respective three test modules now include cloned State and live-Store regressions. The tests are wired into the **existing manual-only** `agent7-canonical-actor-bilateral.yml` workflow by [`115ee39`](https://github.com/FlareZ123/experiment-01/commit/115ee39849e8f2552eda085a1e92c5b388fcbfd7). No on-push workflow or separate preferred runner was created.

## Executed and preserved evidence

Both fully compiled runs used the unchanged pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, the unchanged canonical reference/New Moon 60s, exact source ranks 6 and 11, and both the four historical and four retrospectively source-first development rows.

| Native run | Revision | Result | Complete artifact |
| --- | --- | --- | --- |
| Live-state correction | `5ae8064423bea0bdfe8814ba3792a3f3634f674f` (contains `c048fc8`, `115ee39`) | [CI 39495669186](https://github.com/FlareZ123/experiment-01/actions/runs/39495669186) **passed** | [Artifact 12297617768](https://github.com/FlareZ123/experiment-01/actions/runs/39495669186/artifacts/12297617768), SHA256 `6eadfda2df535e370859c1d4e99ffab293e23aaf8cde90cb585792d29a20a546` |
| Per-game Fog reset | `db7572cf898e0a310b45e7bc0f89e6ec18f7d043` | [CI 39496340189](https://github.com/FlareZ123/experiment-01/actions/runs/39496340189) **passed** | [Artifact 12298231267](https://github.com/FlareZ123/experiment-01/actions/runs/39496340189/artifacts/12298231267), SHA256 `a90416823d01d216dedf682779cb688d2cc49619312285f7ef4cca59917d4989` |

The frozen five-component pre-correction baseline is [CI 39492276335](https://github.com/FlareZ123/experiment-01/actions/runs/39492276335), [artifact 12296502006](https://github.com/FlareZ123/experiment-01/actions/runs/39492276335/artifacts/12296502006), SHA256 `4cc545e54b73d0af66e39068e6d87e2c325b5344913bc94f243225733cb577c5`.

I downloaded all three archive ZIPs, compared all **eight identical trial IDs**, and found **zero changes** in `rootActionLedgerSha256`, `sourceDealFingerprint`, `actionCount`, `finished`, `winner`, `finalPrizes`, `finalBoard`, `attackDeclarations`, `settledPublicAttackCount` and `nativePromptChoices`. Last-chance generic fallback invocation counts were unchanged in the eight rows: historical **16, 118, 177, 167** and source-first **29, 173, 50, 139**. In the corrected runs, all three newly guarded handlers recorded **zero speculative State interceptions** for these exact native histories. This is a bounded **noninterference** result under the selected fixtures; it does not prove historical policy decisions would have been vulnerable to clones. The adversarial tests exercise the boundary directly.

## Limits and next useful experiment

The intact eight native games remain development fixtures: the original selected source-first seed is retrospective, the candidate/source decision competence is unknown, the remaining `ChooseCardsPrompt`, `OrderCardsPrompt`, Prize and setup decisions still use hidden-State `SimpleTacticsAi` fallbacks, source-specific pressure remains scripted, and neither engine nor bots enforce competitive paper-clock fidelity. No added win-rate observation is certified. The full field still has only **29 of 32** recovered exact source 60s, missing ranks **23, 25, 28**.

The next high-value policy addition is an **authenticated owner-only `ChooseCardsPrompt` decision slice inside the same canonical composition**, with legal print-specific selection, source/candidate seat attribution, native accepted prompt evidence and untouched failure/censor denominators. Any heuristic must remain unqualified until it is shown to compete under real source pressure with actor-only decisions and an opponent continuation. Coordinate with the existing prompt owners; keep narrow unit and regression outcomes distinct from prospective competitive results.
