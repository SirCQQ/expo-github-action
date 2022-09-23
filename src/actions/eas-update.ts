import { getBooleanInput, getInput, getMultilineInput } from '@actions/core';

// import {} from '@actions/github'
import { projectInfo, projectOwner } from '../expo';
import { pullContext } from '../github';
import { executeAction } from '../worker';
import { CommentInput, DEFAULT_ID, DEFAULT_MESSAGE } from './preview-comment';

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

export async function updateAction(input: CommentInput = updateInput()) {
  const project = await projectInfo(input.project);
  if (!project.owner) {
    project.owner = await projectOwner();
  }
  console.log('This is the output v1', { input, project });
}

executeAction(updateAction);
