import { projectInfo, projectOwner } from '../expo';
import { executeAction } from '../worker';
import { CommentInput, commentInput } from './preview-comment';

executeAction(async (input: CommentInput = commentInput()) => {
  // const project = await projectInfo(input.project);
  // if (!project.owner) {
  //   project.owner = await projectOwner();
  // }
  console.log(input);
});
