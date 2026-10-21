# Aichi 48th Archie's Baxcalibur: public 2026 deck-code recovery gate

**Agent 2 | 21 October 2026 | failed external source retrieval, verified local parser fixture.** No 2026 Aichi Top32 printed list recovered and no simulated game classified as competitively qualified.

## Question and published provenance

The 11 May 2026 [first-person 48th-place report by Primarina.Yuki](https://note.com/primarina_2002/n/n70b7e01cd474) prints the public Japanese deck code **`4xYGc4-dWhjRd-G8c8GD`** and says this code reflects the actual May deck with possible rarity substitutions. The author states an Aichi 6–2 finish and four Regidrago wins, while acknowledging weak opposing starts and losses to Shadow Rider and Meloetta. These are self-reported individual matches, not a random sample or an estimate of wins against all 32 Aichi opponents. An earlier **January** 60 has been preserved separately in [Agent 2's proxy source](../als/agent2-archie-baxcalibur-umi2026-english-proxy-60.json); never relabel that earlier list as May.

The May report describes the addition of **Telescopic Sight**, **Klefki** and **Team Rocket's Watchtower** as its initial differentiators and a conditional Kyogre Aqua Storm line, but the current public text does not disclose the entire May card-count inventory. Direct retrieval is necessary to make this a verified fixed-60 candidate.

## Reversible, manual-only retrieval infrastructure

Extended the already existing, **workflow_dispatch-only** [Aichi public New Moon source probe](../../.github/workflows/aichi-newmoon-image-source.yml) with optional `public_deck_code`, preserving the original default New Moon check without altering its validation. There is no new workflow, push trigger, or submodule change.

Added [snapshot parser](../../scripts/official_jp_public_deck_snapshot.py), which:
- rejects invalid 6–6–6 deck codes, missing/mismatched page identities, missing card tables and any list other than 60 cards;
- extracts each official viewer Japanese card ID, printed Japanese name, category, count, edition image slug and the raw page SHA-256;
- saves the decoded JSON atomically under a file lock using `filelock`, and explicitly warns that official code-viewer printing/rarity may be a stand-in for the player's physical registered printing.

Three [pure parser tests](../../tests/test_official_jp_public_deck_snapshot.py) passed in the new compiled GitHub runner [39643763982](https://github.com/FlareZ123/experiment-01/actions/runs/39643763982), head `d7f3a4ae4bf30fa107851f8d67c68b6ab0332f9f`. That synthetic test establishes parser acceptance/rejection on specified HTML contracts; it does not establish current compatibility with the live May source.

## Failed official viewer attempts and control

| Existing manual run | Input deck code | HTTP and result |
| --- | --- | --- |
| [39643286246](https://github.com/FlareZ123/experiment-01/actions/runs/39643286246) | May 48th: `4xYGc4-dWhjRd-G8c8GD` | 503, retried by curl, no HTML; failed |
| [39643392445](https://github.com/FlareZ123/experiment-01/actions/runs/39643392445) | Same May code, independent dispatch | 503, no HTML; failed |
| [39643486069](https://github.com/FlareZ123/experiment-01/actions/runs/39643486069) | Previously documented New Moon control: `GxxDYx-a4rD4W-a8xYxc` | **Also** 503, no HTML; failed |
| [39643763982](https://github.com/FlareZ123/experiment-01/actions/runs/39643763982) | May code after parser unit-test integration | Three parser tests pass; official request **still** 503 |

All jobs use the same official `https://www.pokemon-card.com/deck/confirm.html/deckID/<code>` endpoint and an Ubuntu GitHub-hosted runner. These observations support an **endpoint- or runner-access failure** at the observed time rather than a May-specific missing list. They do not establish that the May code is invalid or that the website is permanently unavailable. The raw HTML and decoded 60 were not captured, so an artifact containing a May registered list does not exist. Do not infer cards from the January predecessor or from the author's verbal changes.

## Next discriminating step

Retry the identical manual control and May codes **later when the control returns 200**, or obtain an authorized full-source May image or export directly from the author. Once captured, inspect all sixty Japanese print identities, separately record visual/source rarity substitutions, and compare to January's authentic precursor. Then use the unchanged May 60 only as a **challenger** for paper legality, matchup stress testing and calibrated common-policy evaluation. It is an actual rank-48 entrant, outside the required Top32 field; it does not change **29/32 official opposing source lists recovered**, the still-missing ranks **23/25/28**, the **zero qualified games**, or the unproven 99.5% aspiration.
