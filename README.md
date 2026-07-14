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

### active-input-handler

Active Input Handler setting for the Unity project.

- 0: "Input Manager (Old)" (default)
- 1: "Input System Package (New)"
- 2: "Both"

### scripting-backend

Scripting Backend setting for the Unity project.

- 0: "Mono" (default)
- 1: "IL2CPP"

### il2cpp-code-generation

IL2CPP Code Generation setting for the Unity project.

- 0: "Optimize for runtime speed" (default)
- 1: "Optimize for code size and build time"

### managed-stripping-level

Managed Stripping Level setting for the Unity project.

- 0: "Disabled" (Mono default)
- 4: "Minimal" (IL2CPP default)
- 1: "Low"
- 2: "Medium"
- 3: "High"


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
    permissions:
      contents: read

    steps:
      - name: Create project for run tests
        uses: nowsprinting/create-unity-project-action@v4
        with:
          project-path: .
          active-input-handler: 2
          scripting-backend: 1
          il2cpp-code-generation: 1
          managed-stripping-level: 3

      - name: Checkout repository as embedded package
        uses: actions/checkout@v7
        with:
          path: ${{ env.CREATED_PROJECT_PATH }}/Packages/your-package-name

      - name: Copy Samples
        run: |
          mv ${{ env.CREATED_PROJECT_PATH }}/Packages/your-package-name/Samples~ ${{ env.CREATED_PROJECT_PATH }}/Assets/Samples

      - name: Install dependencies
        run: |
          npm install -g openupm-cli
          openupm add -f com.unity.test-framework@stable
          openupm add -f com.unity.testtools.codecoverage@latest
        working-directory: ${{ env.CREATED_PROJECT_PATH }}

      - name: Run tests
        uses: game-ci/unity-test-runner@v4
        with:
          projectPath: ${{ env.CREATED_PROJECT_PATH }}
          unityVersion: 6000.3.19f1
```

Resulting project structure:

```shell
<root>
├── Assets/
│   └── Samples/
│     └── your-packages-sample/
├── Packages/
│   └── your-package-name/
└── ProjectSettings/
```

> [!NOTE]\
> [openupm](https://github.com/openupm/openupm-cli) command is used to update Packages/manifest.json.
> `@file:../../` is relative path from Packages directory to repository root (as a package root).
> And `-t` option is add package into `testables`.

> [!NOTE]\
> Unity ignores the contents of any folder name that ends with the ~ character and does not track them with .meta files.
> See more information: [Unity - Manual:  Package layout](https://docs.unity3d.com/Manual/cus-layout.html)


## License

MIT License


## How to contribute

Open an issue or create a pull request.

### Start developing

```shell
npm install
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
