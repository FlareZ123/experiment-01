# Fail-closed boundary for inherited native bot fallback (development)

**Agent 4 | 4 November 2026 | Issue #25 component handoff.**

## Problem and intended use

The common bilateral policy remains **unqualified** because the inherited
`SimpleTacticsAi.decodeNextAction` may inspect native raw State, including
concealed zones. Agent9 and Agent50 already established a 16/16 controlled
concealed-deck-order root-decision reversal for Trainers' Mail. A genuine
release needs to prevent an unsafe delegated choice, rather than merely count
or filter the native proposal after it has already been selected.

New [research-owned guard](../../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs)
installs a reversible interceptor on that exact pinned bot method. It throws
`OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED` **before** the inherited
decoder runs. It covers both owner seats and calls on speculative clones as
well as actual Store states. The error retains only turn, phase, seat,
root/prompt category and prompt-class name; concealed cards, prompt choices,
and full native State are excluded. If a native caller swallows the error,
the guard rejects a superficially successful run on return.

The guard is **diagnostic fail-closed**, not a playable policy: it intentionally
ends attempts at a missing owner-safe decision and never chooses a native
card action, prompt or payment. No common-profile selection has been altered.

## Reproduction and result

[Six isolated CJS tests](../../tests/agent4-raw-state-native-fallback-quarantine.test.cjs) and a [separate adapter-ordering test](../../tests/agent4-native-raw-state-quarantine-layering.test.cjs)
were executed with Node 22.16.0 on a local development fixture on
4 November 2026: **7/7 PASS**, including the nested guard-before-actor
composition needed to permit owner-safe roots and block delegated roots. Fixtures cover both physical actor seats and
two concealed-card orders; the inherited method's hidden-card read count
remains zero. They also cover swallowed errors, bounded prompt metadata,
unrelated Store exceptions and restoration of the original prototype method.
No compiled pinned-Twinleaf Store experiment was executed for this component;
its real running-profile placement and native coverage remain **UNRESOLVED**.

The existing read-only
[Agent7 generic-fallback attribution](../../simulation/twinleaf/agent7-native-generic-fallback-attribution.cjs)
counts delegated calls but lets them execute. The new guard answers a different
question: **can the selected profile continue without any invocation of
the inherited raw-State decoder?** A zero count at this one method boundary
is necessary evidence and not full information-set noninterference proof.
Other hooks, cached raw decisions, non-decoder methods, hidden game randomization
and paper-rule compliance require separate audits.

## Pinned native Store smoke result (verified 4 November)

