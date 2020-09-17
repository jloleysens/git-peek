#! /usr/bin/env node

import * as uuid from 'uuid';
import axios from 'axios';
import * as chalk from 'chalk';
import {prompt} from 'inquirer';

import * as git from './git';
import {createGitPeek, gitPeekExists, readGitPeek, removeGitPeek} from './fs';

const helpText = `git-peek
usage:
  peek [diff-url] - check out a remote diff
  done - complete checking out a remote diff
`;

type Command = 'peek' | 'done';
const commands: Command[] = ['peek', 'done'];

async function main([cmd, diffUrl]: [
  cmd: Command,
  diffUrl: string,
  ...rest: string[]
]) {
  if (!cmd || !commands.includes(cmd) || (cmd === 'peek' && !diffUrl)) {
    console.log(helpText);
    return;
  }

  if (cmd === 'peek') {
    if (gitPeekExists()) {
      throw new Error('First finish this peek by running the "done" command');
    }

    const {data: diff} = await axios.get<NodeJS.ReadableStream>(diffUrl, {
      responseType: 'stream',
    });

    try {
      const myId = uuid.v4();
      createGitPeek(myId);
      await git.stash(myId);
      await git.apply(diff);

      console.log(
        `${chalk.green('OK')}, I applied the changes from ${chalk.bold(
          diffUrl
        )} and ${chalk.bold('stashed')} your work.`
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
      )}. Continue?`,
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

main(process.argv.slice(2) as [one: Command, two: string]);

process.on('unhandledRejection', (e: {message?: string}) => {
  console.error(e);
  process.exit(1);
});
