/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} robot
 */

const commands = require('probot-commands')

module.exports = async robot => {
  robot.log.info('Yay, the robot was loaded!')
  robot.on('issue_comment.created', async context => {
    robot.log.info(context.payload.comment.author_association)
    if ((context.payload.comment.author_association === "OWNER") || (context.payload.comment.author_association === "MEMBER")) {
      commands(robot, 'label', async (context, command) => {
        const labels = command.arguments.split(/, */);
        return context.github.issues.addLabels(context.issue({labels}));
      });

      commands(robot, 'unlabel', async (context, command) => {
        const name = command.arguments;
        return context.github.issues.removeLabel(context.issue({name}));
      });

      commands(robot, 'run', async (context, command) => {
        const event_type = command.arguments;
        const pr = context.pullRequest();
        const owner = pr.owner;
        const repo = pr.repo;

        const pull = await context.github.pulls.get(pr);
        const client_payload = {"ref": pull.data.head.ref, "sha": pull.data.head.sha};

        return context.github.repos.createDispatchEvent({owner, repo, event_type, client_payload});
      });
    };
  });
}
