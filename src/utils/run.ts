import child from 'child_process';
import sudo from 'sudo-prompt';

export interface ExecResponse {
  stdout?: string | Buffer;
  stderr?: string | Buffer;
}

export class ExecError extends Error {
  constructor(
    public error: Error,
    public stdout?: string | Buffer,
    public stderr?: string | Buffer,
  ) {
    super(error.message);
  }
}

export async function run(command: string, name: string, sudoPrompt = true) {
  return new Promise<ExecResponse>((resolve, reject) => {
    if (sudoPrompt) {
      sudo.exec(command, { name }, execCallback(resolve, reject));
    } else {
      child.exec(command, execCallback(resolve, reject));
    }
  });
}

const execCallback = (
  resolve: (value: ExecResponse | PromiseLike<ExecResponse>) => void,
  reject: (reason?: ExecError) => void,
) => {
  return (
    error?: Error | child.ExecException | null,
    stdout?: string | Buffer,
    stderr?: string | Buffer,
  ) => {
    if (!error) {
      resolve({ stdout, stderr });
    } else {
      reject(new ExecError(error, stdout, stderr));
    }
  };
};
