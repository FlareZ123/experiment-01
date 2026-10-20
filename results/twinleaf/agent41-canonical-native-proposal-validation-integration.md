# Agent 41: canonical native proposal/validation trace, pending compiled qualification

**20 October 2026 | execution boundary: native policy diagnostics only.**
The shared fixed-60 objective still has **zero competitively qualified games**. The full 32-opponent field is not yet verified. This change introduces a developer-only method to preserve the exact original policy-decision boundary as a prerequisite to future same-world parity and owner-information-safe counterfactuals.

## Prior evidence and why this seam exists

- [Critic's 12:02 stop gate](../../communications/broadcast/20261020T1202Z_critic_predispatch_tactic_state_integrity.md) correctly separates original decision replay parity from counterfactual hidden-world sensitivity. The current detached rank6 turn3 experiment used a different RNG seed and reset position, so its mismatched attack cannot establish hidden-information causality.
- [Agent 38's native rank24 report](agent38-live-state-alias-native-rank24-20261020.md) found 13/97 actual bot decisions changed descriptors of original State-owned player objects (36 descriptor changes); 7 Supporter proposals mutated the marker temporarily and then reached native validity with marker zero under the existing correction.
- [Agent 22's refined exact-identity report](agent22-authentic-supporter-proposal-state-mutability.md) confirms in four historical rank6/rank11 games that 36/36 original source-owned Supporter proposal writes were restored to quota zero on the same player object at the bot exit, and all 36 settled Store roots went 0→1. This is a bounded positive for the correction and does not settle rejection under uncorrected upstream.

These results identify the next missing linkage: exactly which authentic decision's action and RNG consumption the detached clone would need to reproduce.

## Research-owned default-off integration

- [Reversible wrapper](../../simulation/twinleaf/agent41-native-proposal-validation-audit.cjs) composes **Agent 38's existing** `installNativeSupporterProposalValidationTrace` around the original synchronous native runner. It loads the exact pinned bot and Supporter tactic; restores their method descriptors in `finally` after success or exception. On exception it attaches the captured interrupted diagnostic to the thrown Error.
- [Single canonical comparison](../../simulation/evaluation/agent41-bilateral-v2-development.cjs) adds `nativeProposalValidationAudit` / `nativeProposalTapeOrdinal` to the already shared `executeDevelopment` and `runDevelopment` options. Environment selectors `AGENT41_NATIVE_PROPOSAL_VALIDATION_DEV=true` and optional integer `AGENT41_NATIVE_PROPOSAL_TAPE_ORDINAL` are **default off**. Every successfully attempted arm retains `nativeValidationAudit` only if enabled; interrupted arms preserve the same evidence when the native diagnostic reports it.
- The trace observes original `SimpleTacticsAi.decodeNextAction`, `PlaySupporterTactic.useTactic` and `isValidAction` with **the actual active actor seat**. It records proposed card from the owner's own hand, validation accepted/rejected, temporary quota writes, original selected native action, RNG count/digest, and a full RNG tape for **one explicitly selected native decision ordinal**. A prior separately seeded reconstructed bot does not meet this provenance standard.
- [Pure regression cases](../../tests/agent41-native-proposal-validation-audit.test.cjs) check accepted proposal + one RNG draw, rejected proposal + mutated quota, and restoration when execution throws. A V8 in-process CJS shim evaluation of the actual wrapper, observer, and test code passed **3/3** on 20 October; Node assert and random-count/hash dependencies were replaced by equivalent narrow stubs. This is **limited pure logic validation**, not an actual `node --test` or compiled Twinleaf game. Separately, V8 syntax parsing passed on wrapper, test, and canonical runner.
- A proposed edit adding the test and new flag to the existing **manual-only** `aichi-source-locked-campaign.yml` was blocked by the host safety check. It was **not committed** and was **not retried through another route**. No newly compiled pinned Store trial, actual RNG tape/root match, or observer noninterference result exists for this version.

## Falsification and next acceptance

1. Run the existing historical four arms unobserved versus observed on the same Git revision, same per-seat physical source deal, actual starter, policy and source hooks; compare full actual Store root digest and record every error and censor.
2. Authenticate an original selected decision ordinal and store its owner-known K0/K1 evidence, full legal current action, initial scorer baseline, and **exact original RNG tape**. The trace alone is not that qualification.
3. Clone the original State and full bot config with identical prior decision-policy history and replay the physical-world choice using the tape with fail-closed exact consumption. **Require action and score parity before varying hidden zones**.
4. Vary only truly actor-hidden information, conserving all physical 60-card inventories and public observations and respecting reveals, own deck searches and inferred prizes; call action differences conditional sensitivity unless actual policy parity and history are verified.
5. Route confirmed integration into one canonical two-player source-first line with legal opponent response and continuation. Keep all uncompleted arms and paper-clock limits in denominator reporting.

**Evidence status:** uncompiled integrated diagnostic with 3/3 V8-shim pure tests and syntax checks, all test claims qualified accordingly. **No actual-game information-set certification, no additional legal-paper-game certification, zero competitive-qualified games, and no demonstrated 99.5% field win rate.**
