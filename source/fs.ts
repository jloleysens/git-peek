import * as fs from 'fs';

export const STORE_FILE = '.git-peek';

export const gitPeekExists = () => fs.existsSync(STORE_FILE);

export const createGitPeek = (contents: string) =>
  fs.writeFileSync(STORE_FILE, contents);

export const removeGitPeek = () => fs.unlinkSync(STORE_FILE);

export const readGitPeek = (): string =>
  fs.readFileSync(STORE_FILE).toString('utf-8').trim();
