/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} robot
 */

const commands = require('probot-commands')
const autz = require('./lib/autz')

async function getLabelName (context, name) {
  const config = await context.config('config.yaml')

  if (!config || !config.labels || !config.labels[name]) {
    return name
  }

  return config.labels[name]
}

module.exports = robot => {
  robot.log.info('Yay, the robot was loaded!');

  robot.on('issues.opened', async context => {
    const labels = [await getLabelName(context, 'issue')];
    return context.octokit.issues.addLabels(context.issue({labels}));
  });

  robot.on('pull_request.opened', async context => {
    const labels = [await getLabelName(context, 'pull-request')];
    return context.octokit.issues.addLabels(context.issue({labels}));
  });

  commands(robot, 'label', async (context, command) => {
    const authorized = await autz.checkAutz(context);
    if (!!authorized) {
      const labels = command.arguments.split(/, */);
      return context.octokit.issues.addLabels(context.issue({labels}));
    }
    return;
  });

  commands(robot, 'unlabel', async (context, command) => {
    const authorized = await autz.checkAutz(context);
    if (!!authorized) {
      const name = command.arguments;
      return context.octokit.issues.removeLabel(context.issue({name}));
    }
    return;
  });

  commands(robot, 'run', async (context, command) => {
    const authorized = await autz.checkAutz(context);
    if (!!authorized) {
      const event_type = command.arguments;
      const pr = context.pullRequest();
      const owner = pr.owner;
      const repo = pr.repo;
      const comment_id = context.payload.comment.id;

      const pull = await context.octokit.pulls.get(pr);
      const client_payload = {"ref": pull.data.head.ref, "sha": pull.data.head.sha};

      // add reaction
      const reaction_content = 'rocket';
      await context.octokit.reactions.createForIssueComment({
        owner,
        repo,
        comment_id,
        content: reaction_content
      });

      return context.octokit.repos.createDispatchEvent({owner, repo, event_type, client_payload});
    }
    return;
  });
}
