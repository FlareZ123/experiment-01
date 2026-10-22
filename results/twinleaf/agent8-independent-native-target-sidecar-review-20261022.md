# Agent 8: independent native validation of accepted physical-target sidecar

**22 October 2026, 01:45 UTC | normal research mode | existing manually dispatched CI, no new gameplay experiment.** This review independently inspected the integrated observer, its six pure sidecar tests, the Store wrapper tests, and the compiled manual workflow `rank11-sametarget-source-replay.yml`. The result is a **narrow positive evidence-integrity gate**. It does not establish a competitive win, decision-policy competence, paper-rule completeness, or a fixed-60 win rate.

## Reproduction on genuine pinned Store

Existing workflow [run 39707306761](https://github.com/FlareZ123/experiment-01/actions/runs/39707306761), checkout `e99f70cbea3cc100a6f6c160116322d53c0d7c39`, manually dispatched with `canonical_v2_only=true`, **completed successfully**. Compiled Twinleaf from the pinned submodule, passed native target-sidecar and Store observer tests, and ran two same-checkout four-arm canonical source-first panels. The treatment had `AGENT12_NATIVE_TARGET_SIDECAR_DEV=true`; its control was otherwise identical with the observer disabled. The source-first, actor, Supporter, and same-target flags matched both panels. A separate accepted Energy-prompt public witness was also executed, although this report does not equate its scope with the target sidecar.

The compiled gate asserted for **each of four corresponding arms**: identical trial ID and source physical-deal fingerprint; byte-identical legacy `rootActionLedgerSha256`; equal engine `finished` and `winner`; observer `rootOrdinalLinked=true`, `targetUnobserved=0`, and at least one accepted target-bearing Store action. The log printed the following genuinely accepted and root-linked `PlayCardAction`/`RetreatAction` target receipts:

| Registered source-first arm | Accepted target-bearing Store roots | Sidecar SHA-256 |
| --- | ---: | --- |
| Rank 6, champion reference | 7 | `074f1b69121761736f99f134c89df27bb49f324567988a4a13732d143df8d619` |
| Rank 6, New Moon | 11 | `d6f575264253871cdebd618d84dbbd9faf1991239221f05c4d2262ea9707e905` |
| Rank 11, champion reference | 12 | `7d3d599546608cfb52ccd42cef709d72425d89f3e24b61069d8c04e1ec8b4f03` |
| Rank 11, New Moon | 21 | `239542acc98f8be9b03cbeefed283d58e94fe93eb9395aeef71ce6b889e5fe8a` |

The run archived [artifact 12395429006](https://github.com/FlareZ123/experiment-01/actions/runs/39707306761/artifacts/12395429006), workflow ZIP SHA-256 `6020d461180ae867165fdcb4670325f9fe51008140921986c08efb97f05b81c2`. `attempted=4`, `errors=0` in the observed canonical treatment panel. Its rank-6 New Moon game was **censored at 260 actions**, and the other three were native-engine terminals. Thus four completed **simulation attempts** are established; only **three** natural terminal outcomes and **zero** competitive-qualified games exist in this panel.

## Independent cross-check and outstanding discriminant

This directly advances [Agent 12's initial test-double-only sidecar report](agent12-accepted-physical-target-sidecar-20261022.md): the opt-in observer now has a **genuine compiled Store**, **four source-first treatments**, **native ordinal linkage**, and **same-head observer-off root-label noninterference**. The tests confirm **read-only behavior on these recorded arms**. They do not authenticate every accepted prompt's physical recipient.

The sidecar protocol records accepted root `PlayCardAction.target` and `RetreatAction.benchIndex`, and public-board deltas. It intentionally omits targets selected by `ResolvePromptAction` such as `AttachEnergyPrompt`, supported independently by [Agent 1's narrow public Energy-prompt observer](agent1-prompt-public-recipient-native-20261022.md). Nor does it convert equal root-label digests into an assertion that all physical actions match. `firstPhysicalTargetDifference` requires the new protocol and linked ordinals. Every unsupported comparison should explicitly return `target-unobserved`.

**Still untested here:** the precise [Agent 50 source T7/T9 native recipient reversal](../aichi-2026/agent50-guzma-energy-staging-native-reversal-20261021.md) on its original seed `482443328`. There the genuine `PlayCardAction` Energy recipients first diverged at root 49/64 while original root-label digests matched until root 144. The next high-value test is to compose this same observer with that original source-owner two-arm fork, archive each accepted target at the physical root, and show that the new sidecar detects the **first real divergence**. Preserve native flags, all opponent actions, and unqualified status.

## Qualification boundary

This validation has no new preregistered deals, no natural time-control model, incomplete card/policy fidelity, and historical retrospective sourcefirst seeds. Decklist recovery remains **29/32** and competitively qualified games **0** as of this test. Do not promote a target-observability pass to a 99.5% deck claim.
