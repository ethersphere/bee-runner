# bee-runner

> A GitHub App built with [Probot](https://github.com/probot/probot) that A Probot app

## Overview

This bot helps to have better project management in our Swarm/Bee related repositories. Its current capabilities are:

 - add labels to new issues and PRs to distinguish them in Zenhub
 - support commands `label` and `unlabel` to add/remove labels
 - add release checklist to release PRs 

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Configuration

You can place a custom configuration for repo into `.github/config.yaml`.

Possible configuration:

```yaml
labels:
  issue: <<some other name for issue label>>
  pull-request: <<some other name for pull-request label>>
release:
  # Trigger conditions are joined with AND, hence if you specify both title and labels both has to be present!
  trigger:
    title: <<regex that validates the name of the PR>>
    labels: 
      - <<label(s) that has to be present on PR>>
  checklist: |
    # Release checklist
    This content is placed into comment into the PR.
    
     - [ ] Do something before you release!
```

## Contributing

If you have suggestions for how bee-runner could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2020 Ivan Vandot <vandot@ethswarm.org>
