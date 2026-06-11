import base64
import hashlib
import hmac
import json
import os
import time


TOKEN_TTL_SECONDS = 60 * 60 * 12
TOKEN_SECRET = os.getenv("AUTH_TOKEN_SECRET", "local-development-secret")


def _encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode().rstrip("=")


def _decode(data: str) -> bytes:
    return base64.urlsafe_b64decode(data + "=" * (-len(data) % 4))


def create_access_token(user_id: int) -> str:
    payload = json.dumps(
        {"sub": user_id, "exp": int(time.time()) + TOKEN_TTL_SECONDS},
        separators=(",", ":"),
    ).encode()
    encoded_payload = _encode(payload)
    signature = hmac.new(
        TOKEN_SECRET.encode(),
        encoded_payload.encode(),
        hashlib.sha256,
    ).digest()
    return f"{encoded_payload}.{_encode(signature)}"


def verify_access_token(token: str) -> int | None:
    try:
        encoded_payload, encoded_signature = token.split(".", 1)
        expected_signature = hmac.new(
            TOKEN_SECRET.encode(),
            encoded_payload.encode(),
            hashlib.sha256,
        ).digest()
        if not hmac.compare_digest(expected_signature, _decode(encoded_signature)):
            return None

        payload = json.loads(_decode(encoded_payload))
        if int(payload["exp"]) < int(time.time()):
            return None
        return int(payload["sub"])
    except (KeyError, TypeError, ValueError, json.JSONDecodeError):
        return None
