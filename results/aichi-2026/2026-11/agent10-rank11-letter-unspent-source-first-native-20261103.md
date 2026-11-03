# Original rank-11 first-turn Letter: native policy skips guaranteed basic Energy access

**Agent 10 | 3 November 2026 | Exact historical selected-v3 ZIP reanalysis; source-owner action diagnostic, no new game**

## What was examined

Analyzed the full original [Agent4 selected-v3 development archive](https://github.com/FlareZ123/experiment-01/releases/download/aichi-native-evidence-2026-11-03/selected-v3-paper-funded-48-13260514792.zip), original GitHub Actions artifact **13260514792**, 2,863,482 ZIP bytes, SHA-256 `303d11947c39c7572b4302fef8666ab744491e9db745dd8ffadc55b1631c0850`. Extracted original native JSON SHA-256 `523661e87efc95c4148ad8528eada902b0b3a4bf028388e70c5d62cf35d0a918`. Examined only the one *actually selected* `selected-v3-paper-plus-funded-mobility` profile, its four original-rank11 source contexts in both seats against champion-reference and New Moon, the per-root owner-only Trainer frontier, and post-Store selected root ledger. Source identities come from the unchanged authenticated published [rank11 list](../full-decklists.json).

The original rank-11 source is the Wataru Yano Absol/Garbodor published 60. It contains **four Professor's Letter BKT 146** and **eight basic Darkness Energy MEE**. The native printing is `Professors Letter BKT` (without apostrophe). The bundled card database for `xy8-146` states that Letter searches for **up to two basic Energy** from the deck, reveals them, puts them into hand and shuffles. This is an Item with no discard payment. Do not confuse this source-printing alias with an unmodeled different Trainer.

## Physical opening and selected-policy witness

The four candidate-vs-original contexts comprise **exactly two distinct original source physical opening deals**, one played against both fixed candidates in source seat 1 and the other against both in source seat 0. All four original-source first turns belong to the source. Their first owner root has a seven-card hand consisting entirely of seven Trainer cards. Neither initial hand contains basic Energy.

| Exact source physical-deal group | Candidate contexts | First-source root | Key observed action |
| --- | --- | --- | --- |
| SHA-256 `4ac2d076d69be8ab…`, rank11 repeat401, seat1 | Both candidate 60s | Turn1, 7/7 Trainers; one physically held `Professors Letter BKT`; native offered, generic public blocker absent, necessity rows contain no known blocker | Source selected Muscle Band, then Battle VIP Pass, then Pass. It never selected Letter. |
| SHA-256 `a4ce707056ab157d…`, rank11 repeat402, seat0 | Both candidate 60s | Turn1, 7/7 Trainers; **no Letter** | Source selected Battle VIP Pass. This deal is a negative access control. |

For the first source deal, the source has eight registered basic Darkness Energy copies, none in its opening hand, and at most six Prize cards. On its very first owner decision, **at least two basic Darkness Energy must remain in the deck** if initial setup and card ownership follow the recorded rules. Thus Letter has a genuinely available search payoff. Playing it would produce basic Energy in hand and open a regular hand Energy attachment that turn. This is stronger than inference from a native enumerator offer alone, and it does not require consuming the once-per-turn Supporter or discarding protected cards. It is still a **paper-rule-and-physical-opening feasibility inference** pending an actual isolated Store root, settled search, attachment, and opponent reply. This report does not claim that playing Letter is necessarily the best action among all competing opening intents.

Across all later original source-owner roots in these four contexts, the repeated `Professors Letter BKT` presence totals **48 unique owner decision roots** and **54 physical held-copy/root observations**. Every one of the 54 is marked `nativeEnumeratorOffered:true`; zero have a documented generic public or printed necessary-condition blocker. The selected source policy passes at **33** such roots, and selects **zero** Professor's Letter plays across all four contexts. These counts are highly dependent repeated appearances within two original source deal groups. They are neither 54 independent missing card plays nor a claim that the engine's 54 enumerations were all fully paper legal.

The first source-deal fingerprint is identical across the two candidate contexts. Its exact first owner-root Trainer printings are one Letter, one Muscle Band, one Battle VIP Pass, two Float Stone, Carmine and Marnie. The first selected source action places Muscle Band; the second uses Battle VIP Pass; a Pass ends the turn. The 7-Trainer hand and lack of basic Darkness explains why the Letter opening is a particularly consequential missing resource-access candidate.

## Evidence category and causal next test

- **Recorded facts:** two unique source physical deals, actual root-selected actions, 54 repeated offered held-copy observations, 33 passes holding Letter, zero selected Letter roots. These are original archived native-data observations.
- **Mathematical/rule-bound deduction:** eight basic Darkness in an unchanged 60, six Prizes maximum, seven opening Trainers, and zero pre-root hand Energy guarantee at least two Darkness remain in the deck at that source-first root. The bundled BKT Professor's Letter text specifies two searchable basic Energy; ordinary hand attachments are permitted.
- **Unproven:** native Store full paid search-and-reveal, exact prompt target, Energy-zone settlement, actual advantage over first-turn Carmine/VIP alternatives, ability to reach a later attack/KO, competent opponent reply and certified paper match outcome.
- **Next falsifiable canary:** preregister the exact physical deal `4ac2d076…`, same source first/seat, both candidate 60s, compare frozen selected incumbent against a default-off owner-safe first-turn Letter priority. Capture the actual original source hand index, Item restrictions, native search prompt, precise chosen Darkness cards and attachment recipient, full board/zone delta, later attack/control payoff and opponent response. Include the `a4ce7070…` no-Letter opening as a negative control, retain aborts, and veto any conclusion based only on increased Item action count.

The compact [source-owned census](../../../scripts/agent10-selected-v3-rank11-letter-frontier.cjs) and [pure custody tests](../../../tests/agent10-selected-v3-rank11-letter-frontier.test.cjs) were committed without modifying any canonical policy. These tests verify physical pairing and guard against upgrading native offering to paper legality. The original archive remains permanently retained in the existing [six-ZIP research release](agent10-selected-v3-48-native-archive-retention-20261103.md).

The original field still has only 29/32 authenticated 60s; no fixed best candidate, zero competitively qualified games, and no demonstrated 99.5% win rate.
