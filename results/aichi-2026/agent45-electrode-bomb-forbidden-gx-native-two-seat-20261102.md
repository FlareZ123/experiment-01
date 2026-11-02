# CES48 Extra Energy Bomb: native Store accepts a forbidden GX recipient in both seats

**Agent45, 2 November 2026.** Genuine pinned Store `UseAbilityAction`, `WaitPrompt` and `AttachEnergyPrompt` results, **development-only staged board**. No original source-dealt win, matchup estimate, or full-policy certification.

## Printed constraint and native failure

Electrode-GX CES 48's Extra Energy Bomb states that its five discarded Energy attachments go to your Pokémon **except Pokémon-GX or Pokémon-EX**, and then the Electrode-GX is Knocked Out. The native source includes a `blockedTo` list, but `AttachEnergyPrompt.validate()` does not inspect that field, and the Store resolves the chosen target without enforcing it. The exact pinned vendor revision is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

**[Compiled CI 41409401304](https://github.com/FlareZ123/experiment-01/actions/runs/41409401304), success (four of four tests)**, actual source checkout `c5be7ba4c0ae26a613b3d0bf7e5b44a20324871a`: independently staged owner physical seat A and seat B. Each state contained owner's Active **Tapu Lele-GX GRI** (forbidden target), Benched Electrode-GX CES, Benched Duskull PRE (legal recipient), five distinct Lightning Energy cards in the owner's discard pile, an opposing Active Shadow Rider Calyrex VMAX and complete six-card Prizes. The native Store accepted `UseAbilityAction('Extra Energy Bomb')`, then the standard Ability-animation `WaitPrompt`. After the WaitPrompt resolved, it offered an actual owner `AttachEnergyPrompt` whose `blockedTo` explicitly listed Tapu Lele-GX. Its decoder and validator nevertheless accepted one of five real discarded Lightning Energy cards aimed at the GX Active.

The real `ResolvePromptAction` attached that physical Lightning Energy card to the forbidden **Tapu Lele-GX** and self-Knocked Out the Electrode in both seats. The log labels `AGENT45_NATIVE_CES48_BLOCKED_GX_ACCEPTED` appear twice, one per physical seat. The two other compiled tests verify the native prompt's independent target-validation omission and acceptance of one of five attachments. All four executed compiled tests passed.

This is **a demonstrated paper-illegal native Store transition**, rather than a claim that the unmodified bot independently chooses that exact forbidden target or that a real source game naturally encounters it. Other previously documented agent45 source research (`results/twinleaf/agent45-electrode-gx-empty-selection-chain.md`, `results/twinleaf/agent45-electrode-bomb-competing-target-defect.md`) already established the separate mandatory full-count and generic greedy recipient errors on staged Store boards. These older investigations did not report this both-seat explicitly blocked GX physical transition.

## Research-owned correction and remaining admission

The repository already implements an opt-in `simulation/twinleaf/electrode-gx-energy-hook.cjs` which:
1. Identifies this card's actual PowerEffect;
2. Requires the available Energy cards up to five;
3. Distinguishes legal non-GX/EX recipients;
4. Verifies the offered physical Energy and selected target identities before invoking the engine callback;
5. Adapts the generic bot's marked `AttachEnergyPromptResolver`.

The new native control should also be executed with that correction installed in both seats. The generic `blockedTo` validator deficiency is broader than this single card, and its independent resolution warrants a separate safety review before assuming every other Ability attachment is legal.

**Source impact:** actual published Aichi source ranks 4, 9 and 17 include CES48. The wrong target is not an automatically available native bot action and the staged illegal transition is no win-rate estimate. The default-on policy state, source choice of Ability, opponent response, and paper-clock timing remain unqualified. **29/32 exact sources, 0 competitively qualified games, no 99.5% evidence.**

## Reproduction

- `tests/agent45-electrode-bomb-native-store-forbidden-gx.test.cjs`: actual Store, actual card instances, animation prompt and post-Ability physical zones;
- `tests/agent45-electrode-energy-bomb-prompt-contract.native.test.cjs`: genuine native prompt contract probes;
- `.github/workflows/agent45-electrode-bomb-native-store.yml`: manual-only pinned vendor compilation;
- The first failed setup [CI 41408734627](https://github.com/FlareZ123/experiment-01/actions/runs/41408734627) did not advance beyond the required animation `WaitPrompt` and is retained as failed test evidence;
- Final native Store positive [CI 41409401304](https://github.com/FlareZ123/experiment-01/actions/runs/41409401304), full two-seat genuine physical transfer.


## Green card-specific hook native correction

Compiled [CI 41409955295](https://github.com/FlareZ123/experiment-01/actions/runs/41409955295) succeeded all 6 tests after correcting a test assertion for native GameError object shape. With the existing research hook `installElectrodeGXEnergyHook()` installed, each native Store seat offered five physical discarded Lightning Energy cards aimed at the prohibited Active Tapu Lele-GX. Native prompt validation still returned true, while the card-specific hook rejected the resolution with an ILLEGAL_ACTION error before any Energy moved. Electrode remained in play. The previous red CI 41409714467 had reached that same intended rejection but its test incorrectly expected a stringified Error instead of reading its message property.

A generic optional Store safeguard `simulation/twinleaf/agent45-paper-attach-blockedto-store-guard.cjs` now compares physical destination coordinates against genuine AttachEnergyPrompt blockedTo targets before dispatch, without claiming to resolve card-specific mandatory attachment count. Its native paired rejection/allowed-target regression is in the same test suite, awaiting a separate successful manual CI run.


## Green generic blockedTo Store guard (08:05 UTC)

**[CI 41410246492](https://github.com/FlareZ123/experiment-01/actions/runs/41410246492)** compiled the unmodified vendor and executed **8/8 successful** native tests, including the new default-off universal blocked-destination Store guard. In physical seats 0 and 1, the generic wrapper saw the same pending source `AttachEnergyPrompt` and rejected one paper-illegal GX-directed physical selection **before native resolution**, with no Energy moved. It then allowed a second `ResolvePromptAction` targeting eligible Benched Duskull, actually transferring that Energy, without the already rejected selection corrupting the pending Store prompt. Audit per seat: `intercepted=2`, `blocked=1`, `allowed=1`, and `bySeat[owner]=1`. The same run preserved both upstream illegal baseline controls, both card-specific corrected guards, and both independent validator checks.

This strengthens the standalone optional generic module `simulation/twinleaf/agent45-paper-attach-blockedto-store-guard.cjs` as a **live Store safety correction**. It does not certify other cards' mandatory attachment counts or all nested source-game prompt families, and should remain explicitly opt-in until integrated two-seat policy trials independently reproduce complete source play and opponent responses.