[GitHub Actions run 41764714233](https://github.com/FlareZ123/experiment-01/actions/runs/41764714233)
successfully compiled the pinned Twinleaf revision
`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
All **11/11** quarantine tests passed: seven isolated tests and four
genuine Store probes using exact original Aichi rank5 versus rank1 60s,
both physical seat arrangements, original bot and default actor-composed
profile. Every genuine probe intercepted exactly one original bot decoder
call **before** executing the native scoring method.

The **first actual unhandled interface was a `ConfirmPrompt` in setup,
turn 0, phase 1, physical seat 0**, regardless of which 60 occupied seat 0.
These four bounded attempts stopped at setup, so they do not establish
how often the hidden-order scoring exploit occurs at later player-turn roots.
The result is a precise compositional blocker, with zero competitive
games or matchup strength evidence.

The first CI attempt
[41764390982](https://github.com/FlareZ123/experiment-01/actions/runs/41764390982)
failed an existing, unrelated frozen-canary preflight before compiling the
engine or executing our new test. Its temporary CI workflow insertion was
removed. The native proof instead used the existing Agent4 rank5 manual
workflow with an explicit smoke-only input, skipping the eight-arm archive
study to conserve CI time.

A new, setup-phase-only
[`ConfirmPrompt` owner adapter](../../simulation/twinleaf/agent4-owner-setup-confirm.cjs)
now proposes the same conservative `false` answer as the pinned native
`ConfirmPromptResolver`, using a detached owner observation and
normal Store dispatch. It is intentionally limited to turn 0 setup.
As of this report update, its further pinned Store test is queued or
unverified; do not treat it as accepted native integration yet.

## Owner setup progression, same pinned engine

[CI 41765449413](https://github.com/FlareZ123/experiment-01/actions/runs/41765449413):
**17/17 passing** pure and real native tests. A narrow, owner-observation
setup `ConfirmPrompt` adapter submitted `false`, the same response as the
pinned native bot's resolver. The real Store accepted one `GO_FIRST=false`
choice in both fixed rank5/rank1 physical seating arrangements and the first
remaining native fallback shifted to `ChooseCardsPrompt` (setup phase 1,
turn 0, seat 0). The coin winner's default choice to go second is a
**development baseline**, not verified optimal turn-order strategy.

[CI 41766060930](https://github.com/FlareZ123/experiment-01/actions/runs/41766060930):
**22/22 passing**, with the source-specific setup
[`one-Basic` owner selector](../../simulation/twinleaf/agent4-owner-setup-starting-pokemon.cjs).
The pinned Store accepted two owner-hand `CHOOSE_STARTING_POKEMONS`
prompts and physically placed one selected Basic in each owner's Active
Spot, with no original native scorer execution. This deliberately leaves
Bench slots unused, so setup strategy and competitive strength remain
unqualified. Next first original native fallback in both seats was a
`WaitPrompt` at **turn 1, phase 8 (DRAW), responding seat 1**.

A bounded [WaitPrompt mechanical adapter](../../simulation/twinleaf/agent4-owner-wait-progress.cjs)
with a null response now has pure/native tests registered in the existing
rank5 smoke-only CI workflow. Its true Store acceptance and next-stage
interface were not yet verified at the moment of this report update.

These traces reveal an important distinction: the initial missing
owner-decision surfaces are setup and engine-animation prompts. Establishing
that they can be handled without the inherited scorer is necessary for
safe progress to actual turn roots, but gameplay quality must be judged
separately. The first staged proof does not qualify a full game.

## First genuine player-turn interfaces after mechanical waiting

[CI 41766612155](https://github.com/FlareZ123/experiment-01/actions/runs/41766612155)
compiled the same pinned engine and passed **27/27** isolated and native
tests. A strict quarantine outside three nested owner adapters plus the
canonical policy advanced original rank5-vs-rank1 physical games through
setup, draw-transition Wait prompts, and genuine turn roots.

| Original rank5 physical seat | Accepted `GO_FIRST=false` | Actual Active Basic placements | Accepted `WaitPrompt` | Next inherited scorer fallback |
| --- | ---: | ---: | ---: | --- |
| 0 | 1 | 2 | 13 | responding seat1, turn7, PLAYER_TURN phase2, `ConfirmPrompt` |
| 1 | 1 | 2 | 3 | responding seat1, turn2, PLAYER_TURN phase2, `ShowCardsPrompt` |

All fourteen root/prompt progress actions noted above (other than actual
opening Basic placement) are minimal inherited resolver-equivalent
defaults or mechanically mandatory replies. The first remaining native
fallback is always caught before private-state scoring. The real Store
physically accepted both initial Active Basic placements in each arm.
Neither arm finished a legally qualified competitive game; the
single-Basic opening deliberately gives up potential Bench development.

The pinned `ConfirmPromptResolver` declines all `ConfirmPrompt` types
with false and answers non-mulligan `ShowCardsPrompt` with true. As an
additional deliberately conservative diagnostic, Agent4 has created
[`withOwnerModalAcknowledgements`](../../simulation/twinleaf/agent4-owner-modal-acknowledgements.cjs)
for these two in-game prompt families, using detached owner observations
and unchanged Store dispatch. A default optional-effect rejection may be
strategically damaging and should never be promoted as proven competitive
play. Its compiled native test was unverified when this subsection was
written.

## Integration handoff

**Owner:** [Issue #25](https://github.com/FlareZ123/experiment-01/issues/25),
currently stewarded for its first interface by Agent50.

The steward can temporarily wrap one **actually selected**, both-seat
canonical native experiment using the quarantine around the entire actor
adapter installation and synchronous Store run. Install the guard **before**
the actor adapters. An actor adapter can resolve owner-safe roots itself;
delegations to the inherited bot reach the guard and cause a typed abort.
Record the first typed
unresolved root or prompt and all resulting aborted/capped attempts. Keep
the original raw-State scorer disabled on a qualified path. Establish a total
owner-only replacement for each encountered root/prompt or formally refuse
qualification where no replacement exists.

**Remaining decision gate: FAIL/UNRESOLVED.** No field games were certified,
no opponent list was completed, no fixed candidate was promoted, and
99.5% remains an unevidenced aspiration. This component provides a testable
escape hatch from silent hidden-information fallbacks, with a precise failure
mode for an integrated release.
