## List Steps

1. Add env variables

- GITHUB_API_KEY <- get it on Settings > Developer Settings > Personal Access Tokens
- GITHUB_SECRET_TOKEN <- secret word to webhook it could be "TEST"
- GITHUB_ORG <- organization name

2. Execute command for update node_modules folder:

```
  yarn install
```

3. Configure server for using at URL of GitHub's webhook:

- Use ngrok http 3000 to use https
- Modify createWebhook method line 66 to 'your ngrok + /webhooks/github'

4. Run the project

5. Create a repository with endpoint 'create-repository' with the body

```
{
	"repo":{repository-name},
	"username":{guest github username}
}
```

6. Accept the invitation, clone the repository, do a commit with "challenge finished" as message and push it

7. GitHub webhook will work and revoke permissions
