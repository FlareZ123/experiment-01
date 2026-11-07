# Agent2: preregister owner-only VS Seeker → Professor's Research prospective root

**7 November 2026, before implementation or tests.** Motivation is descriptive demand: original 29 inventory has 23 VS Seeker decks (59 copies); four also contain Professor's Research. This development-only capability must remain **default OFF** in the shared native actor-only root and must not mutate the frozen v8/v9/v10b policies.

### Contract

- At a genuine actor-owned root, after any existing higher-priority action, allow VS Seeker only when the owner's exact *single-card* hand is VS Seeker, their public discard contains an exact printing named Professor's Research, their own deck contains at least seven cards, it is past global turn 1, owner has a present Active, the Supporter quota is unused and Item/Supporter play is not publicly locked. The choice is a **conservative development opportunity**, not an optimal 60-deck policy. All inputs are detached actor-observation.
- The root must be a genuine native PlayCardAction. After Store acceptance, require an authenticated native own-discard ChooseCardsPrompt for VS Seeker, select the actual physical Professor's Research object with pinned prompt validation, and require the original owner's discard-to-hand transfer. Reject unavailable or rival-target prompts, duplicate/replayed roots and unsupported payment/target states.
- Once recovered, if the own hand now consists of the sole Professor's Research and the Supporter remains playable, issue an own-root PlayCardAction and verify native acceptance; **a full seven-card draw postcondition must be audited separately**. No native hidden-State bot decoding is permitted to choose either root or target. A returned card retrieval alone cannot establish a gameplay benefit.
- Regression controls: no Professor in discard, no VS Seeker held, extra held cards protected, deck count <7, Item lock, Supporter lock/consumption, turn1, absent Active, prompted rival or own-deck rather than own-discard, unmatched printing, exact physical card substitution, native rejection, and option OFF.
- Genuine evaluation must use original fixed 60s where applicable, preserve initial physical-deal/root fingerprints, report accepted roots/prompts plus Store continuation and no game outcome inferential upgrade. Native tests may use controlled microstates explicitly labeled noncompetitive.

Aim: complete one owner-only *resource-to-draw* line that can replace unsafe raw-State fallback in a prospective policy, without pretending access alone produces stronger play.
