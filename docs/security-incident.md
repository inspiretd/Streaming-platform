# Security incident: historical playlist exposure

## Scope

The removed `playlist.m3u8` existed in the initial repository commit and was deleted from the current branch. Git history still contains the original blob in the initial commit.

## Findings

- The playlist contained hundreds of third-party stream URLs.
- The URLs used HTTP and included a repeated credential-like path segment. The value is intentionally not reproduced here.
- No cookie header, query-string token, signed URL query parameter, account ID field, or access-code label was found in the reviewed content.
- Because the repeated path segment may function as an access credential, treat it as compromised and rotate or revoke it with the provider before any future authorized import.
- The playlist also referenced third-party EPG/logo URLs and content that was not rights-confirmed, so it is not eligible for demo seed or public catalog import.

## GitHub scanning

GitHub Advanced Security secret scanning was unavailable for this repository, so no GitHub secret-scanning verdict can be claimed. Manual review found the credential-like path segment described above.

## History cleanup

A history rewrite was not performed through the connected GitHub workspace because the available repository integration supports file commits but not a safe force-push rewrite. Do not silently rewrite `main` from this integration.

For a repository owner on a controlled clone, use a reviewed maintenance window:

```bash
git clone --mirror https://github.com/inspiretd/Streaming-platform.git
cd Streaming-platform.git
git filter-repo --path playlist.m3u8 --invert-paths
 git push --force --mirror origin
```

After the rewrite, all old commit SHAs change and every collaborator must discard old clones and make a fresh clone. Rotate/revoke the exposed provider credential before reopening imports.

## Preventive controls

Private playlists are ignored by `*.m3u`, `*.m3u8`, `/private-playlists/`, and `/imports/private/`. The application must keep provider URLs and credentials server-side and must never return them to the browser or log them.
