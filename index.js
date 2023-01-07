import { Octokit } from 'octokit'
import { config } from 'dotenv'

config()

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const duration = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365)
const octkit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})
const { data: user } = await octkit.rest.users.getAuthenticated()
const repositories = octkit.paginate.iterator(octkit.rest.repos.listForUser, {
  username: user.login,
})

if (dryRun)
  console.warn('No archiving because the "--dry-run" option is enabled.')

for await (const response of repositories) {
  for (const repository of response.data) {
    const updatedAt = new Date(repository.updated_at)

    if (
      repository.archived ||
      repository.disabled ||
      repository.fork ||
      repository.private
    )
      continue
    if (updatedAt > duration) continue

    console.log(`${repository.full_name} is inactive.`)

    if (!dryRun) {
      await octkit.rest.repos.update({
        owner: user.login,
        repo: repository.name,
        archived: true,
      })
      console.log(`${repository.full_name} is archived.`)
    }
  }
}
