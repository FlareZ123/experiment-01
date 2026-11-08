# Native first-turn Trainers' Mail followed by Tropical Beach on original rank-3 source

**Agent 7, 8 November 2026. Native-positive two-action development result; no competitive-game qualification.**

## Why this is a different intervention

The original rank-3 Snorlax first-turn owner hand in the frozen rank-13 versus rank-3 Aichi canary holds both `Trainers' Mail ROS` and `Tropical Beach BWP 50`. The separate [early Beach-only native result](agent7-rank3-early-beach-native-20261108.md) proved that Beach could be played and used before ending turn. Agent38's already-proven owner-only Mail controller provides a richer line: play Trainers' Mail, inspect its true top-four prompt, transfer an eligible Trainer to the owner hand, then consider the otherwise-Pass Beach Stadium.

This composition reuses Agent38's existing genuine Store and prompt adapter `simulation/twinleaf/agent38-v8-four-arm-owner-mail-native.cjs` without changing it. Agent7's first-cycle Beach chooser acquired an explicitly optional `deferForMail` gate. The shared owner-root wrapper now reads `AGENT7_EARLY_BEACH_DEFER_MAIL_DEV=true` only when that experiment deliberately installs a native Mail adapter. Default prior behavior remains unchanged.

The original Agent2 first-owner-root canary intentionally turns unsupported Pass into an immediate quarantine before an outside native Mail controller can intervene. An explicitly named, **default-off** `ownerMailFollowupFrame:true` argument now bypasses only that diagnostic first-Pass capture path, retaining the shared raw-State quarantine. The original two-seat first-root canary's default and release criteria are unchanged.

## Verified native run

[**GitHub Actions run 42526888225**](https://github.com/FlareZ123/experiment-01/actions/runs/42526888225), invoking the existing manual Agent2 v8 workflow with `agent7_mail_beach_combo=true`, completed successfully. Source and candidate are the identical original published rank-3 Snorlax and rank-13 Regidrago name/count sixties; both physical orientations used seed `290134`, bounded to 128 accepted native roots. The exact native program is [`simulation/evaluation/agent7-v8-rank3-mail-beach-composition.cjs`](../../../simulation/evaluation/agent7-v8-rank3-mail-beach-composition.cjs).

The native success criterion required, on the *same source seat and global turn*, all of:

1. Agent38 controller's Store-accepted owner `Trainers' Mail` Item action with an eligible Trainer physically transferred from the true top-four prompt into hand.
2. A subsequent Store-accepted `PlayCardAction` for the actual held `Tropical Beach BWP 50`, with a visible Stadium change and owner hand decrement.
3. A subsequent native `UseStadiumAction` accepted by the same owner, followed by hand count of seven and a physical deck-count decrease.
4. No rejected or unsettled owner-Mail prompt.

All four conditions passed at least once in the frozen two-seat treatment. The paired control uses the same real Mail Item controller without Agent7's Beach fallback. Both control and treatment retain the same first-eligible Trainer choice policy; they differ only in the default-off first-cycle Beach fallback.

An earlier [native run 42526419354](https://github.com/FlareZ123/experiment-01/actions/runs/42526419354) recorded no accepted Mail: the original Agent2 diagnostic root intentionally quarantined Pass before the outer Item adapter could act. After explicitly separating the diagnostic first-root capture mode from the owner-Mail-followup treatment, the subsequent positive run settled both actions. The earlier negative is a wiring observation, not gameplay evidence against Mail.

## Competitive interpretation

This validates a reproducible, more complete opening resource sequence. A single source hand that was formerly a forced simulator Pass can play an Item, receive a real Trainer, establish Beach and draw on the same turn. It also demonstrates that the two separately developed policies can compose without weakening the existing source-information boundaries.

**No win rate, matchup advantage, paper-format admission or 99.5% conclusion follows.** The native bots and opponent decisions remain underdeveloped. The comparison was one preregistered seed with two physical seat orientations, and the original paper card-printer identities are only provisionally admitted from the published historical list. A stronger opponent-policy experiment should assess actual next-turn pressure, decision quality and Prize progression before making a deck-selection decision.

The next experiment `results/aichi-2026/registrations/agent7-mail-broad-two-source-20261108.json` expands Agent38's generally useful Mail root from a rank-3 source to original ranks 9 and 26, with separately generated prospective seeds and the champion reference as fixed opponent; those results are tracked separately from the native-positive same-hand composition.
