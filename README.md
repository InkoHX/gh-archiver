# gh-archiver

A tool for archiving GitHub repositories

## Installation

```sh
# Global install
npm -g gh-archiver

# npx
npx gh-archiver --help
```

## Usage

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
