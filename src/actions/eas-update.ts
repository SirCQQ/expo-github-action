import { getBooleanInput, getInput, getMultilineInput } from '@actions/core';

// import {} from '@actions/github'
import { latestUpdate, projectInfo, projectOwner } from '../expo';
import { executeAction } from '../worker';
import { DEFAULT_ID, DEFAULT_MESSAGE } from './preview-comment';

export type UpdateInput = ReturnType<typeof updateInput> & { latestUpdate?: string };

export const updateInput = () => {
  return {
    channel: getInput('channel') || 'default',
    comment: !getInput('comment') || getBooleanInput('comment'),
    message: getInput('message') || DEFAULT_MESSAGE,
    messageId: getInput('message-id') || DEFAULT_ID,
    project: getInput('project'),
    githubToken: getInput('github-token'),
    updateResult: getMultilineInput('update-result'),
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
  input.latestUpdate = await latestUpdate('eas', `${input.channel}`);
  console.log('This is the output v1', { input, project });
}

executeAction(updateAction);
