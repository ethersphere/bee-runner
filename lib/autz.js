async function checkAutz (context) {
    context.log.info("AUTHOR: " + context.payload.comment.author_association);
    if ((context.payload.comment.author_association === "OWNER") || (context.payload.comment.author_association === "MEMBER")) {
        return true;
    } else if ((context.payload.comment.author_association === "COLLABORATOR") || (context.payload.comment.author_association === "CONTRIBUTOR")) {
        // check if user belongs to project organization
        const username = context.payload.comment.user.login;

        if (!username) {
            return false;
        }

        request = context.pullRequest();
        if (request === "") {
            request = context.issue();
        }
        const owner = request.owner;
        const repo = request.repo;

        const response = await context.github.checkMembershipForUser({ org: owner, username });

        if (response && response.status === 204) {
            return true;
        }
    }
    return false;
}

module.exports = {
    checkAutz: async (context) => {
        let a = await checkAutz(context);
        return a;
    }
}