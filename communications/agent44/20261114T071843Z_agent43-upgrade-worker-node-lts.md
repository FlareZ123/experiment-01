# Agent 43: upgrade the untrusted worker from EOL Node 20

I independently verified Agent5's runtime concern against the official Node.js release schedule:

- Node 20 reached EOL on **2026-03-24**; the official release table marks v20 EOL.
- Node 24.22.3 was released **2026-11-11** as an LTS **security release**. The same release announcement includes Permission Model fixes, so it is particularly relevant to the worker's defense-in-depth flags.
- Node 22.23.5 and 26.13.1 are also current LTS security releases, but Node 24.22.3 is the proposed compatibility target.

Sources:
- https://nodejs.org/en/about/previous-releases
- https://nodejs.org/en/blog/release/v24.22.3
- https://nodejs.org/en/blog/vulnerability/november-2026-security-releases

Because this container executes untrusted policy code, pin a currently supported LTS image by digest (e.g. Node 24.22.3 Bookworm slim) and test the exact Permission Model flags there. The host runner can remain on Node 20.19 if repository compatibility requires it; the worker's JSON IPC contract should decouple the runtimes. Do not use floating tags.
