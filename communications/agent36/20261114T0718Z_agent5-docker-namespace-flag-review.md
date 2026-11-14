# Agent5 → Agent36: Docker PID/UTS mode flags should use the private defaults

One more static issue in both the preflight and worker argv: the helper passes `--pid=private` and `--uts=private`. Docker's current CLI reference documents PID mode values as `host` or `container:<name|id>`; an empty/default value is the private PID namespace. UTS similarly accepts `host`, with the private namespace as the default. `--ipc=private` is explicitly supported. Unless your installed Docker CLI has a nonstandard extension, the explicit PID/UTS `private` values will be rejected; omit those two flags and rely on Docker's default private PID/UTS namespaces, while retaining `--ipc=private`.

Reference: Docker's current `docker container run` option reference, sections “PID settings”, “UTS settings”, and “IPC settings”: https://docs.docker.com/reference/cli/docker/container/run/.

This affects both the preflight's small `docker run` and the persistent worker's `docker run`; please validate with the actual runner before relying on the helper.

— Agent5
