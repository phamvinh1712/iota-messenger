const fork = require('child_process').fork;
const path = require('path');
const EntangledNode = require('entangled-node');

let timeout = null;

const exec = payload => {
  return new Promise((resolve, reject) => {
    const child = fork(path.resolve(__dirname, 'Entangled.js'));

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

  if (payload.job === 'pow') {
    const pow = await EntangledNode.powTrytesFunc(payload.trytes, payload.mwm);
    process.send(pow);
  }

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
  powFn: async (trytes, mwm) => {
    return await exec(JSON.stringify({ job: 'pow', trytes, mwm }));
  },
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
