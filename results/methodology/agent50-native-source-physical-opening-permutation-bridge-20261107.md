# Agent50: 64/64 genuine source opening hands and 155/155 native shuffle hashes reconstructed independently

**7 November 2026 | actual compiled Twinleaf setup archive audit | no games scored.**

## Exact question and result

Can an independently written executable, importing **none** of Twinleaf's CJS shuffle or game engine, reconstruct *the literal ordered seven original rank4 source-hand card printings* and every physical-permutation SHA256 receipt from two earlier native setup runs, including mulligans?

**Yes, for every archived relevant source arm.** The independent Python standard-library verifier rebuilt 64/64 actual rank4 source starting seven-card hands from the initial source deck's known physical printing order and generated 155/155 actual recorded physical shuffle permutation hashes across both players' native setup shuffles.

| Native archive | Registered seed+seat pairs | Source hand cards match exactly | Physical permutation SHA256 matches | JSON SHA256 sidecars validated |
| --- | ---: | ---: | ---: | ---: |
| Original rank4 vs rank1, Agent26 XOR-v1 per-seat, [run 42298886655](https://github.com/FlareZ123/experiment-01/actions/runs/42298886655/artifacts/13541919790) | 32 | **32/32** | **77/77** | 32/32 |
| Original rank4 vs identical rank4, same-original-seed XOR-v1 per-seat, strict [run 42325500697](https://github.com/FlareZ123/experiment-01/actions/runs/42325500697/artifacts/13554757634) | 32 | **32/32** | **78/78** | 64/64, including 32 separate legacy rows |
| **Total checked** | **64 source attempts** | **64/64** | **155/155** | **96/96** |

The **32 original seed and physical source-seat registrations agree exactly between the two archive cohorts** (set equality, order irrelevant). Source physical hands also match between rank4/rank1 and rank4/rank4 for all32 same-seed per-seat pairs, as separately independently established in the [native cross-arm report](agent50-identical-rank4-original32-seed-replay-20261107.md). This audit strengthens that match from comparing two archived native receipts into independently reconstructing both from first principles.

## Provenance and independently executing verification

- [Standalone Python verifier](../../simulation/evaluation/agent50-rank4-native-setup-shuffle-archive-verify.py) uses Python's stdlib `hashlib`, `json`, `zipfile` and `pathlib`, no pinned or contemporary Twinleaf imports, no simulation-engine class access, no arbitrary source hidden-state inspection. All 60 fixed source card names and four historical/compiled-printing normalization aliases are explicitly embedded; their SHA256 `3f82c3a7c43d62979ea2196b74bffd22fc51d6e7cc11cc27be9daad10d02b423` is asserted to match both archived original source deck digest fields.
- The four canonical printing normalization differences are `Ditto ♢ LOT → Ditto Prism Star LOT`, `Dedenne-GX UNB → Dedenne GX UNB`, `Lillie's Determination MEG → Lillie's Determination M1L`, and `Pokémon Ranger STS → Pokemon Ranger STS`. They change names only; all card counts and identities remain tied to the fixed source list.
- Python `seeded_random` independently implements pinned headless xorshift32, including `state=0` fallback and unsigned 32-bit masking. Its independent `permutation` uses Fisher–Yates from index 59 to 1, with `int(random*(i+1))` as JS floor for nonnegative values; the seed for physical owner seat `s` is `masterSeed XOR SALTS[s]`, where Agent26 XOR-v1 salts are `0x243f6a88` and `0x85a308d3`.
- For each actual native recorded `ShuffleDeckPrompt`, regenerate and SHA256 the **exact 60-int permutation**, check that it equals the archived `shuffleTape[n].permutationSha256`. Reuse the owner's stream for their subsequent shuffled mulligan hands and check the number of native shuffle prompts equals the archived mulligan count plus one.
- To reconstruct a source mulligan, start with the true rank4 physical list, apply the exact permutation, draw first seven, append the rejected cards to the deck **after its 53 remaining cards**, reshuffle with the next native-sequence permutation from the same per-seat stream, and repeat until the native number of mulligans has been performed. The resulting final seven ordered canonical printings must exactly match the genuine Store's `setupNativeStore[0].preOwnerHandPrintings` and its recorded hash. All 64 do. The public source Active selection, physically accepted initial placement and actual native source-first turn were already asserted by the underlying compiled tests, which are independent of the new Python script.
- [Manual CI 42327515510](https://github.com/FlareZ123/experiment-01/actions/runs/42327515510), HEAD `fdd5aea681185269d3c51f0a1bba30ca83bbccf1`, job `128266127513` **SUCCESS**. The workflow used official `actions/download-artifact@v4` to fetch the immutable prior native artifacts from runs `42298886655` and `42325500697` using the current repository Actions read token and verified individual JSON SHA256 sidecars after extraction. A separate job in the same run independently repeated the 200,000-seed pure numerical calibration with its three tests, also **SUCCESS**. Official artifact cross-workflow input mechanism was checked against GitHub's current download-artifact documentation.
- Original artifacts had previously also been downloaded and their ZIP digests independently verified locally: old per-seat `06b042fb6884b2803f46f8317751106bd89ed108af354b9a791eaa02a32cd491`, strict new `210a46dd5d64f779ae2f3e8ce8d89a3fb37f6d7713d82bb85f35ef62cf72bfdf`. The complete original ZIPs remain retrievable while GitHub Actions artifact retention lasts; the Python verifier and source list remain in the repository afterward.

## Pinned-rule and scope observations

The exact upstream pin is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. At this **specific commit**, `ptcg-server/src/game/store/state/card-list.ts` implements:
- `applyOrder(order)`: `cards[i]=copy[order[i]]`;
- `moveTo(destination,count)`: `cards.splice(0,count)`, then append selected cards to destination;
and `ptcg-server/src/game/store/reducers/setup-reducer.ts` explicitly uses `deck.moveTo(hand,7)` for normal initial hands.

The code and all 64 source seven-card reconstruction checks establish **leading-seven orientation for these actual first-hand native setups**. They invalidate any attempt to treat the 200k study's higher XOR-v1 *trailing-seven* correlation as the correlation of actual native initial draws. That independent [calibration report](agent50-three-protocol-shuffle-calibration-200k-20261107.md) records the relevant leading-seven binary phi as only +0.002014 for XOR-v1 and −0.000153 for SHA256-v2 on the original rank4 layout.

This is a narrow positive **physical setup integrity** finding for the explicitly enabled Agent26 XOR-v1 adapter. It does not prove uniform paper shuffling, independence of the seat RNG streams, the original legacy shared-stream's unspecified full RNG call order, any non-rank4 original deck, all card effects, owner-policy competence, adversarial opponents, clock fairness or a complete competitive game. Native paper-qualified game count remains **zero**, unchanged original field coverage **29/32**, no strongest single 60 chosen.

## Reusable diagnostic

The verifier reads either saved ZIP files or directories already extracted by GitHub Actions. Its failure checks are literal and fail closed on wrong original source60 digest, any missing/mismatched sidecar, any missing native per-seat shuffle or mulligan count discrepancy, any permutation SHA mismatch, a different seven-card actual hand, missing physical setup acceptance or different original seed registrations. No live secrets or hidden opponent zones enter the policy. Future native setup research can use the same approach on another fixed 60 by changing the explicit deck-list constant, expected digest and local printed-name aliases and rerunning all evidence joins.
