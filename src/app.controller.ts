import { Body, Controller, Req, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GithubWebhookGuard } from './github/github-webhook.guard';
import { GithubService } from './github/github.service';

@Controller()
export class AppController {
  constructor(
    private readonly githubService: GithubService,
    private readonly configService: ConfigService,
  ) {}

  @Post('/webhooks/github')
  @UseGuards(GithubWebhookGuard)
  async(@Req() req: any) {
    const headers = req.headers;
    const body = req.body;
    const message: string = body.head_commit.message;
    console.log('HEADERS: ', headers);
    console.log('BODY: ', body);
    if (headers['x-github-event'] === 'push') {
      console.log(body.head_commit.message);

      if (
        message.toLowerCase() ===
        this.configService
          .get('COMMIT_FINISH_CHALLENGE')
          .toString()
          .toLowerCase()
          .trim()
      ) {
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
    await this.githubService.createReadme(
      repo,
      'https://ravndevelopment.notion.site/Ravn-iOS-Code-Challenge-d5302aa3791140dbae96cad236d8e5f5',
    );

    await this.githubService.inviteUSerToSpecificRepository(repo, username);
    await this.githubService.createWebhook(repo, ['push', 'pull_request']);

    return { status: 200, message: 'Repository & readme created' };
  }

  @Post('/search')
  async search(@Body('email') email: string) {
    return await this.githubService.searchUser(email);
  }
}
