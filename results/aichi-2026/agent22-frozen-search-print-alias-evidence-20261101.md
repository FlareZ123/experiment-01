# Agent 22: original frozen search targets, exact BW50 printing and MEE metadata boundary

**1 November 2026.** Evidence class: deterministic inspection of the supplied card database, independently checked public printing references, and *existing* Agent17 native frozen-archive counts. **No native rerun, no new policy trial, no competitive qualification.**

## Research question

Can the 34 source-archive-unresolved target printings in the [98-selection original Store search-target screen](agent17-frozen-v2-printed-search-target-screen-20261101.md) be classified more accurately without guessing card identities or upgrading an incomplete prompt contract to printed-paper legality?

The frozen v2 screen uses the supplied `card-list.zip` SHA-256 `c39af257e60a79a485aad09c7d7723b6afbb42eae1ba74e280b8a3f77581350a`, with the 32 attempted native original-rank6/11 games in [run 41279242584](https://github.com/FlareZ123/experiment-01/actions/runs/41279242584). Agent17 reports **95 original Store deck-search prompts selecting 98 physical-card instances**: 64 exact-print category matches, zero category mismatches and 34 unresolved. The unresolved are **32 `Psychic Energy MEE`** under real Fog Crystal CRE and **2 `Tropical Beach BWP 50`** under real Guzma & Hala CEC. These are source-report observations, not independently reprocessed here.

## Independent archive findings

I read the exact bundled `sets/en.json` and `cards/en/bwp.json` ZIP members. Their records show:

| Printed native label | Archive mapping / record | Evidence grade |
| --- | --- | --- |
| `Tropical Beach BWP 50` | Archive set ID `bwp` has **`ptcgoCode: PR-BLW`**, not `BWP`. `cards/en/bwp.json` explicitly contains **`id: bwp-BW50`, `name: Tropical Beach`, `supertype: Trainer`, `subtypes: [Stadium]`**. It also has **`bwp-BW28`**, a second separately numbered Tropical Beach print. | **Supplied-ZIP exact printing identified by set and numeric collector suffix**, subject to correct native ledger-to-card identity provenance |
| `Psychic Energy MEE` | No `MEE` set exists among the bundled `cards/en/` archive members and no `ptcgoCode: MEE` in `sets/en.json`. | **Unresolved from supplied ZIP**, regardless of its displayed card name |

The exact `BW50` identity is corroborated by [Limitless's Tropical Beach BWP #50 printing](https://limitlesstcg.com/cards/bwp/50), which identifies it as a Stadium and distinguishes it from the other 2011/2012 printing. The `MEE` Basic Psychic Energy identity is independently documented by [Bulbapedia's Basic Psychic Energy print list](https://bulbapedia.bulbagarden.net/wiki/Psychic_Energy_%28DPt-P_Promo_26%29), with **MEE Basic Energies 005 and 013**. Because the native label omits a printed number, neither printing can be selected uniquely from that reference. It is possible to classify the *name-level* MEE target as a Basic Psychic Energy with **external provenance** while leaving the exact MEE printing number undetermined.

## Consequences for the shared paper-prompt portfolio

There are three different evidentiary classes that should remain explicit:

1. **Archive-exact print metadata**: the two original `Tropical Beach BWP 50` names can be matched to the bundled `bwp-BW50` record with a strict **BWP 50 to BW50** alias and printed-name equality. A bare or ambiguous BWP label must *not* be silently mapped to BW50, because the same archive includes BW28.
2. **Externally supported category metadata**: the 32 original `Psychic Energy MEE` names can have their Basic Psychic Energy category independently supported, while continuing to count as ZIP-unresolved exact printings. Without a source printing number, claiming MEE 005 or MEE 013 individually would be unsupported.
3. **Full paper-contract validity**: even a genuine exact selected-print category match does **not** prove the owner paid a mandatory discard, selected available cards from their own remaining deck, followed the precise optional effect branch, respected card counts, shuffled correctly, or completed the requested action and later turn. Preserve `PAPER_PROMPT_UNVERIFIED` for every original prompt until these independent predicates are attached to the original Store receipt.

**Expected effect of a future original-archive rerun with only the strict BW50 mapping:** among Agent17's previously observed 98 selections, 64 -> **66** archive-resolved category matches, 34 -> **32** ZIP-unresolved, and zero previously observed category mismatches remain zero. This is **a projected count adjustment**, not an executed new frozen-archive verifier result. The MEE 32 may be annotated as externally supported category matches, but must not inflate the archive-exact 66 count. In particular, do not rename these 98 selections “98 legal searches.”

## Reproduction recipe and independent check

With the original attached `card-list.zip`, read `sets/en.json`; filter set ID `bwp`, then in `cards/en/bwp.json` find `bwp-BW50` with the name, supertype and subtype specified above. Verify that `bwp-BW28` also exists and that there is no `cards/en/mee.json`. The external URLs establish the category of the two printed families and provide cross-source confidence. The freeze archive ZIP need not be downloaded for this limited check; for the proposed 66/32 quantitative update, **the original 32-game archive must be reprocessed with a new versioned alias mapping**, and its original 19 terminals / 13 caps retained unchanged.

No opponent original-60 gap closes here: ranks **23,25,28** remain missing, **29/32** exact original lists are known, **zero competitively qualified games** and **no demonstrated 99.5% fixed-deck win rate**.

## Integration owner

Specific precise handoff sent to Agent17 at [20261101T1725Z message](../../communications/agent17/20261101T1725Z_agent22_bw50_alias_archive_evidence.md). This report supplies exact archive provenance and a bound for the common Agent41 paper-prompt portfolio; it does not create another runner or workflow.
