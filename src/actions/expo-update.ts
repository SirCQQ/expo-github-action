import { getBooleanInput, getInput } from '@actions/core';

import { projectInfo, projectOwner } from '../expo';
import { executeAction } from '../worker';
import { CommentInput, DEFAULT_ID, DEFAULT_MESSAGE } from './preview-comment';

executeAction(updateAction);

const updateInput = () => {
  return {
    iosId: getInput('ios-id'),
    androidId: getInput('android-id'),
    channel: getInput('channel') || 'default',
    comment: !getInput('comment') || getBooleanInput('comment'),
    message: getInput('message') || DEFAULT_MESSAGE,
    messageId: getInput('message-id') || DEFAULT_ID,
    project: getInput('project'),
    githubToken: getInput('github-token'),
  };
};

async function updateAction(input: CommentInput = updateInput()) {
  const project = await projectInfo(input.project);
  if (!project.owner) {
    project.owner = await projectOwner();
  }
  console.log('This is the output ', { input, project });
}
