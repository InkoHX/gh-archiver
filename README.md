# gh-archiver

A tool for archiving GitHub repositories

## Installation

```sh
# Global install
npm i -g gh-archiver

# npx
npx gh-archiver --help
```

## Usage

### Create a Personal Access Token

You need to create a Personal Access Token with permissions set as per the following table from [the settings](https://github.com/settings/personal-access-tokens/new).

Select `All repositories` for `Repository access`

| Permission Name | Access           |
| --------------- | ---------------- |
| Administration  | `Read and write` |
| Metadata        | `Read-only`      |

### Command-line

```sh
# Archive repositories that are 1 year old from the last update date.
gh-archiver --before 1y --token="PERSONAL_ACCESS_TOKEN"

# Archive repositories whose last update date is less than 1 year old
# TIPS: If the PAT (Personal Access Token) is registered in an environment variable named "GITHUB_TOKEN", there is no need to use the --token flag.
gh-archiver --after 1y

# More information
gh-archiver --help
```

## License

See [LICENSE](https://github.com/InkoHX/gh-archiver/blob/main/LICENSE) file.

## Author

- [InkoHX](https://github.com/InkoHX)
