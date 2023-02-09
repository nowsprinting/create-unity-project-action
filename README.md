# create-unity-project-action

[![build-test](https://github.com/nowsprinting/create-unity-project-action/actions/workflows/test.yml/badge.svg)](https://github.com/nowsprinting/create-unity-project-action/actions/workflows/test.yml)


Create an empty Unity3D project for running tests.
It is useful for testing UPM package.

This action does not require a Unity license.
Because this copies the Unity 2018.1.0f1 [^1] project template.

[^1]: This version started UPM support


## Inputs

### project-path

Path of the Unity project to be created, relative from repository root (/github/workspace).
Default value is `UnityProject~`.


## Outputs

### created-project-path

Path of the created Unity project, relative from repository root (/github/workspace).
Same as `project-path`.


## Exported environment variables

### CREATED\_PROJECT\_PATH

Path of the created Unity project, relative from repository root (/github/workspace).
Same as `project-path`.


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

      - name: Crete Unity project for tests
        uses: nowsprinting/create-unity-project-action@v2
        with:
          project-path: UnityProject~

      - name: Install dependencies
        run: |
          npm install -g openupm-cli
          openupm add -f com.unity.test-framework@1.3.2
          openupm add -f com.unity.testtools.codecoverage@1.2.2
          openupm add -ft your.package.name@file:../../
        working-directory: ${{ env.CREATED_PROJECT_PATH }}

      - name: Move samples to include in run tests (optional)
        run: |
          cp -r Samples~/SampleFolder1 ${{ env.CREATED_PROJECT_PATH }}/Assets/

      - name: Run tests
        uses: game-ci/unity-test-runner@v2
        with:
          projectPath: ${{ env.created-project-path }}
          unityVersion: 2021.3.17f1
```

> **Note**  
> [openupm](https://github.com/openupm/openupm-cli) command is used to update Packages/manifest.json.
> `@file:../../` is relative path from Packages directory to repository root (as a package root).
> And `-t` option is add package into `testables`.

Before

```shell
<root>
├── EDITOR/
├── Runtime/
├── Tests/
├── LICENSE.md
├── README.md
└── package.json
```

After

```shell
<root>
├── EDITOR/
├── Runtime/
├── Tests/
├── UnityProject~/
│   ├── Assets/
│   ├── Library/
│   ├── Logs/
│   ├── Packages/
│   ├── ProjectSettings/
│   └── UnityProject~.sln
├── LICENSE.md
├── README.md
└── package.json
```

> **Note**  
> Unity ignores the contents of any folder name that ends with the ~ character and does not track them with .meta files.  
> See more information: [Unity - Manual:  Package layout](https://docs.unity3d.com/Manual/cus-layout.html)


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
