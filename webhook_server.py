from flask import Flask, request, jsonify
import hmac
import hashlib
import json
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv('VITE_SUPABASE_URL'),
    os.getenv('VITE_SUPABASE_ANON_KEY')
)

# Razorpay webhook secret
RAZORPAY_WEBHOOK_SECRET = os.getenv('VITE_RAZORPAY_WEBHOOK_SECRET')

def verify_razorpay_signature(payload: str, signature: str) -> bool:
    """Verify the Razorpay webhook signature."""
    key = RAZORPAY_WEBHOOK_SECRET.encode()
    msg = payload.encode()
    digest = hmac.new(key, msg, hashlib.sha256).hexdigest()
    return hmac.compare_digest(digest, signature)

def get_tokens_for_amount(amount: float) -> int:
    """Get the number of tokens for a given amount in USD."""
    try:
        # Fetch system settings to get tokens_per_dollar
        response = supabase.table('system_settings').select('pricing').single().execute()
        if response.data:
            tokens_per_dollar = response.data['pricing']['tokens_per_dollar']
            return int(amount * tokens_per_dollar)
    except Exception as e:
        print(f"Error fetching system settings: {e}")
    return 0

@app.route('/webhook/razorpay', methods=['POST'])
def razorpay_webhook():
    try:
        # Get the webhook payload and signature
        payload = request.get_data().decode('utf-8')
        signature = request.headers.get('X-Razorpay-Signature')

        if not signature:
            return jsonify({'error': 'No signature provided'}), 400

        # Verify the webhook signature
        if not verify_razorpay_signature(payload, signature):
            return jsonify({'error': 'Invalid signature'}), 400

        # Parse the webhook payload
        event = json.loads(payload)
        event_type = event.get('event')

        if event_type == 'payment.captured':
            payment = event.get('payload', {}).get('payment', {})
            entity = payment.get('entity', {})
            
            # Extract payment details
            payment_id = entity.get('id')
            amount = float(entity.get('amount', 0)) / 100  # Convert from cents to dollars
            user_id = entity.get('notes', {}).get('user_id')
            order_id = entity.get('order_id')

            if not all([payment_id, amount, user_id, order_id]):
                return jsonify({'error': 'Missing required payment details'}), 400

            # Calculate tokens to add
            tokens_to_add = get_tokens_for_amount(amount)

            if tokens_to_add <= 0:
                return jsonify({'error': 'Invalid token amount'}), 400

            # Update user's token balance
            try:
                response = supabase.rpc(
                    'increment_tokens',
                    {
                        'user_id': user_id,
                        'amount': tokens_to_add
                    }
                ).execute()

                if response.error:
                    raise Exception(response.error)

                # Log the successful transaction
                supabase.table('transactions').insert({
                    'user_id': user_id,
                    'payment_id': payment_id,
                    'order_id': order_id,
                    'amount': amount,
                    'tokens': tokens_to_add,
                    'status': 'completed'
                }).execute()

                return jsonify({
                    'message': 'Payment processed successfully',
                    'tokens_added': tokens_to_add
                }), 200

            except Exception as e:
                print(f"Error updating token balance: {e}")
                return jsonify({'error': 'Failed to update token balance'}), 500

        return jsonify({'message': 'Event processed'}), 200

    except Exception as e:
        print(f"Webhook error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 