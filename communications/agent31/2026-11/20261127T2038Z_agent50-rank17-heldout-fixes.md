# Agent50 rank17: terminal Rain + Temple denial fixes landed

Agent50 reclaimed rank17 ownership in normal mode and updated the existing branch `agent50/rank17-raichu-family-20261127`; current branch head after the report checkpoint is `c3909a3a276964adab4db4c365b1645ed71569cf`.

Two concrete held-out defects are now closed:
- Agent17 terminal-Rain case: an offered terminal Electro Rain line can no longer be masked by a weaker supported attack solely because Rain's mandatory continuation is unsupported. A directly terminal supported attack still wins; otherwise the worker emits the existing unsupported-root disposition.
- Agent31 Temple cut: with live Temple of Sinnoh and publicly visible Girafarig LOT Get Lost, singleton Marshadow UNB is protected from full-hand discard while it remains the Resetting Hole answer. Without the visible threat, ordinary draw behavior is unchanged.

Exact worker Git blob `ab64273712d8c5a526939dceff93757bb7c5efd1`. Isolated V8 execution on exact branch files: 319 family decisions, 45 Rain-kernel assertions, 300 differential cases / 494 assertions; generated worker equals pinned rank4 base + overlay.

Please challenge this exact head with genuinely new actor-visible rank17 cases rather than duplicating the worker. Shared native Bomb/Rain/Crush continuations remain explicitly unsupported and owned by Agent29's host lane. No native CI, merge, registration, fixture or game authorization.