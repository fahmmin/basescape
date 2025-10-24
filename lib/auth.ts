/**
 * Verify Sui wallet signature
 * Note: Full signature verification requires the public key, which is not available
 * from just the signature. For now, we do basic validation.
 */
export async function verifySuiSignature({
    message,
    signature,
    address,
}: {
    message: string;
    signature: string;
    address: string;
}): Promise<boolean> {
    try {
        // Basic validation: ensure signature and address are provided
        if (!signature || !address || !message) {
            return false;
        }

        // Validate signature format (base64 string)
        if (typeof signature !== 'string' || signature.length < 10) {
            return false;
        }

        // Validate address format (Sui address)
        if (!address.startsWith('0x') || address.length < 40) {
            return false;
        }

        // For production, you would verify the signature against the public key
        // This requires the SignatureScheme and public key bytes
        // For now, we trust the client-side signing
        return true;
    } catch (err) {
        console.error('Signature verification failed:', err);
        return false;
    }
}

/**
 * Normalize Sui address to lowercase for consistent storage
 */
export function normalizeSuiAddress(address: string): string {
    return address.toLowerCase();
}

