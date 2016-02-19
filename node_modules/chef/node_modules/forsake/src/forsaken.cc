#include <node.h>
#include <nan.h>

#include <openssl/ssl.h>
#include "ssl.h"

#define REQ_BUF_ARG(I, VAR)                                                   \
  if (info.Length() <= (I) || !node::Buffer::HasInstance(info[I]))            \
    return Nan::ThrowTypeError("Argument " #I " must be a buffer");           \
  Local<Object> _ ## VAR = info[I]->ToObject();                               \
  char *VAR = node::Buffer::Data(_ ## VAR);                                   \
  size_t VAR ## _len = node::Buffer::Length(_ ## VAR);

#define REQ_INT_ARG(I, VAR)                                                   \
  if (info.Length() <= (I) || !info[I]->IsNumber())                           \
    return Nan::ThrowTypeError("Argument " #I " must be an integer");         \
  int VAR = info[I]->ToInteger()->Value();

#define KEY_private                                                           \
  Nan::Utf8String passphrase(info[2]);                                        \
  RSA *rsa = rsa_private_key(key_pem, key_pem_len, *passphrase);

#define KEY_public                                                            \
  RSA *rsa = rsa_public_key(key_pem, key_pem_len);

#define RSAUTL_METHOD(NAME, KEY, OP)                                          \
static NAN_METHOD(NAME) {                                                     \
  ClearErrorOnReturn clear_error_on_return;                                   \
  (void) &clear_error_on_return; /* Silence compiler warning */               \
                                                                              \
  int out_len = 0;                                                            \
  char *out = NULL;                                                           \
                                                                              \
  REQ_BUF_ARG(0, in)                                                          \
  REQ_BUF_ARG(1, key_pem)                                                     \
  REQ_INT_ARG(3, pad)                                                         \
                                                                              \
  KEY_ ## KEY                                                                 \
  if (rsa == NULL)                                                            \
    return Nan::ThrowError(GetErrorArray("Unable to load " #KEY " key"));     \
                                                                              \
  out_len = RSA_size(rsa);                                                    \
  out = new char[out_len];                                                    \
  out_len = RSA_ ## KEY ## _ ## OP(in_len,                                    \
                                   reinterpret_cast<unsigned char *>(in),     \
                                   reinterpret_cast<unsigned char *>(out),    \
                                   rsa,                                       \
                                   pad);                                      \
  if (rsa != NULL)                                                            \
    RSA_free(rsa);                                                            \
                                                                              \
  if (out_len <= 0)                                                           \
    return Nan::ThrowError(GetErrorArray(#NAME " operation failed"));         \
                                                                              \
  Local<Value> rc = Nan::NewBuffer(                                           \
    out,                                                                      \
    static_cast<uint32_t>(out_len)                                            \
  ).ToLocalChecked();                                                         \
  info.GetReturnValue().Set(rc);                                              \
}

using namespace v8;

static Local<Value> GetErrorArray(const char *message) {
  Local<Array> out = Nan::New<Array>();
  uint32_t index = 0;
  const char *line = NULL;

  Nan::Set(out, index++, Nan::New<String>(message).ToLocalChecked());

  while (ssl_error_str(&line)) {
    Nan::Set(out, index++, Nan::New<String>(line).ToLocalChecked());
  }

  return out;
}

RSAUTL_METHOD(Decrypt, private, decrypt)
RSAUTL_METHOD(Encrypt, public,  encrypt)
RSAUTL_METHOD(Sign,    private, encrypt)
RSAUTL_METHOD(Verify,  public,  decrypt)

static void InitOnce() {
  SSL_load_error_strings();
  SSL_library_init();
}

static void Init(Handle<Object> exports) {
  static uv_once_t init_once = UV_ONCE_INIT;
  uv_once(&init_once, InitOnce);

  NODE_DEFINE_CONSTANT(exports, RSA_NO_PADDING);
  NODE_DEFINE_CONSTANT(exports, RSA_PKCS1_OAEP_PADDING);
  NODE_DEFINE_CONSTANT(exports, RSA_PKCS1_PADDING);
  NODE_DEFINE_CONSTANT(exports, RSA_SSLV23_PADDING);
  NODE_DEFINE_CONSTANT(exports, RSA_X931_PADDING);

  Nan::SetMethod(exports, "decrypt", Decrypt);
  Nan::SetMethod(exports, "encrypt", Encrypt);
  Nan::SetMethod(exports, "sign",    Sign);
  Nan::SetMethod(exports, "verify",  Verify);
}

NODE_MODULE(forsaken, Init)
