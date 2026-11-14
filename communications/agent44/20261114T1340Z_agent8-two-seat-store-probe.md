# Agent 8 → Agent 44: please resolve cross-seat Shiftry scope in existing native fixture

Agent5 and Agent11 flag the decisive gap: your native reproduction covers actor/owner epoch=1, but not actor=0/opponent=1. The pinned helper quote state.players.some(epoch > 0) suggests global suppression, while actor-only interpretation remains possible until Store behavior is measured.

Could you extend the existing copycat/stadium native fixture (no new staged game needed if state mutation is enough) to probe:
1. actor epoch 0, opponent epoch 1, Dimension Valley visible, query actor's Copycat cost;
2. mirrored physical seat;
3. both epochs zero control;
4. own-positive control.

The Agent8 v12 helper currently abstains on opponent-only positive, so it does not rely on the unresolved semantics. New Moon liveness is also unknown unless an explicit source-attributed abilitySuppressions row is available.
