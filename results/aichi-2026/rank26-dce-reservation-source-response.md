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

**Additional independent Tool-slot veto in the Mail arm:** The archived source first-turn PassTurnAction telemetry confirms that the automatic Float Stone BKT attachment went on **Active Meloetta ex**, not another Pokémon. Its public board listed Float Stone on that Active at pass. Technical Machine: Crisis Punch is itself a Pokémon Tool. The supplied Advanced Player's Rulebook B-02 permits one Tool per Pokémon and forbids freely replacing an attached Tool. The exact rank26 60 lacks a printed Tool-removal route that would undo this Float Stone attachment on Meloetta during that turn. Therefore even with hypothetical late DCE acceleration, the observed Mail branch separately forecloses first-turn Crisis Punch through the Tool slot. This is an actual root-choice setup policy veto; Float Stone's value on later turns is unresolved. The evidence comes from the retained publicBoardBeforePass field of the machine artifact. A credible attack policy must preserve Meloetta's Tool slot and attach Technical Machine: Crisis Punch to the intended attacker.

**Strategic negative control:** The current policy avoided an immediately dead-end Lightning for the intended first-turn Crisis Punch, but it also passed with the turn's Energy attachment still unused. That could harm the longer game if no DCE route is reachable. These data **do not establish an improved decision policy**; a better next experiment must separately choose whether to revert to a late basic Lightning when a held DCE or a feasible live search line is absent. Avoid rewarding a mere reduction in observed Lightning attachments. The original v3 attempt is a genuine tactical-miss witness only relative to the firstturn Crisis Punch objective; future-turn value is unresolved.

The result closes the pre-registered **narrow root-branch redirection** criterion on this seed. It explicitly fails the stronger attack-conversion goal: zero DCE attachments, zero first-turn Crisis Punch. If comparing v2 revisions, preserve this exact v1 policy identity and the full three-arm artifact rather than changing the meaning of its recorded decisions.

## Follow-up v2 falsification: recover late Lightning if other root tactics are exhausted

V1 created an identified strategic regression: Meloetta passed with ordinary attachment unused and no in-hand DCE. Opt-in `rank26-first-turn-dce-reservation-v2` keeps v1's held-DCE search and genuine non-Energy root-action deferral, but chooses the original legal basic Lightning if suppressing it would leave only `PassTurnAction`. V1 remains the default and retains its recorded behavior.

**Predeclared v2 acceptance:** unchanged rank26/rank6 printed 60s, seed 49957955, physical Meloetta seat B first, Cologne chosen first, and one real basic Lightning action **after** Hisuian Heavy Ball. The audit must name late-Lightning fallback. A missing fallback, early Lightning, illegal action or new root invalidates the probe. Even if v2 succeeds, it merely preserves future-turn Energy potential; Crisis Punch still needs DCE, correct Koko Bench positioning and a free Tool slot. This is a diagnostic selected seed, excluded from random game-performance denominators.

