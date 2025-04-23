import { Injectable } from '@nestjs/common';
import { createWorkflow, workflowEvent } from '@llama-flow/core';
import { collect } from '@llama-flow/core/stream/consumer';
import { until } from '@llama-flow/core/stream/until';
import { WorkflowInputEvent, WorkflowOutputEvent } from './messages.dto';

@Injectable()
export class MessagesService {
  async processMessage(inputEvent: WorkflowInputEvent) {
    const workflow = createWorkflow();
    const startEvent = workflowEvent<WorkflowInputEvent>();
    const stopEvent = workflowEvent<WorkflowOutputEvent>();

    workflow.handle([startEvent], (start) => {
      return stopEvent.with({
        result: 'Workflow started for query: ' + start.data.query,
      });
    });

    const { stream, sendEvent } = workflow.createContext();
    sendEvent(startEvent.with(inputEvent));
    const events = await collect(until(stream, stopEvent));
    const finalEvent = events[events.length - 1];
    if (stopEvent.include(finalEvent)) {
      return finalEvent.data.result;
    }
  }
}
