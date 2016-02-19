# Forsake

For RSA sake! Exposes `openssl rsautl` funtions via a C addon rather than shelling out.

  [![Linux Build Status](https://img.shields.io/travis/mal/forsake/master.svg)](https://travis-ci.org/mal/forsake)
  [![Windows Build status](https://ci.appveyor.com/api/projects/status/ch8pgcee6rn0invn/branch/master?svg=true)](https://ci.appveyor.com/project/mal/forsake/branch/master)
  [![NPM version](https://img.shields.io/npm/v/forsake.svg)](http://badge.fury.io/js/forsake)

# Installation

```sh
$ npm install forsake
```

:warning: on Windows, either a 32-bit or 64-bit separately-compiled OpenSSL
library is required. One can be obtained from [slproweb](http://slproweb.com/products/Win32OpenSSL.html).

## API

_n.b._ all keys are `Buffer` instances
```js
var forsake = require('forsake');

// sign
var a = forsake.sign('this string', private_key);

// with passphrase
var protected_pkey = { key: private_key, passphrase: 'hello' };
var b = forsake.sign('this string', protected_pkey);

// with padding
var c = forsake.sign('this string', pkey, forsake.RSA_X931_PADDING);

// errors
try {
    forsake.sign('this string', public_key);
} catch (e) {
    e.toString(); //=> "RsaError: Unable to load private key"
    e.failures;   //=> [ 'error:0906D06C:PEM routines:PEM_read_bio:no start line' ]
}
```

### Notes

  - The API for `encrypt`, `decrypt`, `sign` and `verify` is identical
  - All errors are of type `RsaError` which is exposed by `forsake`
  - `RsaError.failures` contains SSL error strings, which can help identify problems

### Keys

The examples below show all possible types of supported key arguments:

```js
var buffer_from_file = fs.readFileSync('id_rsa');
var utf8_string = "-----BEGIN PUBLIC KEY-----\nblah\n-----END PUBLIC KEY-----";
var protected_buffer = { key: buf_from_file, passphrase: 'opensesame' };
var protected_utf8 = { key: utf8_string, passphrase: 'Alohomora' };
```

### Padding

Forsake exposes the following padding constants:

  - `RSA_NO_PADDING`
  - `RSA_PKCS1_OAEP_PADDING`
  - `RSA_PKCS1_PADDING`
  - `RSA_SSLV23_PADDING`
  - `RSA_X931_PADDING`

## Support

Forsake is able to read PKCS#8, PKCS#1 and X.509 public keys, and PKCS#8 private keys. Passphrases can be used with private keys and the standard padding options are also available.

## License

ISC
