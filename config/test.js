const err_handler = require('../utls/error_handler.js');

console.log(
err_handler({
  cause: {
    message: 'testing'
  }
})
);
