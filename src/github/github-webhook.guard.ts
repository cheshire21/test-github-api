import * as crypto from 'crypto';
import { Buffer } from 'buffer';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class GithubWebhookGuard implements CanActivate {
  getSignature(Body: object): string {
    const hmac = crypto.createHmac('sha1', process.env.GITHUB_SECRET_TOKEN);

    const signatureBaseString = JSON.stringify(Body);
    const mySignature =
      'sha1=' + hmac.update(signatureBaseString, 'utf8').digest('hex');
    return mySignature;
  }

  canActivate(context: ExecutionContext): boolean {
    const { headers, body } = context.switchToHttp().getRequest();

    console.log('crypto ' + crypto);

    if (headers['x-github-event'] !== 'push') {
      return false;
    }

    const githubSignature = headers['x-hub-signature'];

    return crypto.timingSafeEqual(
      Buffer.from(this.getSignature(body), 'utf8'),
      Buffer.from(githubSignature, 'utf8'),
    );
  }
}
