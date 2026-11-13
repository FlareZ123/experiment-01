# Pinned Twinleaf mapping for the 24 Aichi diagnostic decks

**13 November 2026.** Pinned Twinleaf registered all 812 normalized rows and 1,440 copies as 24 complete 60-card decks. CardManager reported 14,116 card printings across 162 set exports. There were zero unresolved rows.

The [full compressed JSON](aichi-twinleaf-decklist-bridge-agent49-20261113.json.gz) retains every source-to-engine mapping, the ordered and multiset registered-deck hashes, and the original source identities. Its uncompressed SHA-256 is `8b14222662e17eff9a9e3c1e82b0d640a371d7c3451c50dc947c653257f7f48f`.

| Aichi source rank | Resolved rows | Copies | Registered 60 multiset SHA-256 |
|---:|---:|---:|---|
| 1 | 33 | 60 | `9d061043904d0d824c7cbd76f72c0b98858c6f203621ab24b38af23025475bcd` |
| 2 | 38 | 60 | `df292db23f36e13b8e3d25f74991ee92e94f8f9a878bca49c755aabd757c8156` |
| 4 | 31 | 60 | `a9642bb17191121c2ade2f7494c227f6537d7d68fb710166b9d6d2c58f9476a4` |
| 5 | 30 | 60 | `92b72616cbda9e049485c01af131b52c39a2d5cfd281196f2cd17d90725866c4` |
| 8 | 37 | 60 | `01c61cbda7b19cbaea43faa4e813fdfc03d07aadfe188ef640b7c017327c2ec9` |
| 9 | 33 | 60 | `8fa44e6a35b220c1ff934ba0589f42da97cf3e38f53f04bef14b44c0741ad42d` |
| 10 | 36 | 60 | `6150dfe236c179d2510bf482f5b366c0804a47b94616e32936e8d36ebbd142ae` |
| 11 | 26 | 60 | `282565c2ec4291d943a483aa99b785629a88e075c1d8b80b07c3556a49ad3d59` |
| 12 | 35 | 60 | `ab29a963dd77d982739180dfe06d6091ea4e2d7434b0a3084428e87c42e29692` |
| 13 | 34 | 60 | `d6d9c77b64bdbcb500896f0cdc2852a96c4ae073c933f55f2e4fc9d5b9cfcda4` |
| 14 | 37 | 60 | `e864a842936742ba820bfc1e983daa7632bf9e1416f2a8ef398a5866ad5a8cae` |
| 15 | 35 | 60 | `935616b8c6f11150d0c9d2d6a0d33f0769acf76125cf15b377cd2c49b96f1915` |
| 16 | 29 | 60 | `8583bf5eceb68233f6954d3a7426acc5f990355990e7d8e41a29e4ed896ccccf` |
| 17 | 27 | 60 | `df05e855abf269992b6e280f4064c075e0ec02f7bc4be14ad097192e34efd8f7` |
| 18 | 33 | 60 | `081d4573acdbc7a55cfd14629b38eb060e177656a5291cb2f6e44f962f5f3087` |
| 19 | 37 | 60 | `d6fbfbe09ceceaa7a7c8e2fc5edfbae596073353b8aea65c3eeed082626e1790` |
| 20 | 36 | 60 | `87882758be98aef7e2abed4e451d254cb0f98f735d7b9ac96cc20f5b39078cdb` |
| 21 | 38 | 60 | `66723734018ab5c642447ee1549b7f7025c4a4fea348f04bea59044d90dcab93` |
| 22 | 36 | 60 | `e850412a0d1291c6e257f72041fe651e07aaafc9ceb1bdf8a85bc08c19cf6189` |
| 26 | 32 | 60 | `89d92a10bd7a905a561791750e66178e82a03c3094cf906c63091acf7826f08d` |
| 27 | 37 | 60 | `bec337671032ed90ecc16a08c19c2b3166b8c77482f05074258978daae66b44f` |
| 30 | 32 | 60 | `b9f97ec590fe7a2ebf149cfafff4d84d5764a092d0e33dfd48d94fd981ab7f27` |
| 31 | 31 | 60 | `b3740f9e5b442b3b400cedbab493a0e99b7c974a3554e8ae334ef8889ba1ea78` |
| 32 | 39 | 60 | `fe51a21762bf1b758ae0a205d3fb4231d9fd68df8a4d941d4e8623f578a4f3b3` |

Ranks 1, 8, 19 and 22 resolved all six Night Stretcher copies directly to Twinleaf ASC/196. The live CardManager registers that print, and the existing exact-first bridge selected it in every occurrence. The SFA/61 fallback did not run. The rank-1 ordered engine-input SHA-256 is `ea19873885b3e4f986f39f86dbc9b16ed2c9602e2e0978340858b4d9f9012dca`.

## Reproduction

- Research commit `d22e24d722be746ad04529ea0491c3f64b85f561` and Twinleaf gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` at `vendor/twinleaf`.
- Built Twinleaf with Node 20.19.0 using the committed lockfile, `npm ci --no-audit --no-fund`, and `npm run compile`. Ran the bridge and all 13 bridge tests with Node 22.22.0.
- Regenerated the audit from the committed source with the CI rank selection. The SHA-256 was `6ac2fbaec602f7c9ffd49c2a90c4c79be78df696cc56decc3631f5ad50c1812b`, exactly matching the frozen input required by `twinleaf-smoke.yml` for [source artifact 14027319169](https://github.com/FlareZ123/experiment-01/actions/runs/43407979154/artifacts/14027319169).
- Ran `node simulation/twinleaf/2026-11/agent39-aichi-twinleaf-decklist-bridge.cjs <audit.json> <result.json>` locally. GitHub Actions run [43468088132](https://github.com/FlareZ123/experiment-01/actions/runs/43468088132) remains the earlier pre-mapping failure.

The registered decks are diagnostic English Expanded reconstructions. Ranks 3, 6, 7, 24 and 29 remain outside this diagnostic panel because of Japanese-only promo identities. Original lists for ranks 23, 25 and 28 remain unavailable. Paper admission and competitively qualified games remain at zero.
