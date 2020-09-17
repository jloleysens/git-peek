## Introduction

Do you work on really large JS code projects that take a long time to build and start up?

Do you do a lot of code review in large code bases while also developing in these codebases?

Are you tired of pulling down branches your colleagues created?

If you answered "ZOMFG yESd!" to the above this repo contains code that you might be interested in.

## What is this?

This is a little command line interface for `git apply`ing git diffs to your local repository. I call it `git-peek`.

## How does it work?

See the help text!

## What does it do?

Essentially, by executing the following sequence of steps:

1. `git stash`ing any changes you currently have
2. Pulling down the diff from some URI (you provide the URI)
3. `git apply`ing your changes to your current repo

In a nutshell `curl -L https://mygitremote.none/some-diff | git apply` with some fanciness. Who doesn't like some fanciness?

Oh, did I mention this uses `git`? Yeah, it won't work without `git`.

Once you are done peeking (you peeker you!) and you want to get back to where you were simply tell `git-keep` you are done and it will drop you right back where you were by popping your changes from the stash (noice!).

## Disclaimer

This tool is intended as a minor set of steps I found myself doing quite often. It doesn't work well for a number of cases. Like if you have to reinstall dependencies for your changes to be tested, for instance. This tool assumes your branch is in a relatively similar state to that of the changes you would like test.
