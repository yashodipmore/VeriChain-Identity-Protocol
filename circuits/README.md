# VeriChain ZK Circuits

This directory contains Circom circuits for Zero-Knowledge proof generation in VeriChain.

## Circuits

### 1. `credential_commitment.circom`
Proves ownership of a valid credential without revealing the actual data.

**Public Inputs:**
- `commitment` - Hash of credential data
- `credentialType` - Type of credential

**Use Case:** General credential verification

---

### 2. `age_verification.circom`
Proves the user is above a minimum age without revealing their birthdate.

**Public Inputs:**
- `currentTimestamp` - Current Unix timestamp
- `minAge` - Minimum required age in years
- `commitment` - Hash of (birthTimestamp, secret)

**Use Case:** Age-gated services, alcohol/gambling verification

---

### 3. `trust_score_range.circom`
Proves the user's trust score falls within a range without revealing the exact score.

**Public Inputs:**
- `minScore` - Minimum required score
- `maxScore` - Maximum score
- `commitment` - Hash of (actualScore, secret, userAddress)

**Use Case:** DeFi lending eligibility, access control

---

### 4. `degree_verification.circom`
Proves the user holds a university degree without revealing which university.

**Public Inputs:**
- `minDegreeType` - Minimum degree level (1=Bachelor, 2=Master, 3=PhD)
- `commitment` - Hash of (universityId, degreeType, graduationYear, secret)

**Use Case:** Job applications, credential verification

---

### 5. `financial_status.circom`
Proves the user has assets above a threshold without revealing exact balance.

**Public Inputs:**
- `minBalance` - Minimum required balance
- `commitment` - Hash of (actualBalance, assetType, secret)

**Use Case:** Proof of funds, loan eligibility

---

## Setup Instructions

### Prerequisites
```bash
# Install Circom
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
git clone https://github.com/iden3/circom.git
cd circom
cargo build --release
cargo install --path circom

# Install snarkjs
npm install -g snarkjs
```

### Compile Circuit
```bash
# Compile
circom credential_commitment.circom --r1cs --wasm --sym

# Powers of Tau (use existing or generate)
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v

# Setup
snarkjs groth16 setup credential_commitment.r1cs pot12_final.ptau credential_0000.zkey
snarkjs zkey contribute credential_0000.zkey credential_0001.zkey --name="Second contribution" -v
snarkjs zkey export verificationkey credential_0001.zkey verification_key.json
```

### Generate Proof
```javascript
const { groth16 } = require("snarkjs");

const input = {
  commitment: "12345...",
  credentialType: "1",
  secret: "mySecret123",
  nullifier: "uniqueNullifier",
  credentialValue: "100",
  credentialHash: "0x..."
};

const { proof, publicSignals } = await groth16.fullProve(
  input,
  "credential_commitment.wasm",
  "credential_0001.zkey"
);
```

### Verify On-Chain
The `ZKVerifier.sol` contract can verify these proofs on-chain using Groth16 verification.

---

## Integration with Frontend

The `ZKProofGenerator.tsx` component uses simulated proofs for demo purposes.
To use real ZK proofs:

1. Compile circuits and generate proving/verification keys
2. Use snarkjs in the frontend to generate proofs
3. Submit proofs to ZKVerifier contract

```typescript
import * as snarkjs from 'snarkjs';

async function generateProof(inputs: any) {
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    inputs,
    '/circuits/credential_commitment.wasm',
    '/circuits/credential.zkey'
  );
  
  // Format for Solidity
  const calldata = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
  return { proof, publicSignals, calldata };
}
```

---

## Security Notes

1. **Trusted Setup:** Production use requires a proper trusted setup ceremony
2. **Random Secrets:** Always use cryptographically secure random secrets
3. **Nullifiers:** Use unique nullifiers to prevent double-spending proofs
4. **Audit:** Get circuits audited before production deployment
