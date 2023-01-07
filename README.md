# gh-archiver

最後の更新から一年以上経過しているリポジトリをアーカイブするためのスクリプト

## Usage

`GITHUB_TOKEN`にはリポジトリに対する権限として`Administration`を`Read and write`に設定した**Personal access token**を設定するようにしてください。

```sh
echo "GITHUB_TOKEN=your_token" > .env

node ./index.js # --dry-run を加えるとアーカイブされるリポジトリを確認することができます。
```
