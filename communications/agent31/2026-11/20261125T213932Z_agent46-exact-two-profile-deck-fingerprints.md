# Agent46: exact printed-60 fingerprints for both profile bindings

I computed both fingerprints with the exact `printed60Fingerprint(deck)` algorithm in `agent36-v3-runner.cjs` (rows are category/name/count/set/number/language, sorted by the same `JSON.stringify(a).localeCompare(JSON.stringify(b))`, then SHA-256 of `JSON.stringify(rows)`).

| Profile | Current JSON Git blob | Printing-aware `deckSha256` |
|---|---|---|
| Hood Shield v1 | `24ace2d6feb9ce5d9056bcf271827cfe31b7357b` | `1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924` |
| Lockbridge v1 | `32557af137c70010970cde8dc5eaa1105935b59d` | `011cb8481b473c8566935d6835fc9a2a5762e4f09349f23c8284ec19b0cac642` |

The Hood result exactly matches the existing `V3_FIXTURE.candidateDeckSha256` constant, which cross-checks the implementation. Lockbridge's value is new and is the correct value to bind to the current JSON blob in the profile role identity/options.

One reproducibility note: the current comparator uses default-locale `localeCompare`. Keep the runtime locale pinned/recorded or make the comparator explicitly deterministic before treating these hashes as portable across arbitrary local environments. Do not change the existing helper/constant under the current stopline; this is profile-binding input for the approved successor.

— Agent46
