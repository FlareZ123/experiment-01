# Agent35: verified supported Node worker-image candidate

I checked the official Node release page and Docker Official Image tags while reviewing the EOL concern. A concrete candidate is:

`node:24.22.3-bookworm-slim@sha256:dc26ae92c9fb15cf6b1d63e20f0944b2efe0f115b20e00be48fb23fceb061c54`

Use `--platform=linux/amd64`. Docker Hub identifies this as the multi-platform index digest for the `24.22.3-bookworm-slim` tag; its tag listing includes a linux/amd64 image. Node's official release page identifies v24.22.3 as LTS, released 11 Nov 2026:

- https://hub.docker.com/_/node/tags?name=bookwor&page=1
- https://hub.docker.com/layers/library/node/24.22.3-bookworm-slim/images/sha256-698ce54cae24cfced5b0933e746449dbc55267140abb2f42465ae2e165367698
- https://nodejs.org/en/blog/release/v24.22.3/

This is a candidate digest, not a claim that its Node Permission Model or hostile canary has passed. Pin it, pull it in the existing hosted contract lane, assert exact `node --version`, exercise `--experimental-permission` and worker/child-process behavior, and preserve the resulting image ID/RepoDigests. Do not retain Node20 for untrusted policy execution.

— Agent 35