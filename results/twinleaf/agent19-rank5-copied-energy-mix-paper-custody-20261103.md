# Original rank-5 Mew copied Energy Mix: physical DCE payoff, native target and shuffle fidelity

**Agent 19, 3 November 2026. Research scope: authentic Aichi rank-5 printed original and actual pinned Twinleaf Store. Zero competitive-qualified games.** 

## Question and physical source

The original rank-5 Yamato Nakano Mew/Genesect sixty in `results/aichi-2026/full-decklists.json` contains **4 Mew V FST113, 3 Mew VMAX FST114, 4 Genesect V FST185 and 4 Double Colorless Energy SUM136**. It contains no Basic Energy. A real Mew VMAX with DCE can pay `Cross Fusion Strike` [C][C] and copy Benched Mew V's `Energy Mix`. The printed `Energy Mix` searches for an **Energy card**, attaches it to **one of your Fusion Strike Pokémon**, and instructs shuffling the deck. A DCE qualifies as an Energy card. The provided Advanced Rulebook § C-18 supports copying attacks without paying the copied attack's printed cost.

The relevant pinned Twinleaf implementation is `ptcg-server/src/sets/09-sword-and-shield/set-fusion-strike/mew-v.ts` at submodule **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**, paired with `mew-vmax.ts`. All engine tests here use that pin and leave vendor sources unchanged.

## Genuine original-source native archive: only four physical DCE gains

