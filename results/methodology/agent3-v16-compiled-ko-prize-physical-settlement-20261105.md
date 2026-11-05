# Agent 3: compiled native KO-shaped Prize settlement witness (v16)

**5 November 2026, 18:34 UTC | Evidence level: genuine pinned Twinleaf Store observation, DEVELOPMENTAL.** This is the executed continuation of [the preregistration](agent3-v16-native-ko-prize-settlement-preregistration-20261105.md). The registered control code, original eight rank6/rank11 source-trial IDs, and baseline v14 policy remain unchanged. There is **no competitively qualified game** and no win-rate inference.

## Frozen native execution and custody

- Workflow: [successful manually dispatched Issue25 v14-only run 42085039753](https://github.com/FlareZ123/experiment-01/actions/runs/42085039753), head `43a5b1e140c9ea4356127178c326cd4462788f89`, job `127447743984`. This was an opt-in manual dispatch of an existing workflow, not a new automatic CI job.
- Vendor: pinned Git submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, checked by the compiled native test.
- [Raw four-file artifact](https://github.com/FlareZ123/experiment-01/actions/runs/42085039753/artifacts/13442896071), ID `13442896071`, ZIP SHA-256 `46e49423c4e5cded920604deb609e8c7ac648ab0b187621be72e9d8e395996d7`. The v16 JSON file `issue25-v16-ko-prize-settlement.json` was 15,368 bytes, SHA-256 `a8621ca82151dfb0430d75e0e4dbebf7d35167b69fce5bd17f6467a5f88d2ce2`. The v14 independent JSON file remains archived alongside it; the native logs emit SHA-256 `9bc48d41431e3359570355b0deb89ea904eea7dc02c494bc1363360753ffeac7`.
- All source/pure prompt regression tests passed. The original v14 A/B/A native test and the new v16 passive observer test each passed on the real compiled Store.

## Exact observed counts

| Gate | Native result |
| --- | ---: |
| Original source trial IDs | 8 |
| Registered A/B/A Store attempts | 24 |
| Native owner prechoice / request / first-player matches | 32 / 32 / 32 |
| Repeated control public root/status equality | 8 / 8 |
| Same source physical deal across all three campaigns | 8 / 8 |
| Submitted owner KO-shaped Prize selections observed | 3 |
| Exact pending prompts resolved by the real Store | 3 |
| Native unresolved | 0 |
| Exact chosen physical Prize objects transferred to owner hand | 3 |
| Exact owner Lost Zone transfers | 0 |
| Other or unverified destinations | 0 |
| Prize observer decisions by physical seat 0 / seat 1 | 3 / 0 |
| Competitively qualified games | 0 |

The actual native log line is `AGENT3_V16_OWNER_KO_PRIZE_NATIVE` and includes the complete eight source IDs, records for control equality and physical parity, the by-seat tally, and the SHA-256 of the emitted JSON. This report preserves the published aggregate; the linked raw artifact is the source for per-attempt identities, statuses, and detailed physical movement records. We did not infer unseen-event rates or discard censored/error outcomes.

## Exactly what has been established

The observer `simulation/twinleaf/agent3-owner-ko-prize-settlement-evidence.cjs` is a passive `Store.prototype.dispatch` wrapper around the unchanged source-registered v14 A/B/A runner. It only recognizes pending, actor-owned `ChoosePrizePrompt` selections with `CHOOSE_PRIZE_CARD`, legal occupied Prize slots and native `options.destination === owner.hand`. It records chosen physical **object references after the decision**, then requires that the original pending prompt has `prompt.result === action.result`; it separately verifies that every selected physical object left Prize and appeared in the owner hand (or records alternative Lost Zone / unverified destination). No Prize faces enter the actor policy or sanitized output.

The three observed native prompts completed and moved the exact chosen physical objects into the appropriate owner hand. The same source physical starts and repeated A controls still match. The accepted v14 intervention also selected one native owner Pokémon promotion in the middle arm, but remains a basic first-menu policy, not competent optimal play.

## Remaining gates

1. **Unique KO provenance is not proven.** A native prompt's class/message/owner-hand destination are necessary for ordinary pinned KO selection but not a proof that no card-specific effect can generate an indistinguishable prompt. Source `executeCheckState` provenance or a stronger origin witness is required before a paper-qualified KO certificate.
2. The native 3/3 observation does not exercise valid alternative Prize destinations such as Barbaracle's Lost Zone redirection; pure tests cover the distinction, but no redirected native branch was encountered.
3. Actual owner-readable paper opportunity and payment, strategic Prize value, downstream attacker/control payoff, and meaningful opponent continuation remain to be established in the **selected steward release**. Native v14/v16 is a distinct retrospective protected-opening probe, not a substitute for the steward-selected v4/v5 bilateral release.
4. All 32 original opponent 60s remain unavailable (ranks 23/25/28 missing), no single final fixed 60 has been selected, and zero games meet competitive qualification. **The 99.5% objective remains unevidenced.**

## Next highest-value action

Hand the strict exact-card destination and silent-no-op checks to the source-pass / payoff release steward for selective adoption. They form a narrowly reproducible acceptance boundary for future Prize selections. Avoid generalizing the three same-registration observations into policy advantage. Prioritize one original-source paper-valid paid action, settled payoff, and actual opposing reply, with a prospective source Pass opportunity denominator.
