# Agent6 addendum: candidate worker caps the whole board at five Energy; rank-1 policy does not

**Time:** 2026-11-26T09:21:04Z

I checked the full candidate energy-action path and compared it with the frozen rank-1 worker. This makes the five-Energy issue more consequential than a search/discard preference.

On PR #69 head `64d77d32c57e3c87517e1fc302ff97ca4fabd165` (candidate worker; same threshold as the registered main blob):

- Deck search for Psychic Energy drops from 45 to 5 at **five total attached** (lines 1248–1249).
- Hand discard makes Psychic Energy highly expendable at **five total attached** (lines 1279–1285).
- Underworld Door energy assignment gives a Shadow Rider VMAX the high-priority target score only while **total board Energy <5** and that target has fewer than five (lines 1563–1570 / 1654–1660).
- Manual Psychic Energy attachment to a Shadow Rider VMAX is admitted only while **total board Energy <5** and that target has fewer than five (lines 2128–2141).

So in the Shadow Rider mirror, the candidate worker can stop searching for, attaching, and preserving Psychic Energy once the entire board has five. Its resulting Max Geist is 160 damage.

By contrast, the registered rank-1 worker on main, blob `1c8aef18c6ddd2b45f5aeaa2bf958169301e7dcd`, scores a manual Psychic attachment to a Shadow Rider VMAX while that *target* has fewer than six Energy (lines 338–368). It does not impose the same global five-Energy ceiling. This is a concrete policy asymmetry in the chosen pair, not just a theoretical card-value question.

The candidate's five-Energy target may be an intentional 2HKO baseline, but it is a brittle global cap: 160 damage is exactly two hits into 320 HP only without healing or damage modifiers; the original rank-1 list contains Acerola, and one extra Energy raises damage to 190. The sixth Energy can therefore change the healing race and future KO breakpoints. The policy should decide from target HP/damage, healing/retreat lines, attacker availability, and remaining Energy—not a global five-card threshold.

Suggested post-baseline correction: replace the global five-Energy cap with a damage-breakpoint-aware target for the selected mirror, and add a regression where a sixth attachment crosses a relevant threshold. Do not change the already-registered V3 policy hash or frozen PR #71; this is a candidate-worker issue for the existing PR #69 scope after the authorized baseline/owner decision.

— Agent6
