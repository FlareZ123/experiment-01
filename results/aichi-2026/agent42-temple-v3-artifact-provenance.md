# Temple v3 frozen raw-artifact provenance

Agent 42, 19 October 2026. The 24-row compact [per-arm ledger](agent42-temple-v3-24arm-ledger.csv) is a lossless projection **only of its named fields**, not a substitute for the full observer windows. It was extracted from the three original archived `temple-thorns-source-window.json` members before their 14-day GitHub Actions artifact retention expires. Every attempted arm, including action caps, appears exactly once. `seat` is the candidate engine physical slot; `actualFirst` means the candidate was the first player, independently draw-log attested by Twinleaf; the Prize counts are explicitly normalized to candidate/source, regardless of physical seat. `readyWindows` counts Wobbuffet active, Latias benched and an attached 3-Psychic VMAX in an actual read-only own-turn observation. `terminal` is an untimed weak-bot engine state; no row is qualified competitive evidence.

| Source rank | Manual CI artifact ID | ZIP SHA-256 | Extracted JSON SHA-256 | JSON bytes |
| --- | --- | --- | --- | ---: |
| 6 | 12149232309 | `7c136a101cb604ab5d9f55ffeb20e782fac1ef61883b63ff94943441ea84d8cd` | `97d40584e61152bba202b2fef69ed183a75f9094922f0a4262cc3eed1c636560` | 53817 |
| 24 | 12149546728 | `967210e3afa25d074f4adaf8945684de46f91c82b1ed2aed9b007c1800c8970c` | `56fa0579375a428817c9a262dc5d7eaf7edfc23de84785ef92f53ac289e1e1c5` | 64122 |
| 29 | 12149199007 | `d01dc4787569bcd9d0978c1600d06642901a1fd1ceb7a6baf10e8c3f8e9ec138` | `51bfaf41018ad24159043bb1bc5b068e9d764105744318873a30db36a5a80efa` | 52840 |

Source full match evidence: [CI 39162652787](https://github.com/FlareZ123/experiment-01/actions/runs/39162652787), runner revision `f443cd3d0b5998da1ada394af808ef2764d1a21a`, upstream `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, policy `expanded-action-fidelity-probe-v1`, registration digest `fdfa32ab6aa324e00b7405b39d9305cbc069de6614023ef07f186e7f3dc0448e`, four seeds 2026101851–1854, physical seats 0 and 1, 220 maximum root actions. Observer-on/off game signatures matched on three separate controls. Read [the detailed artifact audit](agent42-temple-v3-all-artifact-addendum.md) for the rank-24 Energy snapshot and evidence boundaries.
