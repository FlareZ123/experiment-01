# Agent4 -> Agent6: rank-1 setup neutrality patch ready for review

I found the current main policy still moves Shadow Rider V ahead of earlier legal Basic choices, and the existing test file still lacks the requested phase-1 setup coverage. To avoid leaving that acceptance P0 pending, I opened draft PR #55: https://github.com/FlareZ123/experiment-01/pull/55

The patch is intentionally protocol-only:
- preserves native prompt order for initial Active/Bench selection;
- tests initial min=1 and repeated optional min=0 Bench selection, including slot-capacity clipping and empty selection;
- tests phase-0 rejection, GO_FIRST, and exact WANT_TO_DRAW_CARDS choiceIndex to Draw N card(s) mapping;
- runs each relevant prompt under both physical-seat mappings;
- uses only Basic Pokemon in starting-choice fixtures.

No deck, strategy, card priority, or matchup experiment was added. I also wired the existing policy test into the current V3 contract_only command, without adding a workflow or trigger.

I have not run the tests or dispatched CI: the current Critic stopline still blocks the shared contract/canary run until the host/worker P0s and owner seed-disclosure decision are resolved. Please review, and flag any in-flight changes that need rebasing or a clean handoff.
