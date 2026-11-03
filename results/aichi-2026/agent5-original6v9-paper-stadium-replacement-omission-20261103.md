# Agent5: two original-source genuine Passes omit legal differently named Stadium replacements

**Disposition (3 November 2026):** Two **different authenticated original Aichi decks** each reached a genuinely selected, Store-accepted `PassTurnAction` while physically holding a differently named, paper-playable replacement Stadium. In both, the original native `ActionEnumerator` omitted that held Stadium. This reproduces the already documented *pinned native Stadium enumeration completeness defect* in **two distinct original physical game arrangements with full owner-visible Stadium custody**. It is a legal-action-availability observation and mechanism confirmation, with strategic value and replacement Store settlement untested. There are no competitively qualified games.

## Full original-source and tool provenance

- Printed original field: exact Aichi rank-6 Iron Thorns ex and rank-9 Absol/Electrode 60s in [full-decklists.json](full-decklists.json), resolved unchanged through `planAichi`.
- Preregistered observer context: [Agent5 source-pair portability preregistration](registrations/agent5-generic-trainer-rank6v9-aba-20261103.json) plus [subsequent exact owner-deck/Stadium context registration](registrations/agent5-rank9-battle-compressor-paper-opportunity-observation-20261103.json).
- Original read-only A/B/A native CI: [41622589780](https://github.com/FlareZ123/experiment-01/actions/runs/41622589780); same-source Stadium snapshot rerun: [41695444985](https://github.com/FlareZ123/experiment-01/actions/runs/41695444985) SUCCESS, artifact [13262225437](https://github.com/FlareZ123/experiment-01/actions/runs/41695444985/artifacts/13262225437), ZIP SHA256 `cf49c6f3ca014d0fff22f9a297c612d3c05a14e602fd8e969f125026345060d6`.
- Vendor pinned commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Only read-only public Stadium snapshots were added, without changing selected actions. Across each original arrangement, physical setup and all selected root traces match both their own A/B/A controls and the older archive exactly.
- Previously established source-level mechanism: [Agent7 original Stadium enumerator evidence](agent7-stadium-enumerator-own-stadium-gate-20261103.md), [Agent26 independent enumerator soundness and completeness analysis](../twinleaf/agent26-pinned-trainer-enumerator-soundness-and-completeness-20261103.md). Pinned `playStadiumActions()` returns an empty choice list whenever the owner already has a Stadium, even when an ordinary different-name replacement is legal under paper rules and supported by the native Store. Do not confuse absence of an enumerated choice with paper prohibition.

## Two representative physical source-state witnesses

| Property | Original rank 6 source | Original rank 9 source |
| --- | --- | --- |
| Original deck archetype | Iron Thorns ex | Absol/Electrode |
| Original physical arrangement | primary rank-6 seat 0 | primary rank-6 seat 1 |
| Actual source owner physical seat | 0 | 0 |
| Owner selected Pass ordinal | **21** | **19** |
| Global turn | **10** | **8** |
| Owner Stadium already in play | `Wondrous Labyrinth Prism Star TEU` | `PokéStop PGO` |
| Held different-name Stadium | `Thunder Mountain Prism Star LOT` | `Silent Lab PRC` |
| Held Stadium physical hand index | 7 | 8 |
| Native ActionEnumerator offered held Stadium? | **No** | **No** |
| Generic public rule blocker | none | none |
| Owner last Stadium-play turn | 2 | 2 |
| Owner Stadium play locked? | false | false |
| Actual existing action / Store status | Pass / native accepted | Pass / native accepted |
| Owner deck size (public) | 36 | 33 |
| Physical full deal SHA256 | `0f71b28f9fb0d50bf5d27ac102e9f8265a1ae3dc547ef6c1dc9adc1aa661f42e` | `b9398dd0e9f4b93085cf1fb36595b17df72e602b3f8e69636c005b43929f2a9a` |

The [supplied Advanced Player's Rulebook, section I.B-04](../../resources/) specifies a player may play one Stadium during their turn and replace the existing Stadium with a **different named Stadium**; the previous Stadium is discarded according to its applicable printed rules. In both authentic states, the relevant different-name Stadium was physically in the acting owner's hand, its recorded Stadium quota was unspent on the current turn, and no Stadium-play lock was present. Thus the displayed public state supports a real paper-playable alternative to `PassTurnAction`. The source's established `nativeEnumeratorOffered:false` is a completeness defect rather than proof of illegality.

The rank-6 owner already had **Wondrous Labyrinth Prism Star** in play, so any replacement would have to follow that Prism Star card's Lost Zone replacement rule rather than treating it as an ordinary discarded Stadium. This report establishes the eligibility of the replacement, without asserting that an unpatched native Store would correctly process the displaced Prism Star card's zone movement. A released policy requires that separate paper-specific settlement test.

## Every correlated repeat, same physical deals

Within the **single rank-6 original physical game**, the existing bot selected Pass with the same held Thunder Mountain at **four** successive owner decision roots, global turns `10,12,14,16`, root ordinals `21,23,27,31`. The read-only frontier said each could replace the already played Wondrous Labyrinth; the native enumerator omitted all four. Within the **single rank-9 physical game**, the bot passed holding Silent Lab against its own PokéStop at **five** owner decision roots, turns `8,10,12,14,16`, ordinals `19,22,25,28,31`. The native enumerator omitted each. There were **9 correlated skipped Stadium-root observations across two physical games**; none are independent tournament trials. Both game trajectories were censored under the registered 90-action cap and cannot support win-rate estimates.

## Consequence for actual unified policy closure

Any selected two-seat owner Trainer planner relying on the pinned native enumerator as a *complete* list of legal Stadium options will reproduce this failure. A paper-aware owned-Stadium replacement candidate requires exact **card name**, visible current Stadium name, Stadium-play quota, public lock, and physical own-held printing, then separate actual Store acceptance and correct prior Stadium destination. Stage a two-seat root regression using these two original physical states. Preserve the existing action choice and public state as controls, and include the opponent's meaningful reply before claiming a useful competitive improvement. These tests belong within the **one frozen shared policy**, rather than as another isolated default-off named card policy.

No final 60-card candidate has been selected; the 29/32 original field coverage and zero competitively qualified games remain unchanged.
