# Agent 8: corrected native Trainer activation reaches raw-State quarantine

**7 November 2026 | retrospective eight-source developmental probe | zero qualified games.**

The historical Agent8 v5/v6 Trainer experiment was mistakenly called a negative strategy result; the B root never installed because the selected bilateral Special Energy root shadowed the native Trainer constructor. The [historical report](agent8-issue25-same-eight-trainer-v6-negative-native-20261106.md) now retracts its negative inference. The exact historical code snapshot is `c79da088d37242234420c454f630d2b497ed1738`.

## Native corrected-root experiment

Corrected code forwards `nativeOwnerTrainerFallback:true` to the scoped root; a composition guard now requires a live root Trainer audit on successful runs. On the same eight previously registered source physical openings and 48-root horizon, the existing manual [CI run 42330983301](https://github.com/FlareZ123/experiment-01/actions/runs/42330983301) executed the pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Its targeted native test **FAILED** while all five new activation pure tests and three inherited pure cases passed. The [artifact 13556969731](https://github.com/FlareZ123/experiment-01/actions/runs/42330983301/artifacts/13556969731) was still uploaded.

I downloaded and independently parsed both archive JSONs. ZIP SHA-256 `c5ac664ac06e3ae03a87e486c30cf73f25123b1c5c21521b6c4183e23c16d4be`; JSON SHA-256 control `9371c255ace9ed9d05e672de1d7da8d4e477abec7b109e2027e35cb573b3480c`, treatment `4c7fc49c6a51c59a713c997a061c90c1dcb46f29cbc95ec9571bfcdefb6c4b14`. **All eight full physical two-seat and source openings matched**.

Historical control: **seven 48-root censors and one ordinal-14 bot-decoder abort**. Corrected treatment: **eight bot-decoder aborts**, accepted-root ordinals `[14,14,14,21,8,14,7,13]` in registration order, all with the known quarantine exception digest `2dc3a55f9b6d7dbc60aaa8883b43982e213957c44179b1baf52cb1139effe11f`. Seven treatment ledgers are exact prefixes of their control counterparts; the immediate next control action is a same-turn **PassTurnAction**. Eighth rank11 New Moon trial aborts at ordinal 14 in both arms with identical accepted prefix. **No new Trainer PlayCard root was accepted**.

All eight treatment rows abort before post-return `actorOnlyDecisionCoverage` is present. Therefore `fallbackActivationKnownRows=0` and the fail-closed assertion correctly FAILS; this lack of returned audits does **not** prove fallback absence.

## Root cause and qualification

When the actor policy chooses `pass` with `no-supported-owner-visible-root`, `simulation/twinleaf/agent34-actor-only-root-policy.cjs` calls `original.value.call(this,state)` to ask the native bot for a Trainer suggestion. The protected developmental profile simultaneously installs `agent4-raw-state-native-fallback-quarantine.cjs`, which deliberately prohibits that raw-State decoder to avoid leaking hidden information. The precise seven Pass-boundary abort ordinals and matching error digest support the diagnosis of **fallback/quarantine incompatibility**. The archive sanitizes original error text, so mechanism inference combines source and root-prefix evidence.

This is a **valid positive detection of an integration blocker**, with no valid efficacy estimate, accepted Trainer treatment, settled attack benefit, native terminal, or competitive paper-game result. Historical A/A and corrected abort-only results cannot rank Trainer fallback strategically.

Next: implement a genuinely owner-observation-only Trainer choice with printed timing, physical discard payment, targets and real-Store checks; preserve the quarantine in any common-policy comparison. For new abort studies, preserve minimal actual-root fallback attempt counters in error evidence, because a post-return-only audit vanishes when every match aborts.

**Field status:** 29/32 original name/count inventories, missing ranks 23,25,28; no nominated best fixed 60, no qualified game and no demonstrated 99.5% win rate.
