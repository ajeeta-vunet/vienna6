import _ from 'lodash';

export default class Pipeline {

  constructor() {
    this.processors = [];
    this.counter = 0;
    this.input = {};
    this.output = undefined;
    this.dirty = false;
  }

  load(pipeline) {
    while (this.processors.length > 0) {
      this.processors.pop();
    }

    pipeline.processors.forEach((processor) => {
      this.addExisting(processor);
    });
  }

  remove(processor) {
    const processors = this.processors;
    const index = processors.indexOf(processor);

    processors.splice(index, 1);
  }

  moveUp(processor) {
    const processors = this.processors;
    const index = processors.indexOf(processor);

    if (index === 0) return;

    const temp = processors[index - 1];
    processors[index - 1] = processors[index];
    processors[index] = temp;
  }

  moveDown(processor) {
    const processors = this.processors;
    const index = processors.indexOf(processor);

    if (index === processors.length - 1) return;

    const temp = processors[index + 1];
    processors[index + 1] = processors[index];
    processors[index] = temp;
  }

  addExisting(existingProcessor) {
    const newProcessor = this.add(existingProcessor.constructor);
    _.assign(newProcessor, _.omit(existingProcessor, 'data'));
    _.assign(newProcessor.data, _.omit(existingProcessor.data, 'processorId'));

    return newProcessor;
  }

  add(ProcessorType) {
    const processors = this.processors;

    this.counter += 1;
    const processorId = `processor_${this.counter}`;
    const newProcessor = new ProcessorType(processorId);
    processors.push(newProcessor);

    return newProcessor;
  }

  updateParents() {
    const processors = this.processors;

    processors.forEach((processor, index) => {
      let newParent;
      if (index === 0) {
        newParent = this.input;
      } else {
        newParent = processors[index - 1];
      }

      processor.setParent(newParent);
    });
    this.dirty = true;
  }

  updateOutput() {
    const processors = this.processors;

    this.output = undefined;
    if (processors.length > 0) {
      this.output = processors[processors.length - 1].outputObject;
    }
    this.dirty = false;
  }

  getProcessorById(processorId) {
    const result = _.find(this.processors, (processor) => { return processor.data.processorId === processorId; });
    return result;
  }

  // Updates the state of the pipeline and processors with the results
  // from an ingest simulate call.
  applySimulateResults(results) {
    //update the outputObject of each processor
    results.forEach((result) => {
      const processor = this.getProcessorById(result.processorId);

      processor.outputObject = _.get(result, 'output');
      processor.error = _.get(result, 'error');
    });

    //update the inputObject of each processor
    results.forEach((result) => {
      const processor = this.getProcessorById(result.processorId);

      //we don't want to change the inputObject if the parent processor
      //is in error because that can cause us to lose state.
      if (!_.get(processor, 'error.isNested')) {
        if (processor.parent.data) {
          processor.inputObject = _.cloneDeep(processor.parent.outputObject);
        } else {
          processor.inputObject = _.cloneDeep(processor.parent);
        }
      }
    });

    this.updateOutput();
  }

}
