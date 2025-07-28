import * as snarkjs from "snarkjs"
import { poseidon } from "circomlib"

export class ZKPService {
  private static instance: ZKPService
  private wasmPath: string
  private zkeyPath: string
  private vkeyPath: string

  constructor() {
    this.wasmPath = "/circuits/transfer.wasm"
    this.zkeyPath = "/circuits/circuit_final.zkey"
    this.vkeyPath = "/circuits/verification_key.json"
  }

  static getInstance(): ZKPService {
    if (!ZKPService.instance) {
      ZKPService.instance = new ZKPService()
    }
    return ZKPService.instance
  }

  // Tạo Poseidon hash
  poseidonHash(inputs: bigint[]): bigint {
    return poseidon(inputs)
  }

  // Tạo balance commitment
  generateBalanceCommitment(balance: bigint, nonce: bigint, salt: bigint): bigint {
    return this.poseidonHash([balance, nonce, salt])
  }

  // Tạo nullifier hash để tránh double spending
  generateNullifierHash(balance: bigint, salt: bigint): bigint {
    return this.poseidonHash([balance, salt])
  }

  // Tạo input cho circuit
  generateCircuitInput(
    balance: bigint,
    transferAmount: bigint,
    nonce: bigint,
    salt: bigint,
  ): {
    balance: string
    nonce: string
    salt: string
    transferAmount: string
    balanceCommitment: string
    nullifierHash: string
  } {
    const balanceCommitment = this.generateBalanceCommitment(balance, nonce, salt)
    const nullifierHash = this.generateNullifierHash(balance, salt)

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

  // Generate ZK proof cho balance check
  async generateBalanceProof(
    balance: bigint,
    transferAmount: bigint,
    nonce: bigint,
    salt: bigint,
  ): Promise<{
    proof: any
    publicSignals: string[]
    isValid: boolean
    newBalanceCommitment: string
  }> {
    try {
      // Kiểm tra số dư trước khi tạo proof
      if (balance < transferAmount) {
        throw new Error("Insufficient balance for transfer")
      }

      const input = this.generateCircuitInput(balance, transferAmount, nonce, salt)

      console.log("Generating balance proof with input:", {
        transferAmount: input.transferAmount,
        balanceCommitment: input.balanceCommitment,
        nullifierHash: input.nullifierHash,
      })

      const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, this.wasmPath, this.zkeyPath)

      // Parse public signals
      // [0] = transferAmount, [1] = balanceCommitment, [2] = nullifierHash,
      // [3] = isValid, [4] = newBalanceCommitment
      const isValid = publicSignals[3] === "1"
      const newBalanceCommitment = publicSignals[4]

      return {
        proof: {
          pi_a: proof.pi_a.slice(0, 2),
          pi_b: proof.pi_b.slice(0, 2),
          pi_c: proof.pi_c.slice(0, 2),
        },
        publicSignals: publicSignals.map((s: any) => s.toString()),
        isValid,
        newBalanceCommitment,
      }
    } catch (error) {
      console.error("Error generating balance proof:", error)
      throw new Error("Failed to generate ZK balance proof")
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
  }> {
    try {
      const vkeyResponse = await fetch(this.vkeyPath)
      const vKey = await vkeyResponse.json()

      const isProofValid = await snarkjs.groth16.verify(vKey, publicSignals, proof)

      if (!isProofValid) {
        throw new Error("Invalid ZK proof")
      }

      // Parse public signals
      const transferAmount = publicSignals[0]
      const balanceCommitment = publicSignals[1]
      const nullifierHash = publicSignals[2]
      const circuitValid = publicSignals[3] === "1"
      const newBalanceCommitment = publicSignals[4]

      if (!circuitValid) {
        throw new Error("Circuit validation failed - insufficient balance")
      }

      return {
        isValid: true,
        transferAmount,
        balanceCommitment,
        nullifierHash,
        newBalanceCommitment,
      }
    } catch (error) {
      console.error("Error verifying balance proof:", error)
      return {
        isValid: false,
        transferAmount: "0",
        balanceCommitment: "",
        nullifierHash: "",
        newBalanceCommitment: "",
      }
    }
  }

  // Tạo proof cho frontend (với encrypted balance)
  async createTransferProof(
    encryptedBalance: string,
    transferAmount: bigint,
    userPrivateKey: string,
  ): Promise<{
    proof: any
    publicSignals: string[]
    balanceCommitment: string
    nullifierHash: string
    newBalanceCommitment: string
  }> {
    try {
      // Trong thực tế, decrypt balance bằng private key
      // Ở đây demo với balance cố định
      const balance = BigInt(1000) // Simulated decrypted balance
      const nonce = BigInt(Math.floor(Math.random() * 1000000))
      const salt = BigInt(Math.floor(Math.random() * 1000000))

      const result = await this.generateBalanceProof(balance, transferAmount, nonce, salt)

      return {
        proof: result.proof,
        publicSignals: result.publicSignals,
        balanceCommitment: result.publicSignals[1],
        nullifierHash: result.publicSignals[2],
        newBalanceCommitment: result.newBalanceCommitment,
      }
    } catch (error) {
      console.error("Error creating transfer proof:", error)
      throw error
    }
  }
}
