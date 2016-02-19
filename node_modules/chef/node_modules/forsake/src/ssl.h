#ifndef SRC_NODE_FORSAKE_SSL_H_
#define SRC_NODE_FORSAKE_SSL_H_

#include <openssl/rsa.h>

const char PUBLIC_KEY_PFX[]   = "-----BEGIN PUBLIC KEY-----";
const int  PUBLIC_KEY_PFX_LEN = sizeof(PUBLIC_KEY_PFX) - 1;
const char PUBRSA_KEY_PFX[]   = "-----BEGIN RSA PUBLIC KEY-----";
const int  PUBRSA_KEY_PFX_LEN = sizeof(PUBRSA_KEY_PFX) - 1;

struct ClearErrorOnReturn {
  ~ClearErrorOnReturn();
};

RSA *rsa_private_key(const char *buf, int size, const char *passphrase);
RSA *rsa_public_key (const char *buf, int size);
const char *ssl_error_str (const char **message);

#endif // SRC_NODE_FORSAKE_SSL_H_
