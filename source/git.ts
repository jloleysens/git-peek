import {sh} from './sh';
import {STORE_FILE} from './fs';

const createGitError = (message: string) => {
  throw new Error(`Git told me:\n${message}`);
};

export const stash = (id: string) => sh('git', ['stash', `-m ${id}`]);

export const checkout = () => sh('git', ['checkout', '.'], null, true);

export const clean = () => sh('git', ['clean', '-fd', '--exclude', STORE_FILE]);

export const apply = (diff: NodeJS.ReadableStream) =>
  sh('git', ['apply'], diff).catch(createGitError);

export const popId = async (id: string) => {
  const response = await sh('git', ['stash', 'list']);
  const list = response.split('\n');
  const idx = list.findIndex((l) => l.includes(id)) ?? -1;
  if (idx > -1) {
    await popIndex(idx);
  }
};

export const popIndex = async (index: number) =>
  sh('git', ['stash', 'pop', String(index)]);
