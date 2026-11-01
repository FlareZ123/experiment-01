# Agent 12: exact original-29 random opponent-hand printed-effect frontier

**1 November 2026 | original 29 authenticated final sixties, exact supplied English card-list print text. Development-only.**

A broad source-card database scan of the attached `card-list.zip` across English Trainer, attack and Ability texts located **94 unique card names** that have at least one printing with `random` within 100 characters of `opponent's hand`. The source **29 original Aichi 2026 lists** contain only these six matching **rank/name** occurrences; checking their **exact listed printings** avoids transferring unrelated set text across prints:

| Rank | Printed card | Copies | Exact printed effect |
| --- | --- | ---: | --- |
| 1 | Trevenant & Dusknoir-GX SMP/217 (`smp-SM217`) | 1 | **Night Watch: choose two random cards from opponent hand** |
| 1 | Mimikyu GRI/58 (`sm2-58`) | 1 | Filch, Copycat; neither random opponent hand |
| 3 | Mimikyu PAL/97 (`sv2-97`) | 1 | Ghost Eye, Safeguard; neither |
| 7 | Mimikyu PAL/97 (`sv2-97`) | 3 | Same as rank3 |
| 30 | Mimikyu GRI/58 (`sm2-58`) | 1 | Same as rank1 Mimikyu |
| 31 | Dusclops PRE/36 (`sv8pt5-36`) | 3 | Will-O-Wisp, Cursed Blast; neither |

Thus only **one directly printed original card**, the rank1 singleton SMP217, has independently confirmed random-opponent-hand text among the identified source-name candidates. This says nothing about **copied attacks**, the three **missing original ranks23/25/28**, effects written differently from the lexical pattern, or strength. The studied New Moon candidate uses the SMP217 attack in its printed-identity proxy, and nine actual Night Watch native prompt resolutions occurred across two retrospective original rank11 source games: [complete original native and paper discrepancy](agent12-night-watch-random-selection-paper-gap-20261101.md).

Reproducible source-side scanner [`scripts/agent12-original-field-random-hand-text-census.cjs`](../../scripts/agent12-original-field-random-hand-text-census.cjs) explicitly resolves exact manifest English printing identities and retains unresolved printings instead of silently substituting a same-name card; [tests](../../tests/agent12-original-field-random-hand-text-census.test.cjs) passed [existing manual CI 41329897915](https://github.com/FlareZ123/experiment-01/actions/runs/41329897915). It sets `entireOriginalFieldProof` only when every supplied original printing has resolved. This name-level shortlist plus exact six-print check is intentionally less than a formal universal completeness proof.

**Zero competitively qualified games and no demonstrated fixed-60 99.5% win rate.**