Analyzed existing Agent22 original rank-5 native **16-attempt, four-fresh-seed-group, two-candidate-context, two-policy-mode** archive. It was preregistered by Agent22 and executed at [successful CI 41577868458](https://github.com/FlareZ123/experiment-01/actions/runs/41577868458), [artifact 13204622386](https://github.com/FlareZ123/experiment-01/actions/runs/41577868458/artifacts/13204622386); SHA256 of original ZIP `6cc2318de387ea1eaee88b697c192618bbe6ec8733d48a5f321567e1bbb41a5a`. Agent22 had already proved each mode's 39 native-settled Cross Fusion declarations comprise 15 `Techno Blast`, 20 `Energy Mix`, and 4 with no copied-attack choice. **This investigation adds the actual Energy-attachment payoff.**

For **each** identical policy mode, the distinct native copied-attack source roots have:

| Source printed attack choice | Actual accepted native Energy prompt | Public Source board DCE gain | Outcome |
| --- | ---: | ---: | --- |
| 20 Mew V `Energy Mix` copies | 20 | 4 | Four native DCE attachments to Benched Mew V FST |
| Same remaining 16 `Energy Mix` copies | 16 | 0 | No public Energy gain at attack settlement |

The two modes have **identical original complete root histories**, so the 4 transfers per mode are repetitions of the same four original-source events. They occur in candidate contexts `5:0:A:champion-reference`, `5:0:B:new-moon-lockbreaker-v1`, `5:1:B:champion-reference`, and `5:1:B:new-moon-lockbreaker-v1`; the last two share an original source seed group. They do not constitute eight independent successes. All 16 zero-gain events still have one accepted native `AttachEnergyPrompt`; the public source Energy count stays constant. They might result from a genuinely inaccessible DCE, a failed/empty optional search, or another owner-prompt limitation. Exact hidden source deck availability was not independently captured, and a zero-gain event should not be labeled an illegal or incompetent decision without that information.

The reusable, owner-action-independent audit is [`simulation/evaluation/agent19-energy-mix-custody-audit.cjs`](../../simulation/evaluation/agent19-energy-mix-custody-audit.cjs), with [eight synthetic regression tests](../../tests/agent19-energy-mix-custody-audit.test.cjs). It joins `sourceAttackSettlement.attacks[].actionOrdinal` to a unique real `ChooseAttackPrompt` root, verifies the same non-cross-epoch Attack settlement, and joins exact-window `nativeAcceptedEnergyPromptSidecar.events[].dispatchOrdinal` and source-owner public board Energy changes. Missing or ambiguous trace elements remain unqualified. Referee-only opponent hidden zones and assumed card identities are not consulted by the decision policy.

## Compiled both-seat constructed Store proof: illegal Energy destination

The independent [native constructed-board witness](../../simulation/twinleaf/agent19-mew-energy-mix-native.cjs) uses original printed Mew V, Mew VMAX, Genesect V, Crobat V, Mimikyu PAL and DCE. The attack is an actual native `Store.dispatch(AttackAction)` followed by actual `ChooseAttackPrompt` and `AttachEnergyPrompt` resolutions. Twelve raw arms cover both physical seats, Fusion Strike Genesect or Mew versus non-Fusion Crobat recipient, and DCE present/absent in the deck.

- Four arms transfer a real deck DCE to eligible Genesect V or Mew V; the original attacking DCE remains physically attached.
- Two arms physically attach a real deck DCE to **non-Fusion Strike Crobat V**, violating the printed Energy Mix target restriction. The native `AttachEnergyPrompt.validate()` accepts this target despite `blockedTo` containing it. The native Store also accepts that physical card transfer.
- Six arms have no searchable DCE and produce no DCE transfer, while the attack's native prompt still settles.
- A separately instrumented five-card deck places DCE *between* other cards. In all corresponding constructed arms, the remaining deck cards retain the identical relative order, and **no `ShuffleDeckPrompt` occurs**. The printed Energy Mix requires shuffling after search. This is a distinct paper-fidelity issue. It has not yet been corrected by a tested shuffle hook.

A reversible, default-off research-owned Store hook [`withPaperAttachEnergyBlockedTo`](../../simulation/twinleaf/agent19-paper-attach-energy-target-guard.cjs) checks `AttachEnergyPrompt.options.blockedTo` against the actually selected native target before `ResolvePromptAction` reaches Store. Both compiled source physical seats **reject** the previously accepted illegal Crobat attachment with `PAPER_ATTACH_ENERGY_BLOCKED_TO`; both still accept a correct Genesect target. It restores the original Store descriptor after completion or error, with no vendor modifications. [Four independent unit tests](../../tests/agent19-paper-attach-energy-target-guard.test.cjs) exercise forbidden, permitted and unrelated prompts and restoration.

### Actual CI / artifact evidence

- [First 12-arm compiled Store result: CI 41592543388](https://github.com/FlareZ123/experiment-01/actions/runs/41592543388), [artifact 13210702695](https://github.com/FlareZ123/experiment-01/actions/runs/41592543388/artifacts/13210702695). Native witness and 4 hook tests passed.
- [Both-seat guarded Store result: CI 41593058081](https://github.com/FlareZ123/experiment-01/actions/runs/41593058081), [artifact 13211201766](https://github.com/FlareZ123/experiment-01/actions/runs/41593058081/artifacts/13211201766). 12 raw arms plus 2 guarded legal/illegal contrasts passed.
- [Exact deck-order and audit-test result: CI 41594090052](https://github.com/FlareZ123/experiment-01/actions/runs/41594090052), [artifact 13211392900](https://github.com/FlareZ123/experiment-01/actions/runs/41594090052/artifacts/13211392900). 8 payoff-audit and 4 hook pure tests passed, all compiled native Energy Mix arms and both guarded contrasts passed. The two physical source seat variants agree on the missing shuffle prompt and unchanged deck remainder.
- **All three broader workflow runs are red due to a separate existing Snorlax/Arceus `INVALID_TARGET` testcase**, which executes after these green named steps. Neither the entire workflow nor that older testcase should be described as green. The complete named native receipts and failures are preserved in GitHub Actions.

## Research interpretation and release veto

A source `Cross Fusion Strike` declaration is not necessarily a damaging attack; choosing `Energy Mix` is not proof of acceleration. This source-dealt panel has 20 true selected copies per policy, but only 4 observed native DCE gains. The initial positive copies physically move Energy, so labeling all non-damaging copies useless would also be wrong.

The paper target restriction and shuffle mismatch mean **native source-dealt Energy Mix games are not yet paper-fidelity certified**. The new blocked-target hook has only a constructed-board both-seat proof, has **not been enabled in a selected symmetric full-game release**, and does not repair the shuffle behavior. A future selected common policy must explicitly decide whether to version and deploy the correction, run same-source-deal controls, establish shuffle fidelity, and then test consequential opponent replies. Do not retroactively award wins or change candidate ranking from this finding.

**Global qualification:** 29/32 authentic opponent original sixties (23, 25, 28 unavailable), zero paper/clock/opponent-competitively qualified games, no fixed optimized 60 selected, no credible 99.5% field win-rate claim.
