import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

@Injectable()
export class DirectoryService {
  async validateCredentials(username: string, password: string): Promise<void> {
    if (!username || !password) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
  }

  async runSambaTool(args: string[]) {
    if (args.length === 0) {
      throw new BadRequestException('Argumentos do samba-tool são obrigatórios');
    }

    const { stdout, stderr } = await execFileAsync('samba-tool', args);
    return {
      stdout,
      stderr,
    };
  }
}
