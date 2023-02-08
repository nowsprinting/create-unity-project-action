# create-unity-project-action

[![build-test](https://github.com/nowsprinting/create-unity-project-action/actions/workflows/test.yml/badge.svg)](https://github.com/nowsprinting/create-unity-project-action/actions/workflows/test.yml)


Create empty Unity3D project for run tests.
It is useful to testing UPM package.

This action does not require a Unity license. Because we are copying the Unity 2019.4.0f1 project template.


## Inputs

### project_path

Path of the Unity project to be created, relative from /github/workspace.
Default value is `UnityProject~`.


## Outputs

### created_project_path

Path of the created Unity project, relative from /github/workspace.
Same as `project_path`.


## Exported environment variables

### created_project_path

Path of the created Unity project, relative from /github/workspace.
Same as `project_path`.


## Example usage

This example assumes that package.json is in the repository root, creation a new Unity project and runs the tests.

```yaml
on:
  push:

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Crete project for tests
        uses: nowsprinting/create-unity-project-action@master
        with:
          project_path: UnityProject~

      - name: Install dependencies
        run: |
          npm install -g openupm-cli
          openupm add com.unity.test-framework@1.3.2
          openupm add com.unity.testtools.codecoverage@1.2.2
          openupm add --test your.package.name@file:../../
        working-directory: ${{ env.created_project_path }}

      - name: Run tests
        uses: game-ci/unity-test-runner@v2
        with:
          projectPath: ${{ env.created_project_path }}
          unityVersion: 2021.3.17f1
```


## License

MIT License


## How to contribute

Open an issue or create a pull request.

### Start developing

```shell
npm ci
```

### Run tests

```shell
npm test
```

### Package (must run before checked-in)

```shell
npm run all
git add dist/
git commit -m"Update dist"
```

### Create pull request

Be grateful if you could label the PR as `enhancement`, `bug`, `chore` and `documentation`. See [PR Labeler settings](.github/pr-labeler.yml) for automatically labeling from the branch name.


## Release workflow

Run `Actions | Create release pull request | Run workflow` and merge created PR.
(Or bump version in package.json on default branch)

Then, Will do the release process automatically by [Release](.github/workflows/release.yml) workflow.

Enable `Publish this Action to the GitHub Marketplace` on edit release page, are publish to GitHub Marketplace.
(Need manual operation)

Do **NOT** manually operation the following operations:

- Create release tag
- Publish draft releases
