#!/usr/bin/env python
"""Generate a secure random secret for production use.

Run with: python generate_secrets.py
"""

import secrets


def generate_secret(num_bytes: int = 64) -> str:
    return secrets.token_hex(num_bytes)


if __name__ == "__main__":
    print("\n🔐 Generated Secure Secret for Production\n")
    print("Copy this to your environment variables:\n")
    print("═" * 70)
    print(f"\nJWT_SECRET={generate_secret(64)}")
    print("\n" + "═" * 70)
    print("\n⚠️  Important: Keep this secret secure and never commit it to git!\n")
    print("💡 Tip: Generate a new secret for each environment (dev, staging, prod)\n")
