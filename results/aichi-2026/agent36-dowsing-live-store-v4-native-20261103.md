# Source Dowsing PLS 128: live-Store transaction custody v4 and official ruling

**Agent 36 | 3 November 2026 | actual pinned Twinleaf Store, developmental paper-payment gate.**

## Verified outcome

The existing [manual native workflow](../../.github/workflows/aichi-iron-thorns-first-attack.yml) completed successfully with `native_energy_probe=true` at [run 41561048971](https://github.com/FlareZ123/experiment-01/actions/runs/41561048971), head `8b44f6d49f9577b6b40f1f02fd8786eb7f8d51e9`. Its named **“Verify official Dowsing spent-Trainer non-recovery and guarded two-card custody in both seats”** job step passed, together with the pre-existing native original rank-26 payment test. The relevant regression invocation now runs all three files:

- [nine prior pure transaction tests plus live-only two-trial exclusion](../../tests/agent36-dowsing-payment-guard.test.cjs);
- [native both-seat official same-use Trainer exclusion](../../tests/agent36-dowsing-cost-before-target-native.test.cjs);
- [native both-seat 0/1/2 mandatory two-card payment gate](../../tests/agent36-dowsing-payment-guard.native.test.cjs).

The earlier [run 41560789511](https://github.com/FlareZ123/experiment-01/actions/runs/41560789511) also passed the two original native files, before the live-only extension. An initial [default-input run 41560187446](https://github.com/FlareZ123/experiment-01/actions/runs/41560187446) succeeded but **skipped** the optional native job; it does not count as evidence that those tests ran. The required input was explicitly enabled afterward.

## Mechanism and evidence boundary

The original source rank-26 60 contains a singleton **Dowsing Machine PLS 128**. The pinned reducer can erroneously accept a single-card mandatory payment and then recover an already discarded Trainer. The [guard](../../simulation/twinleaf/agent36-dowsing-paper-payment-guard.cjs) independently insists on exactly **two distinct original physical owner-hand cards**, at the original source-stamped payment prompt. It vetoes a root with fewer than two other owner-hand cards. After native acceptance, it follows the actual submitted objects until the recovery transaction closes. Native prompt acceptance without a witnessed cost transfer remains unqualified.

V4 retains these checks and adds optional `requireLiveStore:true` and `currentTrialId` isolation. The first physical `AddPlayerAction` for a registered trial binds that Store; any auxiliary cloned or speculative Store receives the original native behavior and is not counted or vetoed by this paper guard. An injected-Store regression covers **two distinct registered trial keys plus an otherwise identical auxiliary Store**, verifying two correctly vetoed original roots and two excluded auxiliary root dispatches. The default is still OFF, so prior frozen campaigns and selected policy profiles do not silently change.

The [official Pokémon Company Japanese Dowsing FAQ](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%83%80%E3%82%A6%E3%82%B8%E3%83%B3%E3%82%B0%E3%83%9E%E3%82%B7%E3%83%B3) forbids recovering, with the same Dowsing use, either a Trainer just discarded to pay its cost or the Dowsing Machine itself. The actual pinned native Store's target menu excludes the just-paid Trainer. This is **correct**, and the earlier allegation of an underinclusive native search menu was retracted in the [official-ruling audit](agent36-dowsing-pls-official-faq-source-audit-20261102.md). The one-card underpayment defect remains a distinct demonstrated problem.

## Integration contract and limits

The source gate is **opt-in**, compatible with selected native Store wrappers and suitable to be composed around one registered original-source `runMatch` trial. It currently is **not an effective option in the canonical bilateral selected profile**, so this is a reusable paper-payment building block rather than a certified full-game release. Any integrated policy should freeze and expose `requireLiveStore`, trial ID, original printed 60, physical deal fingerprint, exact Store payments, closure status, opponent reply and aborts. Its audit must remain separate from unrelated source prompts and auxiliary scoring clones.

There is no full-deck legality proof, independent match-win sample, source-competent Aichi rank-26 complete turn policy, clock adjudication or tournament-comparable claim. The central field remains **29/32 exact original opponent 60s** (missing ranks 23, 25, 28) and **zero competitively qualified games**. The target of 99.5% wins against the whole field is unproved.

## Traceability

- Source v4 change: [`00c7d18`](https://github.com/FlareZ123/experiment-01/commit/00c7d18bc3c5a570afb58ac68b722981dad586fc).
- Pure two-trial regression: [`140145e`](https://github.com/FlareZ123/experiment-01/commit/140145e73c9552cdf4bf7e3d2f607cc14d15f4fb).
- Native suite inclusion: [`8b44f6d`](https://github.com/FlareZ123/experiment-01/commit/8b44f6d49f9577b6b40f1f02fd8786eb7f8d51e9).
- Verified native CI: [run 41561048971](https://github.com/FlareZ123/experiment-01/actions/runs/41561048971).
