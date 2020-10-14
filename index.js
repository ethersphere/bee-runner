/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} robot
 */

const commands = require('probot-commands')

module.exports = robot => {
  robot.log.info('Yay, the robot was loaded!')
    commands(robot, 'label', (context, command) => {
      if ((context.payload.comment.author_association === "OWNER") || (context.payload.comment.author_association === "MEMBER")) {
        const labels = command.arguments.split(/, */);
        return context.github.issues.addLabels(context.issue({labels}));
      }
      return;
    });

    commands(robot, 'unlabel', (context, command) => {
      if ((context.payload.comment.author_association === "OWNER") || (context.payload.comment.author_association === "MEMBER")) {
        const name = command.arguments;
        return context.github.issues.removeLabel(context.issue({name}));
      }
      return;
    });

    commands(robot, 'run', async (context, command) => {
      if ((context.payload.comment.author_association === "OWNER") || (context.payload.comment.author_association === "MEMBER")) {
        const event_type = command.arguments;
        const pr = context.pullRequest();
        const owner = pr.owner;
        const repo = pr.repo;

        const pull = await context.github.pulls.get(pr);
        const client_payload = {"ref": pull.data.head.ref, "sha": pull.data.head.sha};
        return context.github.repos.createDispatchEvent({owner, repo, event_type, client_payload});
      } else if ((context.payload.comment.author_association === "COLLABORATOR") || (context.payload.comment.author_association === "CONTRIBUTOR")) {
        // check if user belongs to project organization
        const username = context.payload.comment.user.login;

        if (!username) {
          return;
        }

        const pr = context.pullRequest();
        const owner = pr.owner;
        const repo = pr.repo;

        const response = await context.github.checkMembershipForUser({ org: owner, username });

        if (response && response.status === 204) {
          const event_type = command.arguments;

          const pull = await context.github.pulls.get(pr);
          const client_payload = { "ref": pull.data.head.ref, "sha": pull.data.head.sha };

          return context.github.repos.createDispatchEvent({owner, repo, event_type, client_payload});
        }
      }
      return;
    });
}
