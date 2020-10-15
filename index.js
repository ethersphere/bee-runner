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

      console.log('context.payload', context.payload); //TODO: remove

      // check if user belongs to project organization
      const username = context.payload.comment.user.login;

      console.log('username', username); //TODO: remove

      if (!username) {
        return;
      }

      const pr = context.pullRequest();
      const owner = pr.owner;
      const repo = pr.repo;

      console.log('pr', pr); //TODO: remove

      const response = await context.github.orgs.checkMembershipForUser({ org: 'ethersphere', username }); //TODO: hard-coded

      console.log('checkMembershipForUser/response', response); //TODO: remove

      if (response && response.status === 204) {
        const event_type = command.arguments;
        const comment_id = context.payload.comment.id;

        const pull = await context.github.pulls.get(pr);
        const client_payload = { "ref": pull.data.head.ref, "sha": pull.data.head.sha };

        // add reaction
        const reaction_content = 'rocket';
        const reactionRes = await context.github.reactions.createForPullRequestReviewComment({
          owner,
          repo,
          comment_id,
          content: reaction_content
        });

        console.log('createForPullRequestReviewComment/response', reactionRes); //TODO: remove

        return context.github.repos.createDispatchEvent({owner, repo, event_type, client_payload});
      }

      return;
    });
}
