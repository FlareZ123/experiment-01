# Rank26 Meloetta first-turn Double Colorless reservation, source-dealt decision counterfactual

**Agent 4, 18 October 2026.** Source-mechanics and bot-decision research. All results in this report are unqualified for competitive-game inference.

## Decision and falsification contract

Source: exact registered rank26 Meloetta 60 versus exact rank6 Iron Thorns 60, physical Meloetta seat B, genuine shuffled seed **49957955**; pinned Twinleaf submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Both source decklists are obtained through `planAichi(26)` with the same existing Japanese-promo and Basic-Energy compatibility mapping. The source draw log must verify that Meloetta takes the first turn and the same first root chooses a **held Canceling Cologne**. This was retrospectively identified by earlier Agent4 experiments and is deliberately excluded from prospective win-rate denominators.

Earlier authentic [compiled source experiment](https://github.com/FlareZ123/experiment-01/actions/runs/39141327634) observed the generic bot spending its first and only ordinary attachment on basic Lightning despite a first-turn `Crisis Punch` plan needing three Colorless Energy. The [source-resource invariant](rank26-manual-lightning-energy-dead-end.md) shows that this consumes the only turn-one path to three effective Energy units: sole DCE provides two, while Tapu Koko Prism Star can accelerate at most one Lightning to Meloetta. The current source policy's first-turn attachment choice is therefore a precise tactical failure.

**Experiment:** preserve original physical source deal and both decklists. Compare (1) unchanged rank26 Cologne/Pump/Propagation v3, (2) v3 with versioned `rank26-first-turn-dce-reservation-v1` overriding only a bot-selected first-turn manual Lightning, and (3) the same guard with an independent hand-visible Trainers' Mail scout. The guard first tries a legal hand-held DCE attachment to the Active; if unavailable or illegal, it defers the basic Lightning choice to the other source bot tactics, retaining ordinary attachment eligibility. The counterfactual reads source seat's hand and public board, but does not inspect hidden deck, hidden Prizes or opponent hand.

**Falsification threshold:** all arms must share source identity, seed and actual starting seat, as verified by source draw log. The guard must actually intercept a root Lightning choice and execute **zero first-turn basic Lightning attachments** in the engine decision trace. Any repeated Lightning, illegal DCE action, unhandled prompt or divergence before the source root is a policy failure and must be retained as a negative result. A passing guard only proves removal of the narrow early attachment veto. The full Energy plus Tool, five self-KO line, AttackAction and real opposing response remain independently unqualified.

## Executable evidence

- Policy: `simulation/twinleaf/rank26-dce-reservation.cjs`.
- Pure guards: `tests/rank26-dce-reservation.test.cjs`.
- Paired source runner: `simulation/twinleaf/rank26-dce-authentic-source-probe.cjs`.
- Existing opt-in manual CI: `.github/workflows/aichi-damage-pump-fidelity.yml`, input `rank26_dce_probe`.
- First manually dispatched run: [39170480551](https://github.com/FlareZ123/experiment-01/actions/runs/39170480551), head `99b50a4efb08bdecae4bf20ad85c455ff9dc4fff`: **successful**, including all new pure guard tests and actual source-dealt three-arm Store execution. This is a mechanical/policy-selection success only.
- Machine artifact: [`rank26-dce-source-probe-unqualified`](https://github.com/FlareZ123/experiment-01/actions/runs/39170480551/artifacts/12152128352), artifact ID `12152128352`, contains complete bounded first-turn root decisions and policy audit.

## Compiled authenticated result: guarded Lightning changes to Pass without firstturn DCE

The completed source-dealt game, unchanged 60s and seed, draw-log-verified Meloetta first, produced these first-own-turn sequences:

| Arm | Actual first-turn root selected cards/actions | Basic Lightning attachments | Double Colorless attachments | First-turn Crisis Punch |
| --- | --- | ---: | ---: | --- |
| Unchanged v3 | Cologne → **Lightning Energy** → Hisuian Heavy Ball → resolve prompt → Unown → Pass | 1 | 0 | No |
| DCE reservation v1 | Cologne → Hisuian Heavy Ball → resolve prompt → Unown → **Pass** | 0 | 0 | No |
| Mail scout + DCE reservation v1 | Cologne → Trainers' Mail → resolve prompt → Float Stone → Hisuian Heavy Ball → resolve prompt → Unown → **Pass** | 0 | 0 | No |

The guard was exercised in the real bot and first deferred its basic Lightning for a legally selected Hisuian Heavy Ball action; the Mail arm also autonomously selected its held Mail and played Float Stone. The source first-turn DCE card was **not held at the checked attachment decisions** (`heldDce:false` in all five recorded guard interventions). Both guarded arms finally selected `PassTurnAction` with the manual Energy attachment **unused**. All arms were truncated at 100 total actions with `finished:false`; `winner:-1` here is a nonterminal runner sentinel, never a winner. Printed Crisis Punch was not executed in any first turn.

**Strategic negative control:** The current policy avoided an immediately dead-end Lightning for the intended first-turn Crisis Punch, but it also passed with the turn's Energy attachment still unused. That could harm the longer game if no DCE route is reachable. These data **do not establish an improved decision policy**; a better next experiment must separately choose whether to revert to a late basic Lightning when a held DCE or a feasible live search line is absent. Avoid rewarding a mere reduction in observed Lightning attachments. The original v3 attempt is a genuine tactical-miss witness only relative to the firstturn Crisis Punch objective; future-turn value is unresolved.

The result closes the pre-registered **narrow root-branch redirection** criterion on this seed. It explicitly fails the stronger attack-conversion goal: zero DCE attachments, zero first-turn Crisis Punch. If comparing v2 revisions, preserve this exact v1 policy identity and the full three-arm artifact rather than changing the meaning of its recorded decisions.

The experiment is a source-first-turn policy test, not a competitive-game win rate. Its source state was retrospectively selected, so success or failure should not be included in prospective performance denominators. The Top32 source-list audit remains 29/32 with ranks 23,25,28 missing and zero independently qualified competitive games.
