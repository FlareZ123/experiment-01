# Pinned Twinleaf fails Silent Lab-before-New Moon chronology

**Agent 3, 16 October 2026.** Engine-fidelity finding, not a competitive result. Version `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Official rule / expected behavior

The [official Japanese Pokémon card Q&A for Silent Lab + New Moon](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%B5%E3%82%A4%E3%83%AC%E3%83%B3%E3%83%88%E3%83%A9%E3%83%9C&regulation_header_search_item1=all) answers two explicit orders. With **Silent Lab already in play**, a Solrock in play and Lunatone just Benched, New Moon **does not function**. With **New Moon already functioning**, a subsequently played Silent Lab **does not disable** New Moon. Those orders have identical final card identities and differ in chronology.

The relevant source New Moon candidate, a distinct Aichi **52nd-place** list outside the benchmark Top32, has 1 Lunatone OBF92, 1 **Sunbeam Solrock CES62 English equivalent**, and 2 Mewtwo & Mew-GX. [Printing and source detail](../als/new-moon-perfection-source-60.md). [Four sourced Aichi Top32 opponents](../als/new-moon-stadium-sequencing.md) carry Silent Lab.

## Executed pinned Store fixture

The reproducible [actual action-order script](../../simulation/twinleaf/new-moon-stadium-order-audit.cjs) uses pinned Store, real `PlayCardAction` for Stadium and Benching Lunatone, a full starter per side, two deck cards and six staged Prize cards each. Real `CheckPokemonPowersEffect`, `IS_ABILITY_BLOCKED` and `IS_STADIUM_EFFECT_BLOCKED` then inspect the same final board.

[Manual CI 38861193556 succeeded](https://github.com/FlareZ123/experiment-01/actions/runs/38861193556); [artifact: JSON action-order probe](https://github.com/FlareZ123/experiment-01/actions/runs/38861193556/artifacts/12029460917). The machine-readable observations were:

| Action order | Luna New Moon discovered? | Mew Perfection discovered? | Expected rule |
|---|---|---|---|
| Play Silent Lab, then Bench Lunatone (Solrock present) | **yes** | **yes** | **No**; Lab pre-suppresses New Moon and Perfection |
| Bench Lunatone, then play Silent Lab (Solrock present) | yes | yes | **Yes**; New Moon shields from later Lab |
| Bench Lunatone, play Lab, Solrock absent | no | no | No protection; Lab suppresses both |
| Bench Lunatone, play Path to Peak (Solrock present) | yes | yes | Yes; functioning New Moon protects in-play Perfection |
| Bench Lunatone, play Path to Peak (Solrock absent) | yes | no | No New Moon protection |

The first row is a **verified discrepancy**; the other four observations are specific positive/control evidence. Note that Path does not remove a non-Rule-Box Lunatone's printed Ability; its New Moon effect is inactive without Solrock.

## Likely implementation mechanism (source-based diagnosis)

Pinned upstream `ptcg-server/src/sets/10-scarlet-and-violet/set-obsidian-flames/lunatone.ts` catches `StadiumEffect`, tests that Solrock is in play, and throws to protect the target. Pinned `ptcg-server/src/game/store/prefabs/stadium-effect.ts` supplies a **nested StadiumEffect probe with `skipAbilityLockCheck=true`**, to avoid recursive lock loops. The two modules have no timestamp/ordering state recording whether Silent Lab predated Lunatone's entry. A board-final-state-only query can therefore present New Moon as active in both orders. This is a plausible mechanism, not a proved complete root-cause beyond the observed misclassification.

## Research-side repair: actual Store regression passed

Implemented opt-in, reversible [New Moon / Silent Lab ordering hook](../../simulation/twinleaf/new-moon-silent-lab-order-hook.cjs) around only the pinned `Lunatone` reducer. It records a pre-existing Silent Lab **at the Lunatone Bench-entry `PlayPokemonEffect`**, keyed to that Lunatone and physical Stadium object. It refuses an otherwise incorrect `StadiumEffect` protection while that original Lab remains. A later-Lab sequence retains New Moon, and a detected Stadium replacement clears the marker. Vendor files remain unchanged.

Updated [action-order probe](../../simulation/twinleaf/new-moon-stadium-order-audit.cjs) to run identical baseline and corrected staged actions in the same process, restore the prototype in a `finally` block, and assert all five controls:

| Staged final state | Pinned baseline | Corrected hook | Official outcome |
|---|---|---|---|
| Lab before Lunatone + Solrock | **incorrect:** New Moon and Perfection available | **New Moon blocked, Perfection blocked** | blocked |
| Lunatone + Solrock before Lab | New Moon and Perfection available | unchanged | available |
| Lab after Lunatone, no Solrock | New Moon and Perfection suppressed | unchanged | suppressed |
| Path after Lunatone + Solrock | Perfection available | unchanged | available |
| Path after Lunatone, no Solrock | Perfection suppressed | unchanged | suppressed |

All assertions **passed** in [manual CI 38862188428](https://github.com/FlareZ123/experiment-01/actions/runs/38862188428). Its [archived JSON baseline/corrected artifact](https://github.com/FlareZ123/experiment-01/actions/runs/38862188428/artifacts/12030305675) preserves exact fields, card names, engine SHA and observations.

**Correction scope:** The hook specifically covers entry of this Lunatone via `PlayPokemonEffect` into a Bench slot. This does not prove identical behavior for every possible source path (initial board without a card-play effect, exotic put-into-play mechanisms, movement and simultaneous suppression). It is not yet wired into a competitive headless policy, so existing game diagnostics must not be retrospectively treated as repaired. Extend with removal/replacement and full-game re-entry tests before declaring a general solution.

## Required correction / qualification

The committed reversible research-side hook remembers whether *this physical Lunatone* entered while Silent Lab already existed. It permits later-Lab shielding and refuses earlier-Lab shielding for a staged Bench-entry path. Extended replacement and in-game return-to-play behavior still needs coverage.

Without this correction, **do not count** a claimed New Moon candidate escape from early Silent Lab in full-game results. The fixed 60's real efficacy against each opponent remains unmeasured.
