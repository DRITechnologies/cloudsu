var expect = require('chai').expect;
var fixture = require('./fixtures/load');

var forsake = require('../index');
var RsaError = forsake.RsaError;

var a_pkey  = fixture('a.key'),
    a_pass  = fixture('a.pass'),
    a_pkcs1 = fixture('a.pkcs1'),
    a_pkcs8 = fixture('a.pkcs8'),
    a_x509  = fixture('a.x509');
var b_pkey  = fixture('b.key'),
    b_pkcs8 = fixture('b.pkcs8');

describe('forsake', function() {

    describe('as a module', function () {

        it('should have the rsautl functions', function () {
            var methods = [
                'encrypt',
                'decrypt',
                'sign',
                'verify'
            ];
            methods.forEach(function (fn) {
                expect(forsake).to.have.property(fn).and.be.a('function');
            });
        });

        it('should have the RSA padding constants', function () {
            var constants = [
                'RSA_NO_PADDING',
                'RSA_PKCS1_OAEP_PADDING',
                'RSA_PKCS1_PADDING',
                'RSA_SSLV23_PADDING',
                'RSA_X931_PADDING'
            ];
            constants.forEach(function (ct) {
                expect(forsake).to.have.property(ct).and.be.a('number');
            });
        });

    });

    describe('when not specifying padding', function () {

        it('should support encrypting', function () {
            var out = forsake.encrypt('lolcats', a_pkcs8);
            expect(out).to.have.length(256);
        });

        it('should support decrypting', function () {
            var payload = fixture('encrypted.txt');
            var out = forsake.decrypt(payload, a_pkey).toString('utf8');
            expect(out).to.equal('encrypted lolcats');
        });

        it('should support signing', function () {
            var payload = fixture('signed.txt');
            var out = forsake.sign('signed lolcats', a_pkey);
            expect(out.toString()).to.equal(payload.toString());
        });

        it('should support verifying', function () {
            var payload = fixture('signed.txt');
            var out = forsake.verify(payload, a_pkcs8).toString('utf8');
            expect(out).to.equal('signed lolcats');
        });

    });

    describe('when explicitly using padding', function () {

        it('should support decrypting using OAEP', function () {
            var payload = fixture('encrypted_oaep.txt');
            var opts = { padding: forsake.RSA_PKCS1_OAEP_PADDING };
            var out = forsake.decrypt(payload, a_pkey, opts).toString('utf8');
            expect(out).to.equal('lolcats with oaep');
        });

        it('should support signing using X9.31', function () {
            var payload = fixture('signed_x931.txt');
            var opts = { padding: forsake.RSA_X931_PADDING };
            var out = forsake.sign('lolcats with x9.31', a_pkey, opts);
            expect(out.toString()).to.equal(payload.toString());
        });

        it('should throw for verifying using OAEP', function () {
            var payload = fixture('encrypted_oaep.txt');
            var opts = { padding: forsake.RSA_PKCS1_OAEP_PADDING };
            var fn = function () { forsake.verify(payload, a_pkcs8, opts); };
            expect(fn).to.throw(RsaError, 'Verify operation failed');
        });

        it('should throw for encrypting using X9.31', function () {
            var opts = { padding: forsake.RSA_X931_PADDING };
            var fn = function () { forsake.encrypt('cats', a_pkcs8, opts); };
            expect(fn).to.throw(RsaError, 'Encrypt operation failed');
        });

    });

    describe('when mixing up key types', function () {

        it('should throw for an unexpected private key', function () {
            var fn = function () { forsake.encrypt('lolcats', a_pkey); };
            expect(fn).to.throw(RsaError, 'Unable to load public key');
        });

        it('should throw for an unexpected public key', function () {
            var fn = function () { forsake.sign('lolcats', a_pkcs8); };
            expect(fn).to.throw(RsaError, 'Unable to load private key');
        });

    });

    describe('when using passphrase protected keys', function () {

        var correct = { key: a_pass, passphrase: 'helloworld' };

        it('should support decrypting', function () {
            var payload = fixture('encrypted.txt');
            var out = forsake.decrypt(payload, correct).toString('utf8');
            expect(out).to.equal('encrypted lolcats');
        });

        it('should support signing', function () {
            var payload = fixture('signed.txt');
            var out = forsake.sign('signed lolcats', correct);
            expect(out.toString()).to.equal(payload.toString());
        });

        it('should throw for an incorrect passphrase', function () {
            var incorrect = { key: a_pass, passphrase: 'goodbyeworld' };
            var payload = fixture('encrypted.txt');
            var fn = function () { forsake.decrypt(payload, incorrect); };
            expect(fn).to.throw(RsaError, 'Unable to load private key');
        });

        it('should throw for a missing passphrase', function () {
            var payload = fixture('encrypted.txt');
            var fn = function () { forsake.decrypt(payload, a_pass); };
            expect(fn).to.throw(RsaError, 'Unable to load private key');
        });

    });

    describe('when using the wrong keys', function () {

        it('should throw while decrypting', function () {
            var payload = fixture('encrypted.txt');
            var fn = function () { forsake.decrypt(payload, b_pkey); };
            expect(fn).to.throw(RsaError, 'Decrypt operation failed');
        });

        it('should throw while verifying', function () {
            var payload = fixture('signed.txt');
            var fn = function () { forsake.verify(payload, b_pkcs8); };
            expect(fn).to.throw(RsaError, 'Verify operation failed');
        });

        it('should throw while decrypting with OAEP', function () {
            var payload = fixture('encrypted_oaep.txt');
            var opts = { padding: forsake.RSA_PKCS1_OAEP_PADDING };
            var fn = function () { forsake.decrypt(payload, b_pkey, opts); };
            expect(fn).to.throw(RsaError, 'Decrypt operation failed');
        });

        it('should throw while verifying with X9.31', function () {
            var payload = fixture('signed_x931.txt');
            var opts = { padding: forsake.RSA_X931_PADDING };
            var fn = function () { forsake.verify(payload, b_pkcs8, opts); };
            expect(fn).to.throw(RsaError, 'Verify operation failed');
        });

    });

    describe('when using RSA keys', function () {

        it('should support encrypting', function () {
            var out = forsake.encrypt('lolcats', a_pkcs1);
            expect(out).to.have.length(256);
        });

        it('should support verifying', function () {
            var payload = fixture('signed.txt');
            var out = forsake.verify(payload, a_pkcs1).toString('utf8');
            expect(out).to.equal('signed lolcats');
        });

    });

    describe('when using X509 keys', function () {

        it('should support encrypting', function () {
            var out = forsake.encrypt('lolcats', a_x509);
            expect(out).to.have.length(256);
        });

        it('should support verifying', function () {
            var payload = fixture('signed.txt');
            var out = forsake.verify(payload, a_x509).toString('utf8');
            expect(out).to.equal('signed lolcats');
        });

    });

    describe('when using invalid keys', function () {

        var invalid = 'watevenisthis?';

        it('should throw while encrypting', function () {
            var fn = function () { forsake.encrypt('lolcats', invalid); };
            expect(fn).to.throw(RsaError, 'Unable to load public key');
        });

        it('should throw while decrypting', function () {
            var payload = fixture('encrypted.txt');
            var fn = function () { forsake.decrypt(payload, invalid); };
            expect(fn).to.throw(RsaError, 'Unable to load private key');
        });

        it('should throw while signing', function () {
            var fn = function () { forsake.sign('lolcats', invalid); };
            expect(fn).to.throw(RsaError, 'Unable to load private key');
        });

        it('should throw while verifying', function () {
            var payload = fixture('signed.txt');
            var fn = function () { forsake.verify(payload, invalid); };
            expect(fn).to.throw(RsaError, 'Unable to load public key');
        });

    });

});
