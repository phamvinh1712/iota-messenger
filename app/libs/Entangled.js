const { fork } = require('child_process');
const path = require('path');
const EntangledNode = require('entangled-node');

let timeout = null;

const exec = payload => {
  return new Promise((resolve, reject) => {
    const child = fork(path.resolve(__dirname, 'Entangled.prod.js'));

    const { job } = JSON.parse(payload);

    child.on('message', message => {
      resolve(message);

      clearTimeout(timeout);
      child.kill();
    });

    timeout = setTimeout(
      () => {
        reject(`Timeout: Entangled job: ${job}`);
        child.kill();
      },
      job === 'batchedPow' ? 180 * 1000 : 30 * 1000
    );

    child.send(payload);
  });
};

process.on('message', async data => {
  const payload = JSON.parse(data);

  if (payload.job === 'batchedPow') {
    const pow = await EntangledNode.powBundleFunc(
      payload.trytes,
      payload.trunkTransaction,
      payload.branchTransaction,
      payload.mwm
    );
    process.send(pow);
  }
});

const Entangled = {
  batchedPowFn: async (trytes, trunkTransaction, branchTransaction, mwm) => {
    return await exec(
      JSON.stringify({
        job: 'batchedPow',
        trytes,
        trunkTransaction,
        branchTransaction,
        mwm
      })
    );
  }
};

module.exports = Entangled;
