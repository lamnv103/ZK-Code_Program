pragma circom 2.0.0;

include "circuits/poseidon.circom";
include "circuits/comparators.circom";

// Main circuit to check if user has sufficient balance for transfer
template BalanceCheck() {
    // Private inputs (only user knows)
    signal input balance;        // User's actual balance
    signal input nonce;          // Random nonce for commitment
    signal input salt;           // Salt for additional security

    // Public inputs (server and everyone can see)
    signal input transferAmount;         // Amount to transfer
    signal input balanceCommitment;      // Hash commitment of balance
    signal input nullifierHash;          // Hash to prevent double spending

    // Outputs
    signal output isValid;               // 1 if proof is valid, 0 if not
    signal output newBalanceCommitment;  // Commitment of new balance after transfer
    
    // Components
    component hasher = Poseidon(3);      // Hash 3 inputs
    component newHasher = Poseidon(3);   // Hash for new balance
    component geq = GreaterEqThan(64);   // Compare balance >= transfer amount
    component nullifierHasher = Poseidon(2); // Create nullifier hash
    
    // 1. Check balance >= transfer amount
    geq.in[0] <== balance;
    geq.in[1] <== transferAmount;
    
    // 2. Verify balance commitment
    hasher.inputs[0] <== balance;
    hasher.inputs[1] <== nonce;
    hasher.inputs[2] <== salt;
    
    // Check commitment matches public input
    balanceCommitment === hasher.out;
    
    // 3. Create nullifier hash to prevent double spending
    nullifierHasher.inputs[0] <== balance;
    nullifierHasher.inputs[1] <== salt;
    nullifierHash === nullifierHasher.out;
    
    // 4. Calculate new balance after transfer
    signal newBalance;
    newBalance <== balance - transferAmount;
    
    // 5. Create commitment for new balance
    newHasher.inputs[0] <== newBalance;
    newHasher.inputs[1] <== nonce + 1;  // Increment nonce
    newHasher.inputs[2] <== salt;
    newBalanceCommitment <== newHasher.out;
    
    // 6. Output result
    isValid <== geq.out;
}

// Main component
component main = BalanceCheck();
