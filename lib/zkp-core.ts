import * as snarkjs from "snarkjs";
import * as circomlib from "circomlibjs"
import crypto from "crypto";

export interface ZKProofInput {
  balance: bigint;
  transferAmount: bigint;
  nonce: bigint;
  salt: bigint;
}

export interface ZKProofOutput {
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
  };
  publicSignals: string[];
  balanceCommitment: string;
  nullifierHash: string;
  newBalanceCommitment: string;
}

export interface VerificationResult {
  isValid: boolean;
  transferAmount: string;
  balanceCommitment: string;
  nullifierHash: string;
  newBalanceCommitment: string;
  verificationTime: number;
}

export class ZKProofCore {
  private static instance: ZKProofCore;
  private wasmPath: string;
  private zkeyPath: string;
  private vkeyPath: string;
  private poseidon: any;

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Private constructor for initializing paths to cryptographic circuit files.
 * These paths are used for generating and verifying zero-knowledge proofs.
 * - `wasmPath`: Path to the WebAssembly file for the balance check circuit.
 * - `zkeyPath`: Path to the proving key file for the circuit.
 * - `vkeyPath`: Path to the verification key file for the circuit.
 */

/*******  c34b5aa2-01f9-4951-a5dd-65cae591a52d  *******/
  private constructor() {
    this.wasmPath = "/circuits/balance_check.wasm";
    this.zkeyPath = "/circuits/circuit_final.zkey";
    this.vkeyPath = "/circuits/verification_key.json";
  }

  static async getInstance(): Promise<ZKProofCore> {
    if (!ZKProofCore.instance) {
      const core = new ZKProofCore();
      await core.init(); // load poseidon here
      ZKProofCore.instance = core;
    }
    return ZKProofCore.instance;
  }

  private async init() {
    this.poseidon = await circomlib.buildPoseidon();
  }

  poseidonHash(inputs: bigint[]): bigint {
    const hash = this.poseidon(inputs);
    return this.poseidon.F.toObject(hash);
  }

  generateBalanceCommitment(balance: bigint, nonce: bigint, salt: bigint): bigint {
    return this.poseidonHash([balance, nonce, salt]);
  }

  generateNullifierHash(balance: bigint, salt: bigint): bigint {
    return this.poseidonHash([balance, salt]);
  }

  generateNewBalanceCommitment(newBalance: bigint, nonce: bigint, salt: bigint): bigint {
    return this.poseidonHash([newBalance, nonce + BigInt(1), salt]);
  }

  createCircuitInput(input: ZKProofInput) {
    const balanceCommitment = this.generateBalanceCommitment(input.balance, input.nonce, input.salt);
    const nullifierHash = this.generateNullifierHash(input.balance, input.salt);

    return {
      balance: input.balance.toString(),
      nonce: input.nonce.toString(),
      salt: input.salt.toString(),
      transferAmount: input.transferAmount.toString(),
      balanceCommitment: balanceCommitment.toString(),
      nullifierHash: nullifierHash.toString(),
    };
  }

  async generateProof(input: ZKProofInput): Promise<ZKProofOutput> {
    if (input.balance < input.transferAmount) {
      throw new Error("Insufficient balance");
    }

    const circuitInput = this.createCircuitInput(input);

    console.log("🔐 Generating ZK Proof:", circuitInput);

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      circuitInput,
      this.wasmPath,
      this.zkeyPath
    );

    const isValid = publicSignals[3] === "1";
    if (!isValid) {
      throw new Error("Circuit validation failed");
    }

    return {
      proof: {
        pi_a: proof.pi_a.slice(0, 2),
        pi_b: proof.pi_b.slice(0, 2),
        pi_c: proof.pi_c.slice(0, 2),
      },
      publicSignals: publicSignals.map((s: any) => s.toString()),
      balanceCommitment: publicSignals[1],
      nullifierHash: publicSignals[2],
      newBalanceCommitment: publicSignals[4],
    };
  }

  async verifyProof(proof: any, publicSignals: string[]): Promise<VerificationResult> {
    const startTime = Date.now();

    try {
      const vkeyResponse = await fetch(this.vkeyPath);
      if (!vkeyResponse.ok) {
        throw new Error("Failed to load verification key");
      }
      const vKey = await vkeyResponse.json();

      const isValidProof = await snarkjs.groth16.verify(vKey, publicSignals, proof);

      if (!isValidProof || publicSignals[3] !== "1") {
        throw new Error("Invalid ZK Proof");
      }

      return {
        isValid: true,
        transferAmount: publicSignals[0],
        balanceCommitment: publicSignals[1],
        nullifierHash: publicSignals[2],
        newBalanceCommitment: publicSignals[4],
        verificationTime: Date.now() - startTime,
      };
    } catch (err) {
      console.error("❌ Verification error:", err);
      return {
        isValid: false,
        transferAmount: "0",
        balanceCommitment: "",
        nullifierHash: "",
        newBalanceCommitment: "",
        verificationTime: Date.now() - startTime,
      };
    }
  }

  generateRandomValues() {
    return {
      nonce: BigInt("0x" + crypto.randomBytes(16).toString("hex")),
      salt: BigInt("0x" + crypto.randomBytes(16).toString("hex")),
    };
  }

  ethToWei(eth: string): bigint {
    return BigInt(Math.floor(parseFloat(eth) * 1e18));
  }

  weiToEth(wei: bigint): string {
    return (Number(wei) / 1e18).toFixed(8);
  }
}
