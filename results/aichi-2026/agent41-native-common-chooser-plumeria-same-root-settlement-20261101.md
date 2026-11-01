# Agent 41: shared native same-root chooser selects and settles real Plumeria

**1 November 2026. Retrospective original-source, pinned-Store, two-seat common-policy developer test. 0 competitively qualified games.**

## Why this is a new integrated result

Prior exact source observation verified that an original rank6 Iron Thorns owner held both `Plumeria BUS` and `Team Flare Grunt XY` and that both had genuine `card.canPlay===true`. This report reaches the **next verification threshold**: the same shared two-seat same-root policy actually chooses Plumeria over its baseline terminal Pass, constructs the native owner's physical `PlayCardAction`, dispatches through the real original Store, processes the original card's two mandatory owner-hand discards, target Pokémon and attached Energy prompt, and independently checks physical removal of the opposing Energy. Native action existence is separate from native settlement; both are archived.

## Frozen original source and reproducibility

- Original registered Aichi final rank6 source deck is one exact physical `60`, physical source seat `1` for candidate slot A, source seed `296638747` repeat10.
- Original rank6 source physical-deal fingerprint: `29db5b5feaf15b2eec86b19e7d1bbe46738f63ef8e479da9a22ecb46970a1dab`.
- Source registration blob: `6f4a694403069674f33daf81eff18971e214b758`. Original rank6 registered trials are `6:10:A:champion-reference` and `6:10:A:new-moon-lockbreaker-v1`.
- Pinned Twinleaf submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Native runner `simulation/evaluation/agent41-rank6-native-plumeria-common-choice-pair.cjs`; shared native root chooser `simulation/twinleaf/agent41-same-root-proposal-choice.cjs`, native actor `simulation/twinleaf/agent34-actor-only-root-policy.cjs`, mandatory prompt observer `simulation/twinleaf/agent4-plumeria-after-pass.cjs`. Original `Store.dispatch` is retained.
- Four actual native developmental attempts: same frozen physical deal for **control + treatment** against each of two unchanged candidate 60s. Both actual players receive the same policy. Control uses `sameRootProposalChoice:true,sameRootChoiceApply:true`; treatment also enables the default-off `nativePlumeriaChoice:true,actorPlumeriaAfterPass:true`, making the prompt adapter adopt the chooser's exact tagged native PlayCardAction. The chooser only selects this alternative when the baseline would Pass and the opposing Active displays two or more Energy.
- Successful [manual CI 41272403629](https://github.com/FlareZ123/experiment-01/actions/runs/41272403629), head `1e4ecfe37b95ec0babc896a7ae552eea5f0c85ae`; 76 source-panel pure tests passed, original pinned Store compiled. Artifact ID **13069952353**, ZIP SHA256 `349de8674971001297f88ef2248f907d51cf31583f7336ab1d6f89cf9566c5b1`.

## Actual live native results

| Frozen opponent pairing | Same original source + full starting physical deal? | Control | Treatment canonical Plumeria choices | Real public PlayCardAction acceptance | Physical payment and opposing Energy effect | Prompt chains unresolved |
| --- | --- | --- | --- | --- | --- | --- |
| Rank6 vs Champion Reference | **Yes** | Censored, no selected alternative | Source turn **4**, actor root ordinal **7**, Store action **26** | 1 accepted; public Supporter quota/card-zone witness | 2 physical owner-hand cards discarded and **1 Psychic Energy MEE removed** | 0 |
| Rank6 vs New Moon Lockbreaker | **Yes** | Censored, no selected alternative | Source turn **52**/ordinal **60**/Store action **183**, and turn **58**/ordinal **69**/Store action **207** | 2 accepted with public Supporter quota/card-zone witnesses | **2** separate genuine Plumeria prompt chains, each consuming 2 physical owner hand cards and removing **Psychic Energy MEE** | 0 |

No native engine errors. Both treatment games remain capped/censored. Controls also remain capped/censored. All 3 selected real Plumeria roots used `origin:'same-root-actor'`, `accepted:true`, `nativePhysicalEffect:'confirmed-public-effect'`, and the *separate* original Store prompt receipt `plumeria-energy-settlement accepted:true`.

**Denominator discipline:** These are **three selected owner roots in two correlated game trajectories** sharing **one original source seed**, embedded in **four attempts**, not three independent matchup games or three confirmed strategic wins. Zero competitively qualified games. At this stage the wrapper's exact selected-root receipt plus prompt settlement is proven; opponent reply and actual game advantage have yet to be causally established.

## Important false starts and repairs

1. The original `inspectNativeCoheldDenialCanPlay` module had an actual duplicate `observe` declaration; corrected and compiled in earlier successful CI 41271465642.
2. The first common-choice run [CI 41271944883](https://github.com/FlareZ123/experiment-01/actions/runs/41271944883) failed and preserved both treatment engine errors. An error-preserving second run [CI 41272193642](https://github.com/FlareZ123/experiment-01/actions/runs/41272193642) traced both failures to the **original actor physical-root observer**, which assumed every unrecognized root intent was an `attack`; it encountered `play-plumeria-payment-menu` at real native Store action26 and183. This was an integration-witness exception, **not evidence the Plumeria card failed native legality**.
3. The owner root physical observer was corrected to recognize Plumeria among genuine Supporters, checking the original Store's public Supporter zone departure and quota; `simulation/twinleaf/agent5-owner-root-slice.cjs`. A three-case regression confirms it will not attest a card without both original physical effects. The third run 41272403629 then passed both native Store arms, while retaining all pairs.

## Evidence boundaries and next hard question

- Three genuine native choices and their full mandatory prompt settlements now work **without patching upstream Twinleaf**. Code is default-off while evidence remains developmental. This is an operational integration step toward one shared policy.
- This report does **not** establish which Supporter is strategically better, whether Plumeria's two owner-card discards were acceptable DCI costs, whether a free Team Flare Grunt alternative would produce stronger future source turns, whether any candidate would win, or whether game clock/KO/hidden information were correct for a competitive paper game.
- Replicate root-level first divergence, source followthrough, next opponent response and no-opportunity denominator with a public action-ledger comparison using these exact original deals; do not count the replay as new independent seed evidence. Then test an **independently registered** new source match with original full 60 opponent field, applying the same global choice policy to both actual player seats.

Benchmark remains **32/32 classified opposing archetypes; 29/32 original exact opposing 60s; 0 competitively qualified games; no fixed-deck 99.5% achievement**.