**Verified compiled v2 result:** [manual CI 39171273668](https://github.com/FlareZ123/experiment-01/actions/runs/39171273668) **succeeded** at head `46d9519e5fdf4d681fdc41b67c44334c924d0f43`, archived artifact [`12153020684`](https://github.com/FlareZ123/experiment-01/actions/runs/39171273668/artifacts/12153020684). The source first-own-turn root sequence was:

`Canceling Cologne → Hisuian Heavy Ball → ResolvePromptAction (Unown) → Bench Unown → Lightning Energy → PassTurnAction`.

Thus Lightning occurred **after** the real Heavy Ball search and Unown Bench, as predeclared. V2 logged a `defer-basic-lightning` followed by `late-basic-lightning-after-other-tactics-exhausted`. The manually attached Lightning was actually selected once. DCE remained unattached, Crisis Punch was never used and the source line could not convert to an immediate attack. V2 avoids v1's unused ordinary attachment on this root, retaining an Energy investment for a possible later turn. Its competitiveness and general conditional decision quality are untested. The first three v1 arms also passed again unchanged in the four-arm study.

## Follow-up actual Farewell Letter draw check, pre-registered before compiled run

The authenticated root has two genuine Benched Unown by its first Pass, yet the generic v3 bot did not declare **Farewell Letter**. The pinned Unown AOR 30 source applies its draw only after a real Ability activation: discard the Benched Unown, draw exactly one physical card; it does not count as a Knock Out. After held Cologne suppresses the opponent's active Iron Thorns Ability, this is a plausible owner-visible firstturn draw alternative. The absence of a prior declaration alone is a competence warning rather than proof that this draw is strategically better.

An opt-in one-use `withRank26FarewellDraw` uses the same unmodified rank26/rank6 60s, seat B, seed 49957955, and existing v2 late-Lightning + Mail extension. It selects Farewell on an **unattached** real Benched Unown, after any held Cologne has been played, only when the pinned live Store judges the action legal. The wrapper records owner-visible hand/deck count, Bench Unown count and public Prizes before and after, with no peek at hidden deck identities.

**Acceptance criterion:** the original first turn and source Colombo action remain verified; one actual firstturn `UseAbilityAction` for Farewell is chosen and accepted, the owner's physical deck count decreases exactly one, its Benched Unown count decreases exactly one, and opponent Prize count stays unchanged. The action must be followed by a real root, not merely a speculative draft. Failure of any invariant is a genuine failed mechanical/policy experiment. Whether the drawn card leads to DCE, Stadium, Tool, Koko acceleration, Crisis Punch or competent opponent response is an independently measured secondary consequence, never presumed from the legality proof.

Source: `simulation/twinleaf/rank26-farewell-source-draw.cjs`, pure guard tests `tests/rank26-farewell-source-draw.test.cjs`, fifth arm of `simulation/twinleaf/rank26-dce-authentic-source-probe.cjs`; opt-in existing manual `rank26_dce_probe`, no new workflow. This remains one retrospectively selected diagnostic opening, excluded from win-rate denominators.

**Compiled Farewell action and draw verified:** [manual CI 39171877932](https://github.com/FlareZ123/experiment-01/actions/runs/39171877932) **passed**, pinned head `260ad8c2cf39396746f0b00aaaa21eadc4127d61`, full [source action artifact 12152458012](https://github.com/FlareZ123/experiment-01/actions/runs/39171877932/artifacts/12152458012). The actual Store accepted one **Farewell Letter** `UseAbilityAction` at global turn 1/action ordinal 18, targeting physically Benched, unattached `Unown AOR`. The source owner-visible before/after evidence is:

| Root observable | Before Farewell | After Farewell |
| --- | ---: | ---: |
| Own deck card count | 43 | 42 |
| Own Benched Unown | 1 | 0 |
| Own discard Unown | 0 | 1 |
| Opponent remaining Prizes | 6 | 6 |

The new drawn physical card was **Hisuian Heavy Ball ASR**, verified from owner hand after root dispatch. The full source-first decisions were `Cologne → Trainers' Mail → resolve to Float Stone → Farewell Letter → Float Stone attached to Active Meloetta → Heavy Ball → resolve to Unown → Bench Unown → basic Lightning Energy → Pass`. All decklists, source seed, turn and original draw-log invariants were held constant. The one Farewell activation gave a real card and freed a Bench slot transiently. The bot still spent its sole manual Energy on Lightning, equipped Float Stone to Meloetta (contending with Crisis Punch TM Tool) and **declared zero firstturn Crisis Punch attacks**. At source action cap 100, `finished:false` remains an incomplete diagnostic, not an opponent loss.

**Outcome classification:** one genuine source-root, owner-observation-conditioned ability and draw response now verified. No initial hand re-staging, no new hidden-card peek and no synthetic opponent move. The follow-up falsifies any theory that a single Farewell draw suffices to fix this particular firstturn strategy; the random printed drawn card did not advance the immediate DCE+TM line. Whether Unown should be saved for alternative tactical usage remains matchup-dependent, and a multiple-seed held-out distribution is still absent.

The experiment is a source-first-turn policy test, not a competitive-game win rate. Its source state was retrospectively selected, so success or failure should not be included in prospective performance denominators. The Top32 source-list audit remains 29/32 with ranks 23,25,28 missing and zero independently qualified competitive games.
