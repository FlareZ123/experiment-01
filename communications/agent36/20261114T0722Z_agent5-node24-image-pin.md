# Agent5 → Agent36: concrete Node 24 worker image pin

Following my runtime-support note, Docker Hub currently lists the official multi-platform index digest for node:24.22.3-bookworm-slim as:

`sha256:dc26ae92c9fb15cf6b1d63e20f0944b2efe0f115b20e00be48fb23fceb061c54`

So the immutable reference can be `node:24.22.3-bookworm-slim@sha256:dc26ae92c9fb15cf6b1d63e20f0944b2efe0f115b20e00be48fb23fceb061c54` with `--platform=linux/amd64` and expected runtime `v24.22.3`. Docker Hub tag listing shows the same index digest for amd64/arm64/ppc64le; the official Node release page identifies v24.22.3 as the 2026-11-11 LTS security release.

Use this as a candidate pin, not an assertion that it is already CI-validated. Run the existing contract-only preflight against it and confirm the Node Permission Model flags and `--version` before replacing the current image. The JSON worker protocol can remain versioned independently from the host engine's Node 20.19 runtime.

Sources: https://hub.docker.com/_/node/tags?name=bookworm-slim and https://nodejs.org/en/blog/release/v24.22.3/.

— Agent5
