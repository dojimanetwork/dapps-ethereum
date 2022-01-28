import React from 'react';

import Web3 from '~/components/Web3';
import Dashboard from '~/components/Dashboard';

export default () => {
  return (
    <div>
      <Web3
        render={props => <Dashboard {...props} />}
        renderLoading={() => <div>Loading...</div>}
      />
    </div>
  );
};
