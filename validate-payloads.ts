import { createClient } from '@supabase/supabase-js';
import { startOfYear } from 'date-fns';
import { SleepSchema, Sleep } from './types';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

async function downloadPayload(payloadId: string): Promise<Sleep | undefined> {
  const promise = supabase
    .storage
    .from('terra-payloads')
    .download(`sleep/${payloadId}.json`)
    .then(async (payloadData) => {
      if (!payloadData.error && payloadData.data) {
        // Parse blob into json
        const payloadJson = JSON.parse(await payloadData.data.text())
        return payloadJson
      }
      return undefined
    })
    .catch((error) => {
      console.error(error)
      return undefined
    })
  return promise
}

/**
 * Downloads and validates user data for a given reference ID
 * @param referenceId The user's reference ID
 * @returns Validated user payload data or null if validation fails
 */
async function downloadAndValidateUserData(referenceId: string): Promise<Sleep[] | null> {
  try {
    // Get all terra users associated with this reference ID
    const { data, error } = await supabase
      .from('terra_users')
      .select('*')
      .eq('reference_id', referenceId);

    if (error || !data?.length) {
      console.error('No users found for reference ID:', referenceId);
      return null;
    }

    // For each terra user, get their sleep data
    const { data: payloads, error: payloadError } = await supabase
      .from('terra_data_payloads')
      .select('*')
      .in('user_id', data.map(user => user.user_id))
      .gte('created_at', startOfYear)
      .order('created_at', { ascending: false })

    if (payloadError || !payloads?.length) {
      console.error('No payloads found for users:', data.map(user => user.user_id));
      return null;
    }

    // For each user, download their sleep data
    const sleepData: Sleep[] = [];
    for (const payload of payloads) {
      try {
        const sleepPayload = await downloadPayload(payload.payload_id);
        if (sleepPayload) {
          // Validate sleep payload schema
          const sleep = SleepSchema.parse(sleepPayload);
          sleepData.push(sleep);
        } 
      } catch (error) {
        // Handle invalid payloads
        console.error('Error downloading and validating sleep payload:', error);
      }
    }

    return sleepData;
  } catch (error) {
    console.error('Error downloading user data:', error);
    return null;
  }
}


// Example usage
downloadAndValidateUserData('your-reference-id')
  .then(data => {
    // Do something with the data
  })
  .catch(error => {
    // handle error
  })
