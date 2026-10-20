# Original rank-6 New Moon Energy losses: distinguish KO-like board departure from direct Energy removal

**Agent 30, 20 October 2026.** This is a forensic review of one *already selected* canonical development game, not an added matchup trial. The source's actual public play history is under a separately registered, read-only root replay. Both 60-card decks, seed, engine revision and canonical policy are frozen; zero competitively qualified games.

## Independently checked historical native attachment artifact

Original printed rank-6 Iron Thorns ex versus the existing New Moon Lockbreaker candidate, original candidate seat A first, source seat B second, seed **407516727**, pinned Twinleaf **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**, 260-root cap. Original canonical action SHA-256 **`87ef423a77ec6aafd6063fd3ad054ce3f9d29806a52ab04f21c1c6bb0e1495e4`**.

Re-downloaded and independently hashed [compiled Agent43 native source artifact **12236683159**](https://github.com/FlareZ123/experiment-01/actions/runs/39360446476/artifacts/12236683159). ZIP SHA-256 **`fe859b10d0785231e1a8f72d24e504691ff39759813894b4bc328db98ee0fd39`**; inner `agent43-rank6-owner-energy-replay.json` SHA-256 **`8ae67c9b9c2cc017235cc994b09ceb2661edade74e2b32aeee3675ebbaf3bb7b`**. Genuine public before/after board positions distinguish two different phenomena:

| Source global turn | Source root | Attached-card delta | Candidate Active before native prompt | Candidate Active after prompt | Narrow public inference |
| --- | --- | ---: | --- | --- | --- |
| 4 | `ResolvePromptAction` | **−2** | Latias ex with Basic Psychic + Telepathic Psychic | **Empty Active slot** | Both cards leave with the Pokémon's exit from its position, requiring public KO/zone attribution before labeling Energy denial |
| 10 | `ResolvePromptAction` | **−1** | Galarian Articuno V with Basic Psychic | **Same Galarian Articuno V, no Energy** | Genuine Energy loss while that Active Pokémon remains in place |
| 14 | `ResolvePromptAction` | **−1** | Galarian Articuno V with Basic Psychic | **Same Galarian Articuno V, no Energy** | Another genuine Energy loss from unchanged Active |
| 34 | `ResolvePromptAction` | **−1** | Gengar & Mimikyu-GX with Basic Psychic | **Same Gengar & Mimikyu-GX, no Energy** | Genuine removal of the just-attached Powerglass-returned Basic Psychic before the next candidate turn |

At turn4 the resulting Active has **no Pokémon**, and none of the previously attached Energy appears in the remaining visible Bench. This is strongly consistent with the attacker being Knocked Out (or otherwise leaving play). It does **not** prove a source card discarded two Energy directly. Distinguish the physical loss of attachments on Pokémon exit from a true single-Energy denial effect against an attacker that remains in play. The existing Agent43 report's aggregate **five attached-card losses on four source prompts** remains correct.

The same validated archived history shows five normal candidate Energy attachments, one genuine discard-to-Active Powerglass-like attachment, one paid retreat that discarded Energy, and the five source-root losses above, totaling six gained and six lost attached cards. This is a zone-accounting identity for **one censored game**, not a rate estimate.

## Registered public source-card provenance check

The opt-in research-only [source-root wrapper](../../simulation/twinleaf/agent30-rank6-source-public-denial-ledger.cjs) reads the source's hand index *only at an authentic publicly revealed `PlayCardAction`*, recording that single actually played printed card. It never emits or stores its remaining concealed hand. At every authentic source-owned `ResolvePromptAction` that reduces the candidate's publicly attached Energy, it records the specific public before/after board, native prompt type, and **all actual publicly played source cards earlier in the same turn**, with an explicit **`cardEffectAttributionCertified:false`** limitation. A most-recent played card is a contextual hypothesis, not necessarily the effect's reducer. This cannot identify a causal attacker, Item, Supporter or delayed effect unless the timing and public effects align and further source evidence is verified.

The [single-arm script](../../simulation/evaluation/agent30-rank6-source-denial-provenance.cjs) nests the existing [Agent43 pure observation replay](../../simulation/evaluation/agent43-rank6-owner-energy-replay.cjs), with fail-closed checks on **the exact original root SHA, five native manual Energy attachments, one positive Powerglass-like prompt, the same four source removal turns and all five attached-card losses**. [Three new pure tests](../../tests/agent30-rank6-source-public-denial-ledger.test.cjs) cover public play capture, concealment and Store hook restoration. It is registered as **opt-in only** `agent30_rank6_source_denial_audit:true` in the pre-existing manual workflow `.github/workflows/newmoon-compressor-source-partitions.yml`, without new workflow or push trigger.

Compiled source-card attribution remains **unverified until the manual CI completes and its genuine artifact is inspected**. Predeclaration does not establish a source effect or change the existing canonical result.

## Benchmark implications

For a generalizable candidate policy, these four losses must be interpreted using their different mechanisms: preserving a Pokémon against a KO, using Energy search/attachment after direct stripping, protecting an Active attacker against repeatable removal, and choosing whether to invest additional Energy into an attacker under Iron Thorns pressure. The card pool contains multiple plausible Energy-denial Trainers; its inventory alone cannot identify which ones were actually played. Any future counterfactual should account for the alternate use and future availability of the same scarce Energy rather than merely rewarding raw attachment counts.

The historical arm remains a **260-root capped zero-attack case** with unqualified both-seat bots and no tournament clock. There is no qualified loss/win probability, no prospective cohort, 29/32 exact original source lists, and no proven 99.5% fixed deck.
