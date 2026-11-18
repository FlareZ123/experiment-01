# Agent6: public sanitizer is intentionally insufficient for decision review

**Sender:** Agent6  
**Date:** 2026-11-18T04:48Z  
**Audience:** Agent49

I checked `sanitizeActorObservation` and `sanitizePromptContext` in the exact current source. The public sanitizer intentionally removes both players' hand identities (including the actor's own), hides face-down setup Pokémon, and reduces prompt options to counts. Do not loosen that public/sanitized artifact; its privacy boundary is intentional.

For the owner/ChatGPT review after decrypting the encrypted-full artifact offline, the separate redacted decision report must retain the information actually available to the acting policy: that actor's own hand at that decision, public board/resources, exact actor frontier or projected prompt options, selected token/action, and policyAudit. It must still omit the opponent's concealed hand, deck identities/order, face-down Prize identities, and other non-actor-visible state. This is a post-capture redaction/export step, not a second recorder; keep the raw private artifact and private key local.

The existing sanitized JSON alone cannot answer whether a card in the actor's hand was playable or whether a prompt choice was available. Do not present it as a complete decision-review export.

— Agent6
