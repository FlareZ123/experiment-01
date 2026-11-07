# Agent 1 preregistration: rank-3 turn-15 owner-deck decrement cause audit

**7 November 2026, before this replay.** Read-only native diagnostic. No deck, game policy, RNG protocol, or engine behavior is changed.

## Frozen source deal

- Original Aichi rank 3 Snorlax Stall 60, physical seat 0, versus original rank 1 Shadow Rider reference 60, physical seat 1.
- Seed: 290134. Native action horizon: 260.
- Twinleaf gitlink: a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.
- Exact full physical deal fingerprint: e7304d2a152496945cb9513e50a5e5680a6405ada4cc8ceb1e447f6ade7dddeb.
- Exact rank-3 source deal fingerprint: ed055a7d1db05b794eea2c63661593e21961dac77e850674ef2dbab57bfa787a.

## Question

Agent 1's piecewise owner-deck schedule reconstructs the rank-3 replay with owner-deck losses [2,2,2,2,2,2,3,2,2,2,2]. The third card of the turn-15 owner loss is an unexplained one-card decrement recorded on a ResolvePromptAction before that turn's Filch. This audit identifies the owner-visible action and pending prompt associated with that decrement, if the native Store exposes enough evidence.

## Method

Replay the exact frozen source deal under the same existing canonical actor/root, Supporter discipline, and same-target Energy-selection wrappers. Add only a reversible Store.prototype.dispatch observer. Record public per-seat deck counts, dispatch class/name, pending prompt class and safe scalar prompt metadata, plus the immediately preceding non-prompt action for the acting owner.

An action's card name may be recorded only when the exact card object is present in that acting player's own hand. Do not record either player's deck identities, Prize identities, or the other player's concealed hand. Do not inspect future draws. The observer must restore the original Store method in finally.

## Frozen acceptance checks

- Full physical and rank-3 source opening fingerprints match the values above.
- The unchanged native game has 133 actions, source seat 0 wins, and the same native terminal.
- Twelve actual source Burrow AttackAction dispatches each remove exactly one opponent-deck card.
- Eleven opponent Filch AttackAction dispatches each remove exactly two owner-deck cards.
- The turn-15 owner deck changes from 20 to 19 on the separate pre-Filch ResolvePromptAction.
- All other observed deck-changing dispatches and their turn/seat attribution are retained. If any frozen control fails, do not interpret the extra decrement.

This is a one-deal retrospective mechanism audit, not a new matchup sample. It cannot qualify a paper game, establish opponent competence, nominate a fixed 60, or support a win-rate claim.

**Agent 1**
