# Contributing

## Branches

`main` is the stable branch. All changes land on it through a reviewed pull request.

Naming: `feat/name`, `fix/name`, `ci/name`, `refactor/name`, `docs/name`, `test/name`, `chore/name`

Before opening a PR, and again if `main` moves while your PR is still open, rebase your branch onto `main` (not a merge commit) so conflicts are resolved locally without adding extra "merge main" commits to the history.

## Issues

Large features get one umbrella issue, broken down into smaller sub-issues. Each sub-issue should be small enough to ship as its own PR: this is how we push code incrementally instead of one large batch at the end.

## Commits

Format: `type: short description in English`

| Type        | When                                      |
| ----------- | ------------------------------------------|
| `feat:`     | new feature                               |
| `fix:`      | bug fix                                   |
| `ci:`       | pipeline, GitHub Actions                  |
| `refactor:` | reorganization without changing behavior  |
| `docs:`     | README, comments                          |
| `test:`     | test scripts                              |
| `chore:`    | Makefile, .gitignore, config              |

Examples:

```
feat: add user authentication
fix: handle null pointer on early exit
refactor: extract parsing logic into separate class
docs: update README with installation steps
```

Each commit should represent one complete, logical change, not more, not less. If a change touches several independent pieces (e.g. multiple pages, or a feature plus unrelated config), split it into separate commits, one per piece.

## Pull Requests

- One PR = one sub-issue = one feature or fix. Keep unrelated infrastructure/config changes in their own PR. If a config change is a direct dependency of the feature you are shipping (e.g. a new environment variable or docker-compose service the feature needs to run), include it in the same PR.
- Splitting is not about maximizing the number of PRs either. A PR should map to one coherent, reviewable unit, not be broken down further than its natural size.
- The description includes a short summary and `Closes #<issue-number>`, so the linked issue closes automatically on merge.
- The CI pipeline must pass before merging. It currently checks formatting only; more checks (build, tests) will be added as the project grows.
- Codeowners must approve before merging.
- PRs are merged with "Create a merge commit" (not squash), so every individual commit and its real author stay visible on `main` for the whole team's contribution history.
