import { Injectable, Logger } from '@nestjs/common';
import { Octokit } from '@octokit/rest';

@Injectable()
export class GithubService {
  private readonly githubClient: Octokit;
  private readonly githubOrg: string;

  constructor() {
    console.log(process.env.GITHUB_ORG);
    console.log(process.env.GITHUB_API_KEY);
    this.githubOrg = process.env.GITHUB_ORG;
    this.githubClient = new Octokit({
      auth: process.env.GITHUB_API_KEY,
    });
  }

  async createRepository(name: string): Promise<void> {
    await this.githubClient.request(`POST /orgs/${this.githubOrg}/repos`, {
      org: 'ORG',
      name,
      description: 'This is your first repository',
      homepage: 'https://github.com',
      private: true,
      has_issues: true,
      has_projects: true,
      has_wiki: true,
    });
  }

  async createReadme(repo: string, link: string): Promise<void> {
    const textReadme =
      '# Challenge\nFollow the instruction on the next link: \n ```\n' +
      link +
      '\n```';

    await this.githubClient.request(
      `PUT /repos/${this.githubOrg}/${repo}/contents/README.md`,
      {
        owner: this.githubOrg,
        repo,
        path: 'README.md',
        message: 'README.md',
        content: Buffer.from(textReadme).toString('base64'),
      },
    );
  }

  async inviteUSerToSpecificRepository(repo: string, username: string) {
    await this.githubClient.request(
      `PUT /repos/${this.githubOrg}/${repo}/collaborators/${username}`,
      {
        owner: this.githubOrg,
        repo,
        username: username,
        permission: 'push',
      },
    );
  }

  async createWebhook(repo: string, events: string[]) {
    await this.githubClient.request(
      `POST /repos/${this.githubOrg}/${repo}/hooks`,
      {
        owner: this.githubOrg,
        repo,
        name: 'web',
        active: true,
        events,
        config: {
          url: 'https://7e0f-179-6-164-65.ngrok.io/webhooks/github',
          content_type: 'json',
          insecure_ssl: '0',
          secret: process.env.GITHUB_SECRET_TOKEN,
        },
      },
    );
  }

  async removeUserFromRepository(repo: string, username: string) {
    console.log(`removing user ${username} from ${repo}`);
    await this.githubClient.request(
      `DELETE /repos/${this.githubOrg}/${repo}/collaborators/${username}`,
      {
        owner: this.githubOrg,
        repo,
        username,
      },
    );
  }

  async searchUser(email: string) {
    const users = await this.githubClient.search.users({ q: email });
    return users;
  }
}
