import { expect } from 'chai';

import { decrypt, encrypt, generateKey } from '../../../server/lib/encryption';

describe('server/lib/encryption', () => {
  it('it encrypts and decrypts ok', () => {
    const message = 'OpenCollective Rules';
    const buff = Buffer.from(message);
    const key = generateKey();

    const encrypted = encrypt(buff, key);

    expect(Buffer.isBuffer(encrypted)).to.be.true;

    expect(encrypted).to.not.eq(message);

    const result = decrypt(encrypted, key);

    expect(result).to.eq(message);
  });
});
