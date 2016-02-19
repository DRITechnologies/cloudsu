// A large amount of this file was extracted from node_crypto.cc as it
// was not readily exposed by node core.

#include <string.h>

#include <openssl/bio.h>
#include <openssl/err.h>
#include <openssl/evp.h>
#include <openssl/pem.h>
#include <openssl/rsa.h>
#include <openssl/x509.h>

#include "ssl.h"

// Forcibly clear OpenSSL's error stack on return. This stops stale errors
// from popping up later in the lifecycle of crypto operations where they
// would cause spurious failures. It's a rather blunt method, though.
// ERR_clear_error() isn't necessarily cheap either.
ClearErrorOnReturn::~ClearErrorOnReturn() {
  ERR_clear_error();
}

static int CryptoPemCallback(char *buf, int size, int rwflag, void *u) {
  if (u) {
    size_t buflen = static_cast<size_t>(size);
    size_t len = strlen(static_cast<const char*>(u));
    len = len > buflen ? buflen : len;
    memcpy(buf, u, len);
    return len;
  }
  return 0;
}

static BIO *bio_from_buffer(const char *buf, int size) {
  BIO *bp = BIO_new(BIO_s_mem());
  if (bp == NULL)
    goto exit;
  if (!BIO_write(bp, buf, size))
    goto exit;
  return bp;
 exit:
  if (bp != NULL)
    BIO_free_all(bp);
  return NULL;
}

RSA *rsa_private_key(const char *buf, int size, const char *passphrase) {
  bool fatal = true;

  EVP_PKEY *pkey = NULL;
  RSA *rsa = NULL;

  BIO *bp = bio_from_buffer(buf, size);
  if (bp == NULL)
    goto exit;

  pkey = PEM_read_bio_PrivateKey(bp,
                                 NULL,
                                 CryptoPemCallback,
                                 const_cast<char*>(passphrase));
  if (pkey == NULL)
    goto exit;

  fatal = false;
  rsa = EVP_PKEY_get1_RSA(pkey);

 exit:
  if (pkey != NULL)
    EVP_PKEY_free(pkey);
  if (bp != NULL)
    BIO_free_all(bp);

  if (fatal)
    return NULL;

  return rsa;
}

RSA *rsa_public_key(const char *buf, int size) {
  bool fatal = true;

  EVP_PKEY *pkey = NULL;
  X509 *x509 = NULL;
  RSA *rsa = NULL;

  BIO *bp = bio_from_buffer(buf, size);
  if (bp == NULL)
    goto exit;

  // Check if this is a PKCS#8 or RSA public key before trying as X.509.
  // Split this out into a separate function once we have more than one
  // consumer of public keys.
  if (strncmp(buf, PUBLIC_KEY_PFX, PUBLIC_KEY_PFX_LEN) == 0) {
    pkey = PEM_read_bio_PUBKEY(bp, NULL, CryptoPemCallback, NULL);
    if (pkey == NULL)
      goto exit;
  } else if (strncmp(buf, PUBRSA_KEY_PFX, PUBRSA_KEY_PFX_LEN) == 0) {
    rsa = PEM_read_bio_RSAPublicKey(bp, NULL, CryptoPemCallback, NULL);
    if (rsa) {
      pkey = EVP_PKEY_new();
      if (pkey)
        EVP_PKEY_set1_RSA(pkey, rsa);
      RSA_free(rsa);
    }
    if (pkey == NULL)
      goto exit;
  } else {
    // X.509 fallback
    x509 = PEM_read_bio_X509(bp, NULL, CryptoPemCallback, NULL);
    if (x509 == NULL)
      goto exit;
    pkey = X509_get_pubkey(x509);
    if (pkey == NULL)
      goto exit;
  }

  fatal = false;
  rsa = EVP_PKEY_get1_RSA(pkey);

 exit:
  if (x509 != NULL)
    X509_free(x509);
  if (pkey != NULL)
    EVP_PKEY_free(pkey);
  if (bp != NULL)
    BIO_free_all(bp);

  if (fatal)
    return NULL;

  return rsa;
}

const char *ssl_error_str (const char **message) {
  unsigned long err = ERR_get_error();
  if (err != 0) {
    size_t size = 128;
    *message = new char[size];
    ERR_error_string_n(err, const_cast<char *>(*message), size);
  } else {
    *message = NULL;
  }
  return *message;
}
