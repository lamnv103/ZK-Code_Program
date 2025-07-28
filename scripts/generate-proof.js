const snarkjs = require("snarkjs")
const circomlib = require("circomlib")
const fs = require("fs")

// Poseidon hash function
function poseidonHash(inputs) {
  return circomlib.poseidon(inputs)
}

// Generate circuit input
function generateCircuitInput(balance, transferAmount, nonce, salt) {
  const balanceCommitment = poseidonHash([balance, nonce, salt])
  const nullifierHash = poseidonHash([balance, salt])

  return {
    // Private inputs
    balance: balance.toString(),
    nonce: nonce.toString(),
    salt: salt.toString(),

    // Public inputs
    transferAmount: transferAmount.toString(),
    balanceCommitment: balanceCommitment.toString(),
    nullifierHash: nullifierHash.toString(),
  }
}

async function generateProof() {
  console.log("🚀 Generating ZK Proof for Balance Check...")

  try {
    // Test case 1: Đủ số dư (should pass)
    console.log("\n📋 Test Case 1: Sufficient Balance")
    const balance1 = BigInt(1000)
    const transferAmount1 = BigInt(100)
    const nonce1 = BigInt(12345)
    const salt1 = BigInt(67890)

    const input1 = generateCircuitInput(balance1, transferAmount1, nonce1, salt1)
    console.log("Input:", {
      balance: input1.balance,
      transferAmount: input1.transferAmount,
      balanceCommitment: input1.balanceCommitment.substring(0, 20) + "...",
      nullifierHash: input1.nullifierHash.substring(0, 20) + "...",
    })

    // Generate witness
    console.log("⚙️  Generating witness...")
    const { witness } = await snarkjs.wtns.calculate(input1, "build/transfer.wasm", "build/witness.wtns")

    // Generate proof
    console.log("🔐 Generating proof...")
    const { proof, publicSignals } = await snarkjs.groth16.prove("build/circuit_final.zkey", "build/witness.wtns")

    console.log("✅ Proof generated successfully!")
    console.log("Public Signals:", publicSignals)

    // Verify proof
    console.log("🔍 Verifying proof...")
    const vKey = JSON.parse(fs.readFileSync("verification_key.json"))
    const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof)

    console.log("Verification result:", isValid ? "✅ VALID" : "❌ INVALID")

    // Save proof and public signals
    fs.writeFileSync("build/proof.json", JSON.stringify(proof, null, 2))
    fs.writeFileSync("build/public.json", JSON.stringify(publicSignals, null, 2))

    console.log("💾 Proof saved to build/proof.json")
    console.log("💾 Public signals saved to build/public.json")

    // Test case 2: Không đủ số dư (should fail)
    console.log("\n📋 Test Case 2: Insufficient Balance")
    const balance2 = BigInt(50)
    const transferAmount2 = BigInt(100)
    const nonce2 = BigInt(12345)
    const salt2 = BigInt(67890)

    const input2 = generateCircuitInput(balance2, transferAmount2, nonce2, salt2)
    console.log("Input:", {
      balance: input2.balance,
      transferAmount: input2.transferAmount,
      balanceCommitment: input2.balanceCommitment.substring(0, 20) + "...",
    })

    try {
      const { witness: witness2 } = await snarkjs.wtns.calculate(input2, "build/transfer.wasm", "build/witness2.wtns")

      const { proof: proof2, publicSignals: publicSignals2 } = await snarkjs.groth16.prove(
        "build/circuit_final.zkey",
        "build/witness2.wtns",
      )

      const isValid2 = await snarkjs.groth16.verify(vKey, publicSignals2, proof2)
      console.log("Verification result:", isValid2 ? "✅ VALID" : "❌ INVALID")
      console.log("isValid signal:", publicSignals2[3]) // Should be 0
    } catch (error) {
      console.log("❌ Expected error for insufficient balance:", error.message)
    }
  } catch (error) {
    console.error("❌ Error generating proof:", error)
  }
}

// Run the proof generation
generateProof()
  .then(() => {
    console.log("\n🎉 Proof generation completed!")
  })
  .catch(console.error)
