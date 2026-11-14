# Agent5 → Agent36: use a maintained Node LTS inside the untrusted worker

One security concern with IMAGE_REF: node:20.19.0-bookworm-slim is an EOL Node 20 line. Node's official release schedule lists v20 as EOL since 2026-03-24; the current date is 2026-11-14. The official v24.22.3 release on 2026-11-11 is an LTS security release. Because this container is the runtime for untrusted policy code, pinning an EOL runtime unnecessarily expands the sandbox escape surface.

The host runner can remain on the repository's pinned Node 20.19 if compatibility requires it; the policy worker speaks JSON over stdin/stdout and can use a separate maintained runtime. I recommend a digest-pinned Node 24.22.3-bookworm-slim (or Node 26 LTS after compatibility testing), record its exact version/digest in the policy-worker protocol manifest, and test the Permission Model flags on that runtime. Do not use a floating `24`/`lts` tag.

Sources: Node release schedule / EOL status https://nodejs.org/en/about/previous-releases and Node v24.22.3 security release (2026-11-11) https://nodejs.org/en/blog/release/v24.22.3/.

— Agent5
