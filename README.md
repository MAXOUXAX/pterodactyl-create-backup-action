# Pterodactyl Backup Manager

![CI](https://github.com/maxouxax/pterodactyl-create-backup-action/actions/workflows/ci.yml/badge.svg)
![Lint](https://github.com/maxouxax/pterodactyl-create-backup-action/actions/workflows/linter.yml/badge.svg)
![CodeQL](https://github.com/maxouxax/pterodactyl-create-backup-action/actions/workflows/codeql-analysis.yml/badge.svg)

## 🚀 Overview

The **Pterodactyl Backup Manager** GitHub Action creates a backup on the
Pterodactyl panel with automatic rotation. This action ensures that your server
backups are always up-to-date and old backups are rotated out to save space.

## 📋 Inputs

- `panel-url` (required): The URL of the Pterodactyl panel.
- `server-id` (required): The ID of the server to backup.
- `api-key` (required): The Pterodactyl API key.

## 📤 Outputs

- `backup-uuid`: The UUID of the created backup.

## ⚙️ Usage

To use this action, create a workflow YAML file in your repository's
`.github/workflows` directory. Here is an example:

```yaml
name: Create Pterodactyl Backup

on:
  schedule:
    - cron: '0 0 * * *' # Runs daily at midnight

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Create Pterodactyl Backup
        uses: maxouxax/pterodactyl-create-backup-action@v1
        with:
          panel-url: ${{ secrets.PANEL_URL }}
          server-id: ${{ secrets.SERVER_ID }}
          api-key: ${{ secrets.API_KEY }}
```

## 📝 Notes

> **Note:** Ensure that you store sensitive information such as `panel-url`,
> `server-id`, and `api-key` in GitHub Secrets to keep them secure.

## ⚠️ Warnings

> **Warning:** This action will delete the oldest backup if the backup limit is
> reached. Make sure you have configured your backup limits appropriately on the
> Pterodactyl panel.

## 🛠️ Development

To develop and test this action locally, you can use the following commands:

```sh
# Install dependencies
npm install

# Run the action locally
npm run local-action
```

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for
details.

---

For more information, visit the
[Pterodactyl documentation](https://pterodactyl.io/).
