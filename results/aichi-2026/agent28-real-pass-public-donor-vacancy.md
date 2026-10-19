# Agent 28: live source-dealt New Moon Perfection resource-vacancy gate

**19 October 2026. Evidence:** one compiled read-only source-game diagnostic on four previously inspected historical arms. No fresh held-out match, bot intervention, or competitive strength estimate.

## Reproducible historical replay

- [Manually dispatched CI 39242132486](https://github.com/FlareZ123/experiment-01/actions/runs/39242132486) **passed** on committed head `825e393d547509d0d4faa13143cff938be82219a`, with pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- [Exact JSON artifact 12181213654](https://github.com/FlareZ123/experiment-01/actions/runs/39242132486/artifacts/12181213654); ZIP SHA-256 `6b26bdd60b71594cdbe42d002c24b0c18491d88ca9c93fb1a7550a1503144c8c`; JSON SHA-256 `eb85a9b16f6c23d7d3bfc64650094c4fe70f93237f40a0f40aa4a613cdfd3efd`.
- [Pure public information inspector](../../simulation/twinleaf/agent28-perfection-donor-context.cjs) and [two passing Node tests](../../tests/agent28-perfection-donor-context.test.cjs), including throwing getters protecting both players' hands/decks/Prize cards, ran in compiled CI. [Reproducible wrapper](../../simulation/evaluation/agent28-perfection-public-source-replay.cjs) decorates **only the post-choice detached Perfection observer** with opponent face-up board, Stadium, own Bench/discard eligible GX/EX card identities, and own Active Energy; ordinary live tactics and source choices remain intact.
- All **four** authentic Store game root-action SHA-256 digests matched the earlier no-observer historical archive exactly; the runner refuses to publish the result if even one disagrees. Four historical games all ran without errors. The added observation is not a new independent sample.

## Actual rank-11 New Moon observations

The **rank-11, New Moon candidate B**, old seed `623585882`, had Active `Mewtwo & Mew-GX UNM` at four real already-chosen `PassTurnAction` roots. The detached pinned Store Perfection activation was rejected with `CANNOT_USE_POWER` before an attack-choice prompt in every observation:

| Root ordinal / global turn | Active Psychic Energy cards | Eligible owner GX/EX donors in own Bench or discard | Public opponent active / relevant board | Stadium |
| --- | ---: | ---: | --- | --- |
| 17 / 1 | 1 | **0** | Mega Absol ex, Benched Trubbish | Sky Field |
| 38 / 3 | 1 | **0** | Mega Absol ex, Benched Trubbish | Temple of Sinnoh |
| 48 / 5 | 1 | **0** | Mega Absol ex, Benched Trubbish | Temple of Sinnoh |
| 67 / 7 | 2 | **0** | Mega Absol ex, Benched Trubbish | Temple of Sinnoh |

Two opposing Trubbish are present on some later boards, but **no Garbodor evolved** on any of these four sampled roots. Opposing Tools were Float Stones on Mega Absol ex, which is not Garbotoxin. No copied GX/EX card was present in the acting owner's eligible visible source zones in any sampled state. There were no Perfection attack menus to select. The candidate made **zero real attack declarations** through 260 actions, but **20 other Pass roots were not covered** by this four-root observation.

The pinned [Mewtwo & Mew-GX implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-unified-minds/mewtwo-and-mew-gx.ts) and [copied attack helper](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prefabs/copy-attack-prefabs.ts) require a list of GX/EX donor Pokémon in Bench or eligible own discard. The helper can throw `CANNOT_USE_POWER` for an empty list, exactly matching the exposed **necessary resource vacancy**. The observation does not prove there is no further ability blocker in another state, certify copied attack energy affordability, or show the player would win by finding a donor. The earlier K1 [turn-one genuine deck-search telemetry](agent28-common-v0-source-payload-triage.md) reported one Gengar & Mimikyu-GX still in deck, consistent with the direct zone observations. The opponent's historical rank-11 Boost Shake line did **not** complete in this New Moon arm, so do not reinterpret this as a live locked-Garbodor response.

## What this changes

At the sampled genuine early Pass roots, **forcing Perfection cannot produce the intended copied attack without first moving an eligible donor into Bench or discard**. The first candidate-policy improvement to evaluate is donor **resource preparation**, such as available Battle Compressor selection, legitimate Pokémon search and discard, or related opportunity cost, under a **common policy algorithm for both immutable 60s**. Measure an actual owner-visible attainable resource action and a subsequently accepted copied attack plus opponent response before attributing strength or launching new seeds. If no legally playable preparation action existed, record that negative honestly and test a different resource line.

This is a new instrumented **resource-failure diagnosis**, not a win, loss, performance rate or proof that either deck is superior. **29/32 exact opponent lists, zero qualified competitive games and no demonstrated 99.5%.**
