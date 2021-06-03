#! /usr/bin/env node

import {URL} from 'url';
import * as uuid from 'uuid';
import axios from 'axios';
import * as chalk from 'chalk';
import {prompt} from 'inquirer';

import * as git from './git';
import {createGitPeek, gitPeekExists, readGitPeek, removeGitPeek} from './fs';

const helpText = `git-peek
usage:
  - Pipe valid git diff to git-peek using stdin, for example: "cat mydiff.diff | git-peek"
  - [diff-url] - check out a remote diff. On github you can see the diff for a PR by adding ".diff" to the PR url.
  - done - complete checking out a remote diff
`;

type URLString = string;
type Input = 'done' | URLString;

const isValidUrl = (url: string) => {
  try {
    return Boolean(new URL(url));
  } catch (e) {
    return false;
  }
};

async function main([diffUrlOrCmd]: [diffUrlOrCmd: Input, ...rest: unknown[]]) {
  const isPipingInput = !process.stdin.isTTY;

  const isHelpCmd =
    diffUrlOrCmd === '--help' ||
    diffUrlOrCmd === 'help' ||
    diffUrlOrCmd === '-h';

  if (isHelpCmd) {
    console.log(helpText);
    return;
  }
  const isDoneCmd = diffUrlOrCmd === 'done';
  const isPeekCmd = Boolean(!isDoneCmd && (diffUrlOrCmd || isPipingInput));

  if (!(isDoneCmd || isPeekCmd)) {
    console.log(helpText);
    return;
  }

  if (isPeekCmd) {
    if (gitPeekExists()) {
      throw new Error('First finish this peek by running the "done" command');
    }

    let diff: NodeJS.ReadableStream;
    if (isPipingInput) {
      diff = process.stdin;
    } else {
      const diffUrl = diffUrlOrCmd;
      if (!isValidUrl(diffUrl)) {
        console.log(`${chalk.red('Invalid URL:')} "${diffUrl}"`);
        return;
      }
      ({data: diff} = await axios.get<NodeJS.ReadableStream>(diffUrl, {
        responseType: 'stream',
      }));
    }

    try {
      const myId = uuid.v4();
      createGitPeek(myId);
      await git.stash(myId);
      await git.apply(diff);

      console.log(
        `${chalk.green('OK')}, I ${chalk.bold(
          chalk.blue('stashed')
        )} your work and applied the diff.`
      );
    } catch (e) {
      console.error(e);
      try {
        await git.popIndex(0);
      } catch (e) {
        // Ignore
      }
      if (gitPeekExists()) {
        removeGitPeek();
      }
      process.exit(1);
    }
  } else {
    if (!gitPeekExists()) {
      throw new Error('Not peeking at the moment!');
    }
    const {doContinue} = await prompt({
      type: 'confirm',
      name: 'doContinue',
      message: `The current peek along with any other changes you may have made will be ${chalk.yellow(
        'reverted'
      )} and then I will ${chalk.blue('pop')} any changes ${chalk.blue(
        'stashed'
      )} at the start of the peek. Continue?`,
    });
    if (!doContinue) {
      return;
    }
    await git.checkout();
    await git.clean();
    const myId = readGitPeek();
    await git.popId(myId);
    removeGitPeek();
    console.log(`${chalk.green('OK')}, you should be back where you were.`);
  }
}

main(process.argv.slice(2) as [one: Input]);

process.on('unhandledRejection', (e: {message?: string}) => {
  console.error(e);
  process.exit(1);
});
