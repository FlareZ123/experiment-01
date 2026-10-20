# Owner-known-top preservation in native hidden-order contrasts (Agent 18, 20 October 2026)

## Question and narrow finding

Does the exploratory [native owner-deck-order counterfactual](../../simulation/twinleaf/native-tape-hidden-order-contrast.cjs) preserve a legally observed top-of-deck prefix? Previously its `original.reverse()` operation moved **every** remaining card, including any previously viewed top card. If a player knows their next draw, this counterfactual can leave that player's information set; an action reversal then gives misleading evidence for a hidden-order policy leak.

The pinned Twinleaf [CardList implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/state/card-list.ts) removes the top cards with `this.cards.splice(0, count)`. Index zero is therefore the top of this native array. This is an upstream-code observation rather than a general rule about other engines.

## Correction and falsifiable checks

The original behavior remains the default exploratory path when no top-card knowledge is claimed. The optional `knownTopCount` and `knownTopVerified` fields now:
- Require a nonnegative integer count and an affirmative caller verification assertion when count is positive.
- Preserve `deck.cards.slice(0,knownTopCount)` exactly, reversing only the remaining unknown suffix.
- Abort when the unknown suffix contains fewer than two cards, because no meaningful reversal is possible.
- Require an unchanged actor-visible observation and the exact same-world native root, action callback and RNG tape provenance before reporting an executable hypothetical comparison.
- Emit `preservedKnownTopCount` and `callerAssertsKnownTopVerified`, but leave `ownerDeckKnownTopAuthenticated:false` and `informationSetLeakQualified:false` until an independently authenticated owner-knowledge ledger exists.

New synthetic regression cases in [native-tape-hidden-order-contrast.test.cjs](../../tests/native-tape-hidden-order-contrast.test.cjs) verify a preserved known top, rejection of unverified/invalid counts, rejection of an unpermutable suffix, and veto of whole-deck reversal when the known top is included in the actor observation. They supplement preexisting root/tape/callback and mutation negatives.

The existing **manually dispatched** [hidden-order CI workflow](../../.github/workflows/twinleaf-hidden-order.yml) now runs native RNG and parity tests before compiling Twinleaf. No per-commit CI trigger was introduced.

## Evidence

- Source commits: [f808d0f](https://github.com/FlareZ123/experiment-01/commit/f808d0f3dd8870028bf4e5c06307ff2a41284e17), [699ccb1](https://github.com/FlareZ123/experiment-01/commit/699ccb1c8a9ad23bb005a9e64c1dd75ad8c4b123).
- Test commits: [464ae23](https://github.com/FlareZ123/experiment-01/commit/464ae230f3fe8b1532a93875c6b98ddfa8867364), [41ff109](https://github.com/FlareZ123/experiment-01/commit/41ff109e3a214d39f2abf6b2069671bcf628c1f0).
- Initial manual workflow [39502361791](https://github.com/FlareZ123/experiment-01/actions/runs/39502361791): **success**, head `ff02cdf08f0868674fe0f07902aca596f1546cc6`, includes the four new tests and the initial report-field spelling.
- Follow-up manually dispatched workflow [39502706739](https://github.com/FlareZ123/experiment-01/actions/runs/39502706739) includes the final fail-closed report-field adjustment; its status must be checked independently before claiming a pass.

## Limits and next real decision gate

This change reduces one class of false-positive hypothetical comparisons. The caller's `knownTopVerified` assertion is still **not native proof** of the owner's actual historical observed-top information. Neither K0/K1 history nor observed Prize positions nor arbitrary reordered cards are automatically proven by this helper. This diagnostic cannot certify actor-only policy decisions or game win rates.

The next integration step is to feed a genuinely authenticated known-top observation ledger, from a real owner-observable card effect, into the same-root comparison, then test an actual Store-root action under information-identical physical worlds. Preserve any failed arms and action counters. Do not treat matching actorObservation outputs, native replay parity, or exploratory reversals alone as information-set equivalence or competitive strength.

Current field qualification remains **29/32 verified opponent 60s, zero competitive-qualified games; 99.5% unproven**.
