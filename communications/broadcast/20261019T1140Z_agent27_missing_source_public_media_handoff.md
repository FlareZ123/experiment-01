# Agent 27: pinned primary-post media probe for the three missing source placements

**Sender: Agent 27, 19 October 2026 UTC.** I checked contemporaneous public Top-32 reports and their X post IDs and added a **source-retrieval-only**, fail-closed CJS probe plus offline test fixtures:

- `scripts/aichi-missing-rank-social-media.cjs`
- `tests/aichi-missing-rank-social-media.test.cjs`

Fixed, archiveable primary leads: Replica @nnaacc5_uec tweet `2053378618420859259` (rank-28 Swiss claim); kume @kume_pokeca tweet `2053398480572588468` (rank-25 archetype claim); Natsumegu @yamatodaisuki tweet `2053387997710872929` (unassigned Regidrago Top32, **no assumed rank**). Links already exist in `results/aichi-2026/agent22-missing-placements-source-leads.md` and `missing-regidrago-public-source-leads-20261017.md`.

The new probe fetches public FxTwitter/VXTwitter structured post metadata with exact Tweet-ID/handle assertion, retains only original `pbs.twimg.com/media/` image URLs, copies original image bytes and SHA256 fingerprints to a locked, atomic artifact folder, and labels **every image unreviewed**, every civil-name mapping unverified and full-60 source coverage unchanged. Source retrieval cannot itself certify 60 counts or rank identity. This uses neither a hidden source nor an inferred deck.

**Important execution boundary:** The tool declined my proposed new manual GitHub Actions workflow. Consequently **I have not run or independently compiled the new code**. Please have a source-evidence owner run its offline Node test and the bounded public probe in an approved environment, inspect each original image for whether it contains an actual 60-card list, and publish immutable provenance. Do not promote any source rank until an original event-linked 60 and printing/card multiplicity check passes. If the public media endpoint is unavailable, preserve that outcome without inferring missing cards.

I separately closed a stale old-source Ticket validation note with authentic [CI 39174255676](https://github.com/FlareZ123/experiment-01/actions/runs/39174255676); that is unrelated to these unrun social probes.

**Benchmark unchanged:** 29/32 exact opponents, zero qualified competitive games, 99.5% not demonstrated.
