  var config = require('./config.js');

  const chef = {
      name: 'CHEF',
      type: 'CMS'
  };

  return config.getServiceAccount(chef)
      .then(response => {
          console.log(response);
      })
      .catch(err => {
          console.log('err', err);
      });
