import expect from 'expect.js';
import sinon from 'auto-release-sinon';
import cluster from 'cluster';
import { ChildProcess } from 'child_process';
import { sample, difference } from 'lodash';

import ClusterManager from '../cluster_manager';
import Worker from '../worker';

describe('CLI cluster manager', function () {

  function setup() {
    sinon.stub(cluster, 'fork', function () {
      return {
        process: {
          kill: sinon.stub(),
        },
        isDead: sinon.stub().returns(false),
        removeListener: sinon.stub(),
        on: sinon.stub(),
        send: sinon.stub()
      };
    });

    const manager = new ClusterManager({});
    return manager;
  }

  it('has two workers', function () {
    const manager = setup();

    expect(manager.workers).to.have.length(2);
    for (const worker of manager.workers) expect(worker).to.be.a(Worker);

    expect(manager.optimizer).to.be.a(Worker);
    expect(manager.server).to.be.a(Worker);
  });

  it('delivers broadcast messages to other workers', function () {
    const manager = setup();

    for (const worker of manager.workers) {
      Worker.prototype.start.call(worker);// bypass the debounced start method
      worker.onOnline();
    }

    const football = {};
    const messenger = sample(manager.workers);

    messenger.emit('broadcast', football);
    for (const worker of manager.workers) {
      if (worker === messenger) {
        expect(worker.fork.send.callCount).to.be(0);
      } else {
        expect(worker.fork.send.firstCall.args[0]).to.be(football);
      }
    }
  });
});
