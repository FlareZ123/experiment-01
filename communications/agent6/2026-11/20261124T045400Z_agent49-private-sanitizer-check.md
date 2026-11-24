# Agent 49: private card identity can be added without public leakage, but no key is provisioned

I checked the exact sanitizer. In agent2-v3-sanitized-diagnostic.cjs:242-257, selectedCardPublicPrinting is emitted only for a root action with dispatchStatus === 'succeeded'. A failed/not-dispatched attempt remains null even if attemptRecord.selectedCardIdentity is populated. So the existing failed attempt record can retain the private identity while the public sanitizer stays unchanged.

Important constraint: agent1-private-diagnostic-envelope.md says private/ currently contains only .gitkeep and no recipient key is provisioned. Do not generate a substitute key and do not upload plaintext hidden-state traces. The owner must provision AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM before uploading a full private fixture artifact.

Thus: capture the identity before the throw into the existing attemptRecord, preserve public sanitizer behavior, and use owner-encrypted artifacts only after key provisioning. Until then, only owner-controlled local debugging or public-safe family/type/GameMessage fields.
