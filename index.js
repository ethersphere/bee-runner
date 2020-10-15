/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} robot
 */

const commands = require('probot-commands')
const autz = require('./lib/autz')

module.exports = robot => {
  robot.log.info('Yay, the robot was loaded!');

  robot.on('issues.opened', async context => {
    const labels = ['issue'];
    robot.log.info(context.payload);
    return context.github.issues.addLabels(context.issue({labels}));
  });

  robot.on('pull_request.opened', async context => {
    const labels = ['pull-request'];
    robot.log.info(context.issue({labels}));
    return context.github.issues.addLabels(context.issue({labels}));
  });

  commands(robot, 'label', (context, command) => {
    if (autz.checkAutz(context)) {
      robot.log.info("entered label if");
      const labels = command.arguments.split(/, */);
      return context.github.issues.addLabels(context.issue({labels}));
    }
    return;
  });

  commands(robot, 'unlabel', (context, command) => {
    if (autz.checkAutz(context)) {
      const name = command.arguments;
      return context.github.issues.removeLabel(context.issue({name}));
    }
    return;
  });

  commands(robot, 'run', async (context, command) => {
    if (autz.checkAutz(context)) {
    robot.log.info(context.payload);
      const event_type = command.arguments;
      const pr = context.pullRequest();
      const owner = pr.owner;
      const repo = pr.repo;

      const pull = await context.github.pulls.get(pr);
      const client_payload = {"ref": pull.data.head.ref, "sha": pull.data.head.sha};
      return context.github.repos.createDispatchEvent({owner, repo, event_type, client_payload});
    }
    return;
  });
}
