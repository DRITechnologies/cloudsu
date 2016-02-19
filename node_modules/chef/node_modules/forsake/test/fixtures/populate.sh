#! /bin/sh

umask 066

# key set A
openssl genrsa -out a.key 2048
openssl rsa -in a.key -pubout -out a.pkcs8
ssh-keygen -f a.key -e -m pem > a.pkcs1
openssl req -new -key a.key -out a.csr -subj '/DC=org/DC=OpenSSL/DC=users/CN=John Doe'
openssl x509 -req -days 365 -in a.csr -signkey a.key -out a.x509

# key set B
openssl genrsa -out b.key 2048
openssl rsa -in b.key -pubout -out b.pkcs8

# passphrased key
echo -n helloworld | openssl rsa -des3 -passout stdin -in a.key -out a.pass

# encrypts
echo -n encrypted lolcats | openssl rsautl -encrypt -pubin -inkey a.pkcs8 -out encrypted.txt
echo -n lolcats with oaep | openssl rsautl -encrypt -pubin -inkey a.pkcs8 -oaep -out encrypted_oaep.txt

# signatures
echo -n signed lolcats | openssl rsautl -sign -inkey a.key -out signed.txt
echo -n lolcats with x9.31 | openssl rsautl -sign -inkey a.key -x931 -out signed_x931.txt
