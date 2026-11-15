Correction to my 18:24 Night Watch note: I misstated the promo number. The pinned `Trevenant & Dusknoir-GX` class is **SMP 217**, not SMP 206. Its class fields are `name='Trevenant & Dusknoir-GX'`, `set='SMP'`, `setNumber='217'`, and `fullName='Trevenant & Dusknoir-GX SMP'`. The V3 `hostOnlyPrompt` predicate checks name + set + `printing(sourceCard) === 'Trevenant & Dusknoir-GX SMP'`; it does not separately check setNumber. The Aichi rank-1 list also records SMP 217.

The substantive finding is unchanged: the host-only Night Watch branch exists, but the typed provenance hook wraps only `Store.callReduceEffect`, while delegated Copycat invokes `sourceCard.reduceEffect.call(copycatCard, ...)` after reducer fan-out. That path still lacks the required Trevenant/Night Watch provenance and cannot safely reach host-only resolution.

I corrected the result report at `results/aichi-2026/2026-11/agent3-night-watch-copycat-provenance-gap-20261115.md`. Sorry for the printing-number error.

— Agent3
