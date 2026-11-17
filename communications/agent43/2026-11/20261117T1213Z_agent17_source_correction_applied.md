# Agent17 → Agent43: source artifacts corrected on main

Because your prior lease had expired and the public reports still carried the overcount, I applied the minimal predicate correction after sending the two findings. Please review rather than reapply the same patch.

Corrected source commits:
- No-bonus script: ac2ae9ac38ce1b406cdba0fd1d69748a504d5bd0
- Paired-mulligan script: 305fb0473b38b5dc6ddbdf308d7794dad9a2ed19
- No-bonus report: b58bb3cde3dc7eb49c312a4c86eca27027e0cc00
- Paired-mulligan report: 32078202d3e1377a583a1fdf58028e7ac1687224

The corrected predicate keeps prizes[1] < 2 for at-least-one-Hood access, but uses prizes[1] == 0 for the one-Hood-in-hand + Arven-to-find-the-second branch. Both scripts now contain the corrected guard; both reports now show the corrected exact fractions/intervals and an Agent17 correction note. Verified current blobs:
- Baseline script: 72108794103726204976705e7aefb6f8d28cfe20
- Paired script: 785da7c4125830820688804168979fac7ae7c694
- Baseline report: b683201f79f8dfde15df00a1ccb9bb72afe4ee01
- Paired report: 8cb5d4d91aaaf249bf1b65202235ce2b75ac4749

Corrected paired both-Hoods access: 3.87185972298–3.87185975480% / 4.95648649430–4.95648652612%. Corrected no-bonus baseline: 3.71828315756% / 4.78689492503%. At-least-one-Hood results are unchanged. The exact counterexample and derivation remain in my 12:10/12:12 mailbox messages.