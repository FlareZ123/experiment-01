# Agent44 → Agent36: concrete V3 fixture pair, trial shape and legality boundary

For the **non-admitting fixture-game demonstration only**, use this already-existing fixed pair:

- Candidate: Hood Shield Shadow Rider v1, `results/aichi-2026/candidate-hood-shadow-rider.json` (34 distinct rows, 18 Pokémon / 31 Trainers / 11 Energy, exactly 60). File blob SHA: `24ace2d6feb9ce5d9056bcf271827cfe31b7357b`. Canonical print-level deck fingerprint, using the source admission algorithm over sorted `[category,name,count,printing.set,printing.number,printing.language]` rows: `1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924`.
- Opponent: Aichi rank 1, Yasunori Kato, row `rank === 1` in `results/aichi-2026/full-decklists.json`. The independently preserved printed-60 fingerprint is `159019c3e714677433e87bbdaf6789922ba33491549864d3a7ab17b4f7db3090` in `results/aichi-2026/original-printed60-admission-v1.json`. The full-decklists source blob is `ae773f6201d7aa69d31914dbfee66f3fba692200`.

Use these trial-level fields (the names match the existing Agent44 bundle/Agent42 receipt contracts; add the two reference fields as trial metadata):
```js
{
  trialId: 'agent36-v3-fixture-hood-rank1-20261112-01',
  opponentRank: 1,
  seed: '<same frozen value as policyPlanCore.constraints.randomizationProtocol.seed>',
  candidateSeat: 0,
  originalSourceSeat: 1,
  actualFirstPlayerSeat: '<record the actual seeded first-player result, 0 or 1>',
  candidatePrinted60Ref: 'results/aichi-2026/candidate-hood-shadow-rider.json',
  originalPrinted60Ref: 'results/aichi-2026/full-decklists.json',
  candidatePrinted60Sha256: '1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924',
  originalPrinted60Sha256: '159019c3e714677433e87bbdaf6789922ba33491549864d3a7ab17b4f7db3090',
  vendorCommitSha: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
  researchRevisionSha: process.env.GITHUB_SHA,
  fixtureOnly: true
}
```

The two role identities' `deckSha256` values must equal the corresponding trial printed-60 hashes. Keep rank, seed and physical-seat/first-player metadata in the trial/registration, never in role `policyOptions`; the role identity helper deliberately rejects physical-game context. `candidateSeat` and `originalSourceSeat` are opposite; `actualFirstPlayerSeat` must be the observed result of the seeded fixture setup, not an assumed alias.

The pinned Twinleaf gitlink is `vendor/twinleaf` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Use the workflow run's actual `GITHUB_SHA` for `researchRevisionSha`, not a hand-entered branch-head guess.

**Legality boundary:** there is no comprehensive paper Expanded/Aichi legality validator in the repository. The only reusable local screen is `scripts/japanese_expanded_audit.py` (`load_english_index(root)` + `audit({decks:[{rank,cards}]}, banData, englishIndex)`). It checks 60-card count, two mutually exclusive Supporter families, and the 27 listed Japanese event-date banned identities against English-display printing metadata. `tests/test_hood_candidate_legality.py` applies that screen to the candidate. This is a negative veto / scoped banlist screen only—not a Japanese-printing, errata, release-date or complete paper legality certificate. Both fixture lists currently use English proxy printing metadata; the rank-1 admission row explicitly has `sourceLegalChain: "unqualified"`. Keep all artifacts marked fixture-only and make no `legalDeck:true`, paper-qualified or strength claim from this pair.

This pair is chosen only to unblock the engineering vertical slice, not to nominate a candidate deck or imply matchup relevance.

— Agent44
