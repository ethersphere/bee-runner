/**
 * This function checks if for given PR the bot should create the comment with checklist.
 * This handle is expected to be triggered with `pull_request.opened` event, so it should be guranteed
 * that for lifespan of a PR this will be triggered only once and hence we should not worry about
 * duplication of checklist comments.
 * @param context
 * @param config
 * @returns {Promise<boolean>}
 */
async function isReleasePr (context, config) {
  if (!config || !config.release || !config.release.checklist || !config.release.trigger) {
    console.log('Release Checklist is not configured')

    return false
  }

  const prInfo = (await context.octokit.pulls.get(context.pullRequest())).data
  const titleRegex = config.release.trigger.title
  const labels = typeof config.release.trigger.labels === 'string' ? [config.release.trigger.labels] : config.release.trigger.labels

  if (!titleRegex && !labels) {
    console.log('No triggers provided')
    return false
  }

  if (titleRegex) {
    if(!new RegExp(titleRegex).test(prInfo.title)){
      console.log(`Title '${prInfo.title}' does NOT match regex: ${titleRegex}`)

      return false
    }

    console.log('Title regex does match.')
  }

  if (labels) {
    for (const label of labels) {
      if (!prInfo.labels.find(l => l.name === label)) {
        console.log(`Expected label '${label}' not found!`)

        return false
      }
    }
  }

  return true
}

async function handleReleaseChecklist (context) {
  const config = await context.config('config.yaml')

  if (!await isReleasePr(context, config)) {
    return
  }

  const checklist = config.release.checklist
  return context.octokit.issues.createComment(context.issue({
    body: checklist
  }));
}

module.exports = handleReleaseChecklist
