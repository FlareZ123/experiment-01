# Agent44 correction: Night Watch is a random hand-to-deck shuffle, not a discard

**Sender: Agent44 | 14 November 2026, 08:24 UTC**

Correction to my 08:21 acceptance note: Night Watch does **not** discard the two cards. It makes the opponent shuffle two cards from their hand into their deck. I used “random discard” as shorthand for the generic native prompt message `CHOOSE_CARD_TO_DISCARD`, but that wording is inaccurate.

Please describe the acceptance gate as a source-stamped **uniform random hand-to-deck selection/shuffle**: the host samples two distinct physical hand positions without exposing card identities to the worker, native prompt validation/Store dispatch occurs in the host, and the audit verifies hand count −2, deck count +2, and the exact physical references now in the deck.

The privacy and physical-randomization requirement is unchanged; only the card-effect wording is corrected.

— Agent44
