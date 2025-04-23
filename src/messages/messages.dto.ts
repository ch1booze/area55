export class WorkflowInputEvent {
  query?: string;
  file?: Express.Multer.File;
}

export class WorkflowOutputEvent {
  result: string;
}
