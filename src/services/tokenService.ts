import { supabase } from '../lib/supabaseClient';

interface TokenCost {
  model: string;
  cost: number;
}

interface SystemSettings {
  pricing: {
    token_costs: {
      [key: string]: number;
    };
  };
}

export class TokenService {
  private static async getSystemSettings(): Promise<SystemSettings> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('pricing')
      .single();

    if (error) {
      console.error('Error fetching system settings:', error);
      throw new Error('Failed to fetch system settings');
    }

    return data;
  }

  static async checkAndDeductTokens(model: string): Promise<boolean> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error getting current user:', userError);
        throw new Error('Failed to get current user');
      }
      
      if (!user) {
        throw new Error('User must be logged in to use this feature');
      }

      // Fetch system settings for token costs
      const settings = await this.getSystemSettings();
      const cost = settings.pricing.token_costs[model];
      
      if (!cost) {
        throw new Error('Invalid model specified');
      }

      // Check if user has enough tokens
      const { data: userData, error: balanceError } = await supabase
        .from('users')
        .select('tokens')
        .eq('id', user.id)
        .single();

      if (balanceError) {
        console.error('Error fetching user balance:', balanceError);
        throw new Error('Failed to fetch user token balance');
      }

      if (!userData) {
        console.error('No user data found for ID:', user.id);
        throw new Error('User data not found');
      }

      if (userData.tokens < cost) {
        throw new Error('Insufficient tokens');
      }

      // Deduct tokens
      const { error: updateError } = await supabase.rpc('increment_tokens', {
        user_id: user.id,
        amount: -cost
      });

      if (updateError) {
        console.error('Error updating token balance:', updateError);
        throw new Error('Failed to update token balance');
      }

      // Log the API usage
      const { error: logError } = await supabase.rpc('log_api_usage', {
        p_user_id: user.id,
        p_endpoint: 'api_call',
        p_model: model,
        p_tokens_used: cost,
        p_status: 'success'
      });

      if (logError) {
        console.error('Failed to log API usage:', logError);
      }

      return true;
    } catch (error) {
      console.error('Token service error:', error);
      throw error;
    }
  }

  static async logApiError(model: string, error: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const settings = await this.getSystemSettings();
      const cost = settings.pricing.token_costs[model];
      if (!cost) return;

      await supabase.rpc('log_api_usage', {
        p_user_id: user.id,
        p_endpoint: 'api_call',
        p_model: model,
        p_tokens_used: cost,
        p_status: 'error',
        p_error_message: error
      });
    } catch (error) {
      console.error('Error logging API error:', error);
    }
  }

  static async getTokenCost(model: string): Promise<number> {
    try {
      const settings = await this.getSystemSettings();
      return settings.pricing.token_costs[model] || 0;
    } catch (error) {
      console.error('Error fetching token cost:', error);
      return 0;
    }
  }
} 