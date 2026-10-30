# Agent 26: all 32 original frozen scout source setups reproduced exactly

**30 October 2026 | Evidence class: 32 original pinned Store setups, exact byte-bound source SHA256 ledger, real mulligan and shuffle-PRNG observations.** No completed games were played in this follow-up, and no competitive win rates were inferred.

## Why this was done

The original Agent41 prospective two-candidate native scout had 32 frozen arms spanning original Aichi rank6 Iron Thorns and rank11 Absol Garbodor, both candidate physical seats A/B and four sealed random seeds per rank/seat. It reported 15/16 identical opposing source initial physical deals and one unequal source pair, \`6:3:B\`. It was unknown whether the entire 32-game opening provenance could be reproduced in a **separate native setup-only executable**, or whether full actor policy hooks had changed any setup.

We reopened the **exact original frozen registration** \`results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json\` (Git blob SHA-1 \`8c54d8497f9927b04d501237462f64a42173d33d\`) and extracted all 32 registered rank, repeat, seed, candidate ID, and physical slot combinations. The baseline source printing 60s are the unchanged rank6 and rank11 originals. The champion reference and New Moon candidate 60s were also unchanged. We resolved the lists under the pinned engine \`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05\`.

The new [read-only 32-arm Store setup executable](../../simulation/evaluation/agent26-frozen32-all-setup-replay.cjs) ran all 32 actual native setups, stopping at the first settled real turn, before any gameplay decision. Each arm additionally ran the independent native \`oneSetup\` observer to count both players' mulligans and optional draws, and record owner-specific seeded Fisher-Yates shuffle permutation digests and PRNG positions. Full 60-copy source and candidate identity conservation and actual first-turn draw-log evidence were checked for each arm. Every arm, including failures had any occurred, was retained. The current suite used **no full match outcomes**.

## Full initial source fingerprint checksum proof

We independently downloaded the original Agent41 [raw frozen game archive artifact 12917901362](https://github.com/FlareZ123/experiment-01/actions/runs/40918541683/artifacts/12917901362) and computed the SHA256 of the ordered array \`[[trial.id,sourceDealFingerprint], ...]\` for its original 32 rows. The hash is:

\`9317d7ddbc56bb7b7353a862603f0a91c4540a41caed226d75efc38249045640\`.

The standalone new native script produced the **exact same checksum** over its independently captured 32 registered first-turn source physical-deal digests:

\`9317d7ddbc56bb7b7353a862603f0a91c4540a41caed226d75efc38249045640\`.

This validates every trial's **original rank, seed, candidate ID, physical seat and full source physical opening state**, at the hash serialization boundary, across the **whole frozen 32-arm setup sample**. The exact source-deal digests cover the ordered source deck, hand, Prizes, Active and Bench as captured by the original source fingerprint function. A byte-identical ledger implies all 32 per-trial source hashes are equal, under the identical ordered trial IDs in both independently authenticated records.

[Existing manual first-source-deal workflow **run 40995871030**](https://github.com/FlareZ123/experiment-01/actions/runs/40995871030) returned **SUCCESS** on commit \`3202f8db7af161b9e0e33894b0cf7e21e940ec61\`, checking out and compiling the pinned upstream server. Complete attempted source data: [GitHub Actions artifact 12951516419](https://github.com/FlareZ123/experiment-01/actions/runs/40995871030/artifacts/12951516419), ZIP SHA256 \`e85fc8bd58666c6557c5fd451b240b6a6dde73649660d3a8240c69399b4f9d9e\`, inner JSON SHA256 \`05a326e5329a7f5c564d44117a52dfcbeeeabe93bea01ca624780c70073d8264\`. All 32 setup arms passed; zero setup errors or hidden substitutions.

## Complete, unchanged 16-pair denominator

| Independently verified property | Count |
| --- | ---: |
| Registered arms / native Store setup captures | **32 / 32** |
| Fully source-fingerprint-matching original archived arms | **32 / 32** |
| Matched paired candidate seeds/physical seats | **16 / 16** |
| Same source postsetup full physical fingerprint | **15 / 16** |
| Different source postsetup full physical fingerprint | **1 / 16** |
| Same candidate mulligan counts across candidate variants | **15 / 16** |
| Different candidate mulligan counts across variants | **1 / 16** |
| Different source mulligan counts across variants | **0 / 16** |
| Different source optional bonus cards drawn across variants | **0 / 16** |
| Same final source shuffle permutation/offset | **15 / 16** |
| Different source final shuffle permutation/offset | **1 / 16** |

The five **nontrivial pair discrepancy indicators are perfectly co-located**: every same-mulligan candidate pair reproduced the same final source shuffle permutation and the same full source physical opening. The unique different-mulligan pair produced a different source shuffle and source opening.

The single counterexample is again **\`6:3:B\`**, original seed \`861838028\`. With source rank6 Iron Thorns in seat0, the source mulliganed **twice in both arms**. The champion candidate in seat1 mulliganed **once** while New Moon mulliganed **zero** times. The source drew **zero** opponent-mulligan bonus cards in both arms; the candidate was offered and took **one** bonus card against champion versus **two** against New Moon. The source's starting Pokémon changed from an Active Iron Thorns ex alone to an Active Iron Thorns ex plus a second Benched copy.

The [exact five-shuffle native RNG tape](agent26-frozen-rank6-mulligan-causal-replay-20261030.md) shows source's last 60-card shuffle shift from draws \`[237,296)\` in champion to \`[178,237)\` in New Moon, a displacement of **59 random outputs**. Champion candidate's extra shuffle consumed exactly \`[178,237)\`, which New Moon used for the source. The other 15 pairs had identical source last-shuffle offsets and permutations.

## What this supports, and what it does not

For the **32 exact observed original source setups**, generic original Store setup resolution with the unchanged candidate/source physical printings, sealed seeds, seat orientation and registered engine revision was sufficient to reproduce **every full source initial deal hash**. Thus the full actor composition did not visibly change this first-turn source physical provenance in these 32 samples. The single original unmatched source pair is fully explainable by the candidate-dependent redraws moving later source deck shuffle into a different segment of the shared seeded random stream; this conclusion is confirmed by the observed native per-shuffle RNG tape.

This is a **specific causal reproduction under the pinned PRNG scheduling**, not an estimate that all same-mulligan candidate pairs in an arbitrary population must have identical openings, and not evidence that some candidate inventory is stronger. Candidate-dependent legal opponent bonus draws can also legitimately alter source openings in other seeds, as explained in [Agent39's independent source-bonus-path proof](../statistics/agent39-mulligan-posttreatment-source-alignment.md).

The source-fingerprint-hash equality gate defines a **conditional identical-starting-world diagnostic**. It cannot be used as an inclusion requirement for an **unconditional candidate-inventory** outcome comparison: doing so would drop the real candidate-induced mulligan interaction. Keep all seeded attempts, including unequal initial deals and engine failures, and report setup cause/path separately from outcome and game quality. If a future optimizer wants controlled same-source physical-opening matched pairs, per-seat deck-shuffle random streams can be considered as an *explicitly new prospective protocol*, with all source mulligan-compensation paths still observed and documented. Do not retrofit that intervention into the frozen original trial.

The 99.5% objective remains open. Exact original sources still cover **29 of 32 ranks**; rank23,25,28 original 60s remain unavailable. The native scout's original **20 engine terminals and 12 caps** remain **zero competitively qualified games**. This work certifies setup reproducibility and explains a pairing failure mode; it does **not** establish a stronger fixed deck or game win rate.
