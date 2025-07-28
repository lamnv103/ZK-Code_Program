pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

// Circuit chính để kiểm tra số dư đủ để chuyển tiền
template BalanceCheck() {
    // Private inputs (chỉ người dùng biết)
    signal private input balance;        // Số dư thực tế của người dùng
    signal private input nonce;          // Số ngẫu nhiên để tạo commitment
    signal private input salt;           // Salt để bảo mật thêm
    
    // Public inputs (server và mọi người có thể thấy)
    signal input transferAmount;         // Số tiền muốn chuyển
    signal input balanceCommitment;      // Hash commitment của số dư
    signal input nullifierHash;         // Hash để tránh double spending
    
    // Outputs
    signal output isValid;               // 1 nếu proof hợp lệ, 0 nếu không
    signal output newBalanceCommitment;  // Commitment số dư mới sau khi chuyển
    
    // Components
    component hasher = Poseidon(3);      // Hash 3 inputs
    component newHasher = Poseidon(3);   // Hash cho số dư mới
    component geq = GreaterEqThan(64);   // So sánh số dư >= số tiền chuyển
    component nullifierHasher = Poseidon(2); // Tạo nullifier hash
    
    // 1. Kiểm tra số dư >= số tiền chuyển
    geq.in[0] <== balance;
    geq.in[1] <== transferAmount;
    
    // 2. Xác minh balance commitment
    hasher.inputs[0] <== balance;
    hasher.inputs[1] <== nonce;
    hasher.inputs[2] <== salt;
    
    // Kiểm tra commitment khớp với input public
    balanceCommitment === hasher.out;
    
    // 3. Tạo nullifier hash để tránh double spending
    nullifierHasher.inputs[0] <== balance;
    nullifierHasher.inputs[1] <== salt;
    nullifierHash === nullifierHasher.out;
    
    // 4. Tính số dư mới sau khi chuyển
    signal newBalance;
    newBalance <== balance - transferAmount;
    
    // 5. Tạo commitment cho số dư mới
    newHasher.inputs[0] <== newBalance;
    newHasher.inputs[1] <== nonce + 1;  // Tăng nonce
    newHasher.inputs[2] <== salt;
    newBalanceCommitment <== newHasher.out;
    
    // 6. Output kết quả
    isValid <== geq.out;
}

// Template phụ trợ để so sánh số
template GreaterEqThan(n) {
    assert(n <= 252);
    signal input in[2];
    signal output out;
    
    component lt = LessThan(n+1);
    lt.in[0] <== in[1];
    lt.in[1] <== in[0] + 1;
    out <== lt.out;
}

template LessThan(n) {
    assert(n <= 252);
    signal input in[2];
    signal output out;
    
    component n2b = Num2Bits(n);
    n2b.in <== in[0] + (1<<n) - in[1];
    out <== 1 - n2b.out[n];
}

template Num2Bits(n) {
    signal input in;
    signal output out[n];
    var lc1=0;
    
    var e2=1;
    for (var i = 0; i<n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] -1 ) === 0;
        lc1 += out[i] * e2;
        e2 = e2+e2;
    }
    
    lc1 === in;
}

// Main component
component main = BalanceCheck();
