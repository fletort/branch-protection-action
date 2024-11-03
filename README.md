# branch-protection-action

Action used to create branches and optional associated protection.

[![GitHub Super-Linter](https://github.com/actions/javascript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/javascript-action/actions/workflows/ci.yml/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/fletort/branch-protection-action/badge.svg?branch=main)](https://coveralls.io/github/fletort/branch-protection-action?branch=main)
[![Testspace tests count](https://img.shields.io/testspace/total/fletort/fletort%3Ajinja2-template-action/main)](https://fletort.testspace.com/projects/68237/spaces)

## Behaviour

- Create the specified branch if not existing.
- If requested, permission can be added on some branches. Theses permission can
  be defined in JSON or YAML format and can be describe in a local/remote file,
  or directly in the input.

## Usage

The following example works on the GitHub repository `the_owner/the_repo_name`.
It defined 3 branches `develop`, `feature` and `toto` that will be added if not
already existing:

- `develop` and `feature` branch are created from the `main` branch.
- `toto` branch is created from the specified `anotherBranch` branch.
- `permission` defined for the `feature` branch will be applied.

The definition is wrote directly in the action inputs.

```yaml
- uses: fletort/branch-protection-action@v1
  with:
    repository: the_owner/the_repo_name
    token: ${{ secrets.token }}
    branches: |
      develop:
      feature:
        permission:
          required_status_checks:
          enforce_admins: true
          required_pull_request_reviews: {
            "required_approving_review_count": 0
          }
          restrictions:  
      toto:
        baseBranch: anotherBranch
```

Note: to invoke the action you can also pin to a
[specific release](https://github.com/fletort/branch-protection-action/releases)
version in the format `@v1.x.x` or `@v1.x`.

### Action inputs

| Name                | Description                                                                                                                                                               | Default      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| repository          | Repository to create and/or init. Indicate the repository name with owner.                                                                                                | **Required** |
| branches            | JSON or YAML branches description. The definition can be directly done, through a local file or a distant one (web link). [See description below](#branches-description). | **Required** |
| token               | Token with the Content and Repository Administation write permission. [See below](#token)                                                                                 | **Required** |
| default_base_branch | The branch used by default to create new branch listed by `branches` input. Can be ovveriden by the `branches` description.                                               | `main`       |

#### token

The token must have the following permissions:

- 'Repository Contents / Write': to be able to create new branch on the
  `repository`.
- 'Repository Administration / Write': to be able to update permission on
  branches

#### branches description

##### Format

Branches definition can be wrote in JSON or YAML format. It is a list of branch
(key is the name of the branch) that containes following optional information :

| Clé        | Contenu                                                                                                                                                                                                                                | Default                                                             |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| baseBranch | Name of a base branch. If the branch is created, it will be derived from this branch.                                                                                                                                                  | If not defined the action input `default_base_branch` value is used |
| permission | It contains the dictionarry that define the branch protection to apply. See the body of the [Update Branch protection API](https://docs.github.com/en/rest/branches/branch-protection?apiVersion=2022-11-28#update-branch-protection). | If not specified, the branch will not be protected                  |

- JSON

```json
{
  "branch_name" : {
    "baseBranch": "optionalBaseBranch",
    "permission": {...}
  },
  "another_branch_name": {
    ...
  }
}
```

- YAML

```yaml
branch_name:
  baseBranch: optionalBaseBranch
  permission:
    required_status_checks:
    enforce_admins: true
    ...
another_branch_name:
  ...
```

##### Input

The input can be directly the data as show in the exemple upper, a local file,
or a remote file:

- local file: The file must be inside the repository calling the action and can
  be a YAML or json file.

```yaml
- uses: fletort/branch-protection-action@v1
  with:
    repository: the_owner/the_repo_name
    token: ${{ secrets.token }}
    branches: ./my_local_definition.json
```

- remote file: The file must available on a public web link.

For example we can use the file available on anoter repository:

```yaml
- uses: fletort/branch-protection-action@v1
  with:
    repository: the_owner/the_repo_name
    token: ${{ secrets.token }}
    branches: https://raw.githubusercontent.com/owner/anoter-repo/refs/heads/main/branch-perm.yml
```

## Code Quality

All unit/functional test executed on each branch/PR are listed/described on
[this testspace space](https://fletort.testspace.com/projects/68237/spaces).

Unit Test Coverage Information is available on
[coverage](https://coveralls.io/github/fletort/branch-protection-action?branch=main)
