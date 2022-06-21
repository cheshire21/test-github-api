import { Body, Controller, Req, Post, UseGuards } from '@nestjs/common';
import { GithubWebhookGuard } from './github/github-webhook.guard';
import { GithubService } from './github/github.service';

@Controller()
export class AppController {
  constructor(private readonly githubService: GithubService) {}

  @Post('/webhooks/github')
  @UseGuards(GithubWebhookGuard)
  async(@Req() req: any) {
    const headers = req.headers;
    const body = req.body;
    console.log('HEADERS: ', headers);
    console.log('BODY: ', body);
    if (headers['x-github-event'] === 'push') {
      console.log(body.head_commit.message);

      if (body.head_commit.message.toString().includes('challenge finished')) {
        this.githubService.removeUserFromRepository(
          body.repository.name,
          body.pusher.name,
        );
      }
    }
    return body;
  }

  @Post('/create-repository')
  async createRepository(
    @Body() { repo, username }: any,
  ): Promise<{ status: number; message: string }> {
    await this.githubService.createRepository(repo);
    await this.githubService.createReadme(repo);

    await this.githubService.inviteUSerToSpecificRepository(repo, username);
    await this.githubService.createWebhook(repo, ['push', 'pull_request']);

    return { status: 200, message: 'Repository & readme created' };
  }
}
