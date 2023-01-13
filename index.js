#!/usr/bin/env node

import ms from 'ms'
import meow from 'meow'
import { Octokit } from 'octokit'
import { createInterface } from 'node:readline/promises'

const compareTypes = new Set(['updatedAt', 'pushedAt', 'createdAt'])
const repositoryTypes = new Set(['public', 'private', 'fork'])

const cli = meow(
  `
  Usage:
    $ gh-archiver --before="2 years" --compare=createdAt --compare=pushedAt
    $ gh-archiver --after="7 days" --type=public --type=private
    $ gh-archiver --before="1 year" --after="4 days" --token="hogehoge_fugafuga"

  Options:
    --after -a <ms syntax>\tTarget repositories newer than the specified date.
    --before -b <ms syntax>\tTarget repositories older than the specified date.
    --token -t <string>\tPersonal access token (default: process.env.GITHUB_TOKEN)
    --compare -c <${[...compareTypes].join(
      '|'
    )}>\tType of date to compare (default: updatedAt) (Multiple)
    --type <${[...repositoryTypes].join(
      '|'
    )}>\tThe type of repository. (default: public) (Multiple)

    <ms syntax> documentation: https://github.com/vercel/ms#readme
`,
  {
    importMeta: import.meta,
    flags: {
      after: {
        alias: 'a',
        type: 'string',
        isRequired: (flags) => !('before' in flags),
      },
      before: {
        alias: 'b',
        type: 'string',
        isRequired: (flags) => !('after' in flags),
      },
      token: {
        type: 'string',
        isRequired: () => !('GITHUB_TOKEN' in process.env),
      },
      type: {
        type: 'string',
        default: ['public'],
        isMultiple: true,
      },
      compare: {
        type: 'string',
        alias: 'c',
        default: ['updatedAt'],
        isMultiple: true,
      },
    },
  }
)

const token = cli.flags.token || process.env.GITHUB_TOKEN
const type = new Set(cli.flags.type)
const compare = new Set(cli.flags.compare)
const before = cli.flags.before
  ? new Date(Date.now() - ms(cli.flags.before))
  : void 0
const after = cli.flags.after
  ? new Date(Date.now() - ms(cli.flags.after))
  : void 0

try {
  const correctRepositoryTypes = [...type].every((it) =>
    repositoryTypes.has(it)
  )
  const correctCompareTypes = [...compare].every((it) => compareTypes.has(it))

  if (!before && !after)
    throw 'Must use either the "--before" or "--after" flag.'
  if (!correctRepositoryTypes)
    throw `The value passed to "--type" must be ${[...repositoryTypes]
      .map((it) => `"${it}"`)
      .join(', ')}.`
  if (!correctCompareTypes)
    throw `The value passed to "--compare" must be ${[...compareTypes]
      .map((it) => `"${it}"`)
      .join(', ')}.`
  if (!token) throw 'Please pass a personal access token using "--token".'
} catch (error) {
  console.error(error)
  process.exit(1)
}

const octkit = new Octokit({ auth: token })
const { data: user } = await octkit.rest.users.getAuthenticated()
const targetRepositories = []
const repositories = octkit.paginate.iterator(octkit.rest.repos.listForUser, {
  username: user.login,
})
const inRange = (date) => {
  if (after && before) return date < before || date > after
  else if (after) return date > after
  else if (before) return date < before
  else throw new TypeError()
}

console.log('Repository Types', [...type].join(', '))
console.log('Compare to', [...compare].join(', '))

for await (const response of repositories) {
  for (const repository of response.data) {
    if (repository.disabled || repository.archived) continue
    if (type.has('public') && repository.private) continue
    if (type.has('private') && !repository.private) continue
    if (type.has('fork') && !repository.fork) continue
    if (
      compare.has('createdAt') &&
      repository.created_at &&
      !inRange(Date.parse(repository.created_at))
    )
      continue
    else if (
      compare.has('updatedAt') &&
      repository.updated_at &&
      !inRange(Date.parse(repository.updated_at))
    )
      continue
    else if (
      compare.has('pushedAt') &&
      repository.pushed_at &&
      !inRange(Date.parse(repository.pushed_at))
    )
      continue

    console.log(`Found ${repository.full_name}`)
    targetRepositories.push(repository)
  }
}

if (!targetRepositories.length) {
  console.log('No target repositories :)')
  process.exit(0)
}

const readline = createInterface(process.stdin, process.stdout)
const archivable =
  (
    await readline.question(
      `Archive ${targetRepositories.length} repositories? (yes/no) `
    )
  ).toLowerCase()[0] === 'y'

readline.close()

if (archivable) {
  const responses = await Promise.allSettled(
    targetRepositories.map(({ name }) =>
      octkit.rest.repos.update({
        owner: user.login,
        repo: name,
        archived: true,
      })
    )
  )

  for (const response of responses) {
    if (response.status === 'rejected') console.error(response.reason)
  }
} else console.log('Cancel archiving')
