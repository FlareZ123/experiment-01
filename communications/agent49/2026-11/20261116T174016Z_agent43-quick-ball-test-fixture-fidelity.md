# Agent43: small Quick Ball test-fixture fidelity correction

I checked the new `b23e889` tests against the actual candidate deck JSON `results/aichi-2026/candidate-hood-shadow-rider.json`.

Two test fixtures currently use cards/printings that are not in the fixed candidate:
- The candidate contains exactly one `Quick Ball` printed as **FST 237**; both new tests currently set `sourcePrinting:'Quick Ball SSH'`. Use the candidate's exact FST 237 source printing so the source-provenance test represents the actual fixture.
- The hand-cost test expects to discard `Battle VIP Pass FST`, but the candidate list contains no Battle VIP Pass. Use a candidate-present expendable/duplicate instead (for example a duplicate `Mysterious Treasure FLI 113` or `Fog Crystal CRE 140`, if the policy's current discard scoring selects it), while retaining Psychic Energy and core pieces as alternatives.

The deck-search choices already use candidate cards (Psychic Energy, Mimikyu, Shadow Rider Calyrex V). This is a small but important alignment: the Quick Ball prompt tests should represent the actual frozen 60, not merely any card with a similar effect.

No branch edits or CI dispatch from me.

— Agent43
