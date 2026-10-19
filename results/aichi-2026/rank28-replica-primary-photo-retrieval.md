# Rank-28 original May 2026 photo: resolved provenance, no decklist

**Agent 9, 19 October 2026.** Public primary-media retrieval and bounded visual source review; **not** a recovered registered 60-card list.

## What changed

An earlier [manual public media collection run 39248936863](https://github.com/FlareZ123/experiment-01/actions/runs/39248936863) failed to resolve pinned rank-28 post ID `2053378618420859259`, because the X post mirror returned the current author handle `nnaac5` rather than the contemporaneously cited `nnaacc5_uec`. Current public username references use `@nnaac5` and the display name レプリカ (Replica). The 2026 historical [Pokéca Meshi placement roundup](https://pokekameshi.com/cl2026aichidec-extra/2/) identifies the original May 10 post as a qualifier-28 Regidrago report. Those independent leads motivate a **single pinned, explicit alias**, not a global relaxation of author checking.

Updated [primary-post retriever](../../scripts/aichi-missing-rank-social-media.cjs) accepts `nnaac5` only as an additional author handle for the **same original pinned rank-28 tweet ID**, retaining exact tweet-ID checking, original `pbs.twimg.com/media/` URL validation and the permanent `certifiedRanked60:false` state. [Offline regression](../../tests/aichi-missing-rank-social-media.test.cjs) checks the current alias, unrelated author rejection, wrong tweet rejection and preservation of rank-25 isolation. Source commit `9303081`; test commit `1ddd37c`.

[Second manual GitHub Actions run 39292707909](https://github.com/FlareZ123/experiment-01/actions/runs/39292707909) **succeeded** on head `1ddd37cd13325cf9554cb63904c5d51d5e8756b7`. Original public artifact **12206930990**, name `aichi-missing-source-primary-media-unverified`, artifact ZIP SHA256 `0669e13367780689e92a0f2bb3351ddca7cb8ba78d14e51f7d9ea219525e6aa5`. Its manifest records rank-28 `post-resolved`, returned author `nnaac5`, one fetched original image `rank28-replica-photo-1.jpg` of **782,982 bytes**, image SHA256 `d7ed049c4335dcf906ee3ff2d60ca810cb1943672731d237362243af3c8b4d31`. The post text says 「CL愛知エクストラ 予選28位トナメ1没でした！ レジドラゴ、今までありがとう」, meaning qualifier rank28, lost first knockout, farewell to Regidrago.

## Direct image review and limitation

I inspected the retrieved original photo as pixels. It shows an official-looking **Open League 28** badge, tournament qualification letter, boxed card sleeves and several illustrated Pokémon cards. **There is no pictured 60-card deck grid, registration export, complete card-list screenshot or list of copy counts.** The displayed few loose cards cannot justify reconstructing or estimating any missing physical slots. The photograph supports attribution of the *public poster's rank-28 claim* and contemporaneous game participation but does not independently connect their X alias to the civil name **Jo Kato** in the standings. The rank/archetype agreement is corroboration rather than identity proof.

The same new run also resolved rank-25 `kume_pokeca` and unassigned `yamatodaisuki` source photos, but their associated original posts do **not** establish rank-25 or rank-23 registered 60s. The rank-25 photo concerns a restaurant meal and a passing mention of Alolan Raichu; no decklist is visible.

## Disposition

The false-negative social retrieval bug is fixed and verified in native Node CI. The original rank-28 public image has durable identifier/digest provenance until archive expiration; **no missing deck source was recovered**. Continue public original deck-code, registration-image or independently attributed primary-list search, including the [official Players Club event 981404 follow-up](official-players-club-event-981404-source-lead.md). Do not impute rank28's list from another Regidrago Top-32 card multiset.

**Source coverage remains 29/32; competitively qualified games remain zero; no single fixed 60 has demonstrated the 99.5% goal.**
