import { getBooleanInput, getInput, getMultilineInput, info } from '@actions/core';

// import {} from '@actions/github'
import { createEasQr, lastUpdate, projectDeepLink, projectInfo, projectLink, projectOwner } from '../expo';
import { createIssueComment, pullContext } from '../github';
import { template } from '../utils';
import { executeAction } from '../worker';
import { DEFAULT_ID } from './preview-comment';

export type UpdateInput = ReturnType<typeof updateInput> & { latestUpdate?: string };

export const DEFAULT_MESSAGE_FOR_UPDATE =
  `This pull request was automatically deployed using [Expo GitHub Actions](https://github.com/expo/expo-github-action/tree/main/preview-comment)!\n` +
  `\n- Project: **@{projectOwner}/{projectSlug}**` +
  `\n- Branch: **{channel}**`;

export const DEFAULT_SYSTEM_QR = `\n\n For {system}: \n <a href="{qr}"><img src={qr} height="200px" width="200px"></a>`;

export const updateInput = () => {
  return {
    channel: getInput('channel') || 'default',
    comment: !getInput('comment') || getBooleanInput('comment'),
    message: getInput('message') || DEFAULT_MESSAGE_FOR_UPDATE,
    messageId: getInput('message-id') || DEFAULT_ID,
    project: getInput('project'),
    githubToken: getInput('github-token'),
    updateResult: getMultilineInput('update-result'),
    ios: getBooleanInput('is-ios-build') || true,
    android: getBooleanInput('is-android-build') || true,
  };
};

export async function updateAction(input: UpdateInput = updateInput()) {
  const project = await projectInfo(input.project);
  if (!project.owner) {
    project.owner = await projectOwner();
  }
  if (!input.channel) {
    throw new Error("'channel' variable is needed");
  }

  const variables: Record<string, string> = {
    projectLink: projectLink(project, input.channel),
    projectDeepLink: projectDeepLink(project, input.channel),
    projectName: project.name,
    projectOwner: project.owner || '',
    projectSlug: project.slug,
    channel: input.channel,
  };

  const update = await lastUpdate('eas', `${input.channel}`);
  const messageId = template(input.messageId, variables);
  let messageBody = template(input.message, variables);
  if (input.ios) {
    const iosUpdate = update.find(u => u.platform === 'ios');
    if (iosUpdate) {
      const id = iosUpdate.id;
      messageBody += template(DEFAULT_SYSTEM_QR, { system: 'ios', qr: createEasQr(id) });
    }
  }
  if (input.android) {
    const iosUpdate = update.find(u => u.platform === 'android');
    if (iosUpdate) {
      const id = iosUpdate.id;
      messageBody += template(DEFAULT_SYSTEM_QR, { system: 'android', qr: createEasQr(id) });
    }
  }
  if (!input.comment) {
    info(`Skipped comment: 'comment' is disabled`);
  } else {
    await createIssueComment({
      ...pullContext(),
      token: input.githubToken,
      id: messageId,
      body: messageBody,
    });
  }
}

executeAction(updateAction);
