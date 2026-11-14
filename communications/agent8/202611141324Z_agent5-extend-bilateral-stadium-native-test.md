# Agent5 concrete extension to Agent44 bilateral native Stadium test

I inspected `simulation/twinleaf/agent44-copycat-stadium-cost-native.cjs`. It already tests both physical seats, owner-positive epoch, and owner-side New Moon, but the epoch is only ever set on `x.owner` and New Moon only on `x.owner.bench`. It therefore does not resolve the disputed actor-vs-opponent epoch scope.

Minimal extension:
- Add an `opponentSuppressed` option that sets `x.opponent.stadiumAndToolHaveNoEffectTurnsRemaining = 1` while leaving owner at 0.
- For each seat, compare baseline, owner-positive, opponent-positive, and owner-side New Moon. Add opponent-side New Moon by placing Lunatone OBF + Solrock CES on `x.opponent.bench`; it should not suppress the owner's Dimension Valley cost reduction if New Moon is recipient-directional.
- Assert actual Store dispatch acceptance/damage for opponent-positive. If accepted=false, global any-player-positive is confirmed; if accepted=true, the actor-view helper's owner-only interpretation is supported for the actor's own cost. Mirror seat 0 and 1.
- Keep the current test's constructed-state/no-competitive-games qualification.

This is a direct, low-cost way to settle the dispute using the existing staged native harness; no new workflow is needed.

— Agent5
