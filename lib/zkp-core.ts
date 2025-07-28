import * as snarkjs from "snarkjs"
import { poseidon } from "circomlib"

export interface ZKProofInput {
  balance: string
  nonce: string
  salt: string
  transferAmount: string
  balanceCommitment: string
  nullifierHash: string
}

export interface ZKProofOutput {
  proof: any
  publicSignals: string[]
  isValid: boolean
  newBalanceCommitment: string
  verificationTime: number
}

export class ZKProofCore {
  private static instance: ZKProofCore
  private wasmPath = "/circuits/transfer.wasm"
  private zkeyPath = "/circuits/circuit_final.zkey"
  private vkeyPath = "/circuits/verification_key.json"

  static getInstance(): ZKProofCore {
    if (!ZKProofCore.instance) {
      ZKProofCore.instance = new ZKProofCore()
    }
    return ZKProofCore.instance
  }

  // Generate Poseidon hash
  poseidonHash(inputs: bigint[]): bigint {
    return poseidon(inputs)
  }

  // Generate balance commitment
  generateBalanceCommitment(balance: bigint, nonce: bigint, salt: bigint): bigint {
    return this.poseidonHash([balance, nonce, salt])
  }

  // Generate nullifier hash to prevent double spending
  generateNullifierHash(balance: bigint, salt: bigint): bigint {
    return this.poseidonHash([balance, salt])
  }

  // Generate circuit input
  generateCircuitInput(balance: bigint, transferAmount: bigint, nonce: bigint, salt: bigint): ZKProofInput {
    const balanceCommitment = this.generateBalanceCommitment(balance, nonce, salt)
    const nullifierHash = this.generateNullifierHash(balance, salt)

    return {
      balance: balance.toString(),
      nonce: nonce.toString(),
      salt: salt.toString(),
      transferAmount: transferAmount.toString(),
      balanceCommitment: balanceCommitment.toString(),
      nullifierHash: nullifierHash.toString(),
    }
  }

  // Generate ZK proof for balance check
  async generateBalanceProof(
    balance: bigint,
    transferAmount: bigint,
    nonce: bigint,
    salt: bigint,
  ): Promise<ZKProofOutput> {
    const startTime = Date.now()

    try {
      // Check balance sufficiency before generating proof
      if (balance < transferAmount) {
        throw new Error("Insufficient balance for transfer")
      }

      const input = this.generateCircuitInput(balance, transferAmount, nonce, salt)

      console.log("🔐 Generating ZK proof with input:", {
        transferAmount: input.transferAmount,
        balanceCommitment: input.balanceCommitment.substring(0, 20) + "...",
        nullifierHash: input.nullifierHash.substring(0, 20) + "...",
      })

      // Generate proof using snarkjs
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, this.wasmPath, this.zkeyPath)

      const verificationTime = Date.now() - startTime

      // Parse public signals
      // [0] = transferAmount, [1] = balanceCommitment, [2] = nullifierHash,
      // [3] = isValid, [4] = newBalanceCommitment
      const isValid = publicSignals[3] === "1"
      const newBalanceCommitment = publicSignals[4]

      console.log("✅ ZK proof generated successfully in", verificationTime, "ms")

      return {
        proof: {
          pi_a: proof.pi_a.slice(0, 2),
          pi_b: proof.pi_b.slice(0, 2),
          pi_c: proof.pi_c.slice(0, 2),
        },
        publicSignals: publicSignals.map((s: any) => s.toString()),
        isValid,
        newBalanceCommitment,
        verificationTime,
      }
    } catch (error) {
      console.error("❌ Error generating ZK proof:", error)
      throw new Error(`Failed to generate ZK balance proof: ${error}`)
    }
  }

  // Verify ZK proof
  async verifyBalanceProof(
    proof: any,
    publicSignals: string[],
  ): Promise<{
    isValid: boolean
    transferAmount: string
    balanceCommitment: string
    nullifierHash: string
    newBalanceCommitment: string
    verificationTime: number
  }> {
    const startTime = Date.now()

    try {
      // Load verification key
      const vkeyResponse = await fetch(this.vkeyPath)
      if (!vkeyResponse.ok) {
        throw new Error("Failed to load verification key")
      }
      const vKey = await vkeyResponse.json()

      // Verify proof
      const isProofValid = await snarkjs.groth16.verify(vKey, publicSignals, proof)
      const verificationTime = Date.now() - startTime

      if (!isProofValid) {
        console.log("❌ ZK proof verification failed")
        return {
          isValid: false,
          transferAmount: "0",
          balanceCommitment: "",
          nullifierHash: "",
          newBalanceCommitment: "",
          verificationTime,
        }
      }

      // Parse public signals
      const transferAmount = publicSignals[0]
      const balanceCommitment = publicSignals[1]
      const nullifierHash = publicSignals[2]
      const circuitValid = publicSignals[3] === "1"
      const newBalanceCommitment = publicSignals[4]

      if (!circuitValid) {
        console.log("❌ Circuit validation failed - insufficient balance")
        return {
          isValid: false,
          transferAmount,
          balanceCommitment,
          nullifierHash,
          newBalanceCommitment,
          verificationTime,
        }
      }

      console.log("✅ ZK proof verified successfully in", verificationTime, "ms")

      return {
        isValid: true,
        transferAmount,
        balanceCommitment,
        nullifierHash,
        newBalanceCommitment,
        verificationTime,
      }
    } catch (error) {
      console.error("❌ Error verifying ZK proof:", error)
      return {
        isValid: false,
        transferAmount: "0",
        balanceCommitment: "",
        nullifierHash: "",
        newBalanceCommitment: "",
        verificationTime: Date.now() - startTime,
      }
    }
  }

  // Create transfer proof for frontend
  async createTransferProof(
    balance: bigint,
    transferAmount: bigint,
  ): Promise<{
    proof: any
    publicSignals: string[]
    balanceCommitment: string
    nullifierHash: string
    newBalanceCommitment: string
    metadata: {
      nonce: string
      salt: string
      verificationTime: number
    }
  }> {
    try {
      // Generate random nonce and salt for privacy
      const nonce = BigInt(Math.floor(Math.random() * 1000000))
      const salt = BigInt(Math.floor(Math.random() * 1000000))

      const result = await this.generateBalanceProof(balance, transferAmount, nonce, salt)

      return {
        proof: result.proof,
        publicSignals: result.publicSignals,
        balanceCommitment: result.publicSignals[1],
        nullifierHash: result.publicSignals[2],
        newBalanceCommitment: result.newBalanceCommitment,
        metadata: {
          nonce: nonce.toString(),
          salt: salt.toString(),
          verificationTime: result.verificationTime,
        },
      }
    } catch (error) {
      console.error("❌ Error creating transfer proof:", error)
      throw error
    }
  }
}
