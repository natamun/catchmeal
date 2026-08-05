# Contributing

## Branches

`main` is the stable branch, never push directly to it.

Naming: `feat/name`, `fix/name`, `ci/name`, `refactor/name`

## Commits

Format: `type: short description in English`

| Type        | When                                     |
| ----------- | ---------------------------------------- |
| `feat:`     | new feature                              |
| `fix:`      | bug fix                                  |
| `ci:`       | pipeline, GitHub Actions                 |
| `refactor:` | reorganization without changing behavior |
| `docs:`     | README, comments                         |
| `test:`     | test scripts                             |
| `chore:`    | Makefile, .gitignore, config             |

Examples:

```
feat: add user authentication
fix: handle null pointer on early exit
refactor: extract parsing logic into separate class
docs: update README with installation steps
```

## Pull Requests

- One PR = one single feature or fix
- The pipeline must be green before merging
- Codeowners must approve before merging
