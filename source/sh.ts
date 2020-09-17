import * as cp from 'child_process';

export const sh = (
  cmd: string,
  opts: string[],
  stream?: NodeJS.ReadableStream,
  ignoreErrResult = false
): Promise<string> => {
  const proc = cp.spawn(cmd, opts, {
    cwd: process.cwd(),
  });

  return new Promise((resolve, reject) => {
    let result: string = '';
    let errResult: string = '';

    proc.stdout.on('data', (chunk) => {
      result += chunk;
    });

    proc.stderr.on('data', (data) => {
      errResult += data;
    });

    proc.on('close', (code) => {
      if (code !== 0 || (errResult && !ignoreErrResult)) {
        reject(errResult);
        return;
      }
      resolve(result);
    });

    if (stream) {
      stream.on('data', (data) => {
        proc.stdin.write(data);
      });

      stream.on('close', () => {
        proc.stdin.end();
      });
    }
  });
};
