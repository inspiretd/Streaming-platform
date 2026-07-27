# Security incident: historical playlist exposure

## Scope

The repository is public. `playlist.m3u8` was present from the first commit `a6f07c245e710022ec05dc74c61a6e3f13748843` through its removal commit `208beffec925fb9c4f8d934be592621bfd8423b0`. The file is absent from the current branch, but remains in reachable history until a controlled rewrite is performed.

## Findings

- The playlist contained hundreds of third-party stream URLs.
- The URLs used HTTP and included a repeated credential-like path segment. The value is intentionally not reproduced here.
- No cookie header, query-string token, signed URL query parameter, account ID field, or access-code label was found in the reviewed content.
- Treat the repeated path segment as an exposed access credential: **rotation/revocation is a critical blocker** before any provider stream is enabled.
- No real provider stream may be used in production or public preview until rotation is confirmed.
- The playlist also referenced third-party EPG/logo URLs and content that was not rights-confirmed, so it is not eligible for demo seed or public catalog import.

## Status

- Exposed secret type: credential-like provider access path, exact value withheld.
- Repository state: public.
- Rotation status: not confirmed, provider-side revoke/rotate required.
- History cleanup status: not completed. Current integration cannot safely force-push a rewritten `main` history.
- Remaining risk: old clones, forks, caches, and the original commit retain the exposed value until provider rotation and coordinated history rewrite.

## GitHub scanning

GitHub Advanced Security secret scanning is unavailable for this repository. A manual repository/history audit found the credential-like path pattern above without reproducing it in logs or documentation. No automated clean verdict is claimed.

## History cleanup

On a controlled maintenance clone, after provider rotation:

```bash
git clone --mirror https://github.com/inspiretd/Streaming-platform.git
cd Streaming-platform.git
git filter-repo --path playlist.m3u8 --invert-paths
git push --force --mirror origin
```

This changes all rewritten commit SHAs. Every collaborator must discard old clones and make a fresh clone. Do not silently run this against `main` from an integration that cannot verify force-push safety.

## Preventive controls

Private playlists are ignored by `*.m3u`, `*.m3u8`, `/private-playlists/`, and `/imports/private/`. The application must keep provider URLs and credentials server-side and must never return them to the browser or log them.
