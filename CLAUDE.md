# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A GitHub Action (TypeScript, compiled/bundled to `dist/index.js`) that creates an empty Unity3D project by copying a
committed project template. It's used to give UPM packages a throwaway Unity project to run tests against, without
requiring a Unity license — the template is a copy of the Unity 2018.1.0f1 project structure (the first version with
UPM support).

## Commands

```shell
npm install          # install dependencies
npm test             # run jest tests (__tests__/*.test.ts)
npm run build        # tsc: src/*.ts -> lib/*.js
npm run format       # prettier --write on **/*.ts
npm run format-check # prettier --check on **/*.ts
npm run lint         # eslint on src/**/*.ts
npm run package      # ncc build: bundles lib/main.js -> dist/index.js (+ source map, licenses.txt)
npm run all          # build + format + lint + package + test — run this before every commit
```

Run a single test file with `npx jest __tests__/main.test.ts`, or a single test case with
`npx jest -t "test copy project files"`.

## Architecture

- `src/main.ts` is the entire action logic. `dist/index.js` is the ncc-bundled artifact actually executed by
  GitHub Actions (per `action.yml`'s `runs.main`) — it is generated from `src/` via `npm run package` and **must be
  committed**. CI (`.github/workflows/check-dist.yml`) rebuilds `dist/` and fails the build if it differs from what's
  checked in, so any change to `src/main.ts` requires re-running `npm run all` (or at least `build` + `package`) and
  committing the resulting `dist/` diff.
- `dist/UnityProject~/` is **not a build artifact** — it's the hand-maintained Unity project template that gets
  copied to create the new project. It contains a minimal `ProjectSettings/`, `Packages/manifest.json`, and
  `Assets/`. Changes to Unity project settings (e.g. scripting backend, IL2CPP config) are made by hand-editing the
  `.asset`/`.json` files here directly — there is no Unity Editor involved in generating them.
- `src/main.ts`'s `run()` does three things: (1) copies `dist/UnityProject~` to the destination path
  (`project-path` input, resolved relative to `GITHUB_WORKSPACE`) — with special-cased handling when
  `project-path` is `.`/`./`, which copies the template's *contents* into the workspace root instead of copying the
  template folder itself; (2) appends an `activeInputHandler` line to the copied project's
  `ProjectSettings/ProjectSettings.asset` (this key doesn't exist in the template, so it's always appended rather
  than replaced); (3) sets the `created-project-path` output and `CREATED_PROJECT_PATH` env var.
- Tests (`__tests__/main.test.ts`) exercise `run()` end-to-end against a real `test/` directory (not mocked),
  driving inputs via `process.env['INPUT_*']` and asserting on the filesystem output. Each test wipes/recreates the
  `test/` dir in `beforeEach`.
- `action.yml` defines the two inputs (`project-path`, `active-input-handler`) and the one output
  (`created-project-path`) — keep it in sync with `src/main.ts` and `README.md` when changing the action's
  interface.

## Release process

Releases are version-bump-driven, not tag-driven: bumping `version` in `package.json` on `main` (e.g. via
`Actions | Create release pull request | Run workflow`, which opens a PR) triggers `.github/workflows/release.yml`
to draft and publish the release automatically, and force-push the corresponding major (`vN`) and `latest` branches.
Do not manually create release tags or publish draft releases.
