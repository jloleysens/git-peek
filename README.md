## Introduction

Apply a remote diff to your current branch without changing branches. In certain scenarios this can
save:

- Downloading a branch ref and checking it out
- Restarting a large project
- Losing your current work

The idea behind this CLI is that in a large number of cases those steps are unnecssary. All you you want to do is take a look at someone else's proposed code changes that are isolated to specific corner of a codebase -- which leads to the next section:

## When to use it

* You have access to a git-diff available over the Internet.
* You need to test or review the changes that git-diff introduces.
* The diff you need to review does not depend on different APIs or dependencies from the branch you are on.
* Your current project is big and probably takes a long time to restart/rebuild.

If the above is true, this CLI can save you time!

## How to use it

See the help text in <a href="./source/main.ts">here</a>.

## What does it do?

Essentially, by executing the following sequence of steps:

1. `git stash`ing any changes you currently have
2. Pulling down the diff from some URI (you provide the URI)
3. `git apply`ing your changes to your current repo

In a nutshell `curl -L https://mygitremote.none/some-diff | git apply` with some fanciness. Who doesn't like some fanciness?

Then when you are done, it will:

1. Clean your working tree... This can be destructive!
2. Checkout any modified files back to HEAD
3. Unstash any changes it stashed


## Disclaimer

This tool is intended as a minor set of steps I found myself doing quite often. It doesn't work well for a number of cases. Like if you have to reinstall dependencies for your changes to be tested, for instance. This tool assumes your branch is in a relatively similar state to that of the changes you would like test.
