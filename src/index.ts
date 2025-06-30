import { Terra } from 'terra-api';
import { Sleep, Proof } from './types';

const DLP_ID = 20;

const terraclient = new Terra(
    process.env.TERRA_API_KEY!,
    process.env.TERRA_DEV_ID!,
    process.env.TERRA_SECRET!
);

async function validate(sleep: Sleep): Promise<Proof> {
    const valid = await checkValidity(sleep);
    const quality = checkQuality(sleep);
    const uniqueness = await checkUniqueness(sleep);

    var score = 0;
    if (valid) {
        score = (quality + uniqueness) / 2;
    }
    return {
        score: score,
        dlpId: DLP_ID,
        metadata: {
            valid: valid,
            quality: quality,
            uniqueness: uniqueness,
        },
    }
}

// Check if the user exists in Terra
async function checkValidity(sleep: Sleep): Promise<boolean> {
    const response = await terraclient.getUser({userID: sleep.user.user_id, referenceID: sleep.user.reference_id});

    return response.user.user_id == sleep.user.user_id;
}

// Check the quality of the sleep data by checking the number of non-null fields
function checkQuality(sleep: Sleep): number {
    let quality = 0;
    let totalFields = 0;
    let nonNullFields = 0;

    // Check sleep durations data
    const durations = sleep.sleep_durations_data;
    totalFields += Object.keys(durations.other).length;
    totalFields += Object.keys(durations.awake).length; 
    totalFields += Object.keys(durations.asleep).length;
    totalFields += 1; // For hypnogram samples
    totalFields += 1; // For sleep efficiency

    // Count non-null fields in other
    nonNullFields += durations.other.duration_in_bed_seconds != null ? 1 : 0;
    nonNullFields += durations.other.duration_unmeasurable_sleep_seconds != null ? 1 : 0;

    // Count non-null fields in awake
    nonNullFields += durations.awake.duration_short_interruption_seconds != null ? 1 : 0;
    nonNullFields += durations.awake.duration_awake_state_seconds != null ? 1 : 0;
    nonNullFields += durations.awake.duration_long_interruption_seconds != null ? 1 : 0;
    nonNullFields += durations.awake.num_wakeup_events != null ? 1 : 0;
    nonNullFields += durations.awake.wake_up_latency_seconds != null ? 1 : 0;
    nonNullFields += durations.awake.num_out_of_bed_events != null ? 1 : 0;
    nonNullFields += durations.awake.sleep_latency_seconds != null ? 1 : 0;

    // Count non-null fields in asleep
    nonNullFields += durations.asleep.duration_light_sleep_state_seconds != null ? 1 : 0;
    nonNullFields += durations.asleep.duration_asleep_state_seconds != null ? 1 : 0;
    nonNullFields += durations.asleep.num_REM_events != null ? 1 : 0;
    nonNullFields += durations.asleep.duration_REM_sleep_state_seconds != null ? 1 : 0;
    nonNullFields += durations.asleep.duration_deep_sleep_state_seconds != null ? 1 : 0;

    // Count hypnogram samples and sleep efficiency
    nonNullFields += durations.hypnogram_samples.length > 0 ? 1 : 0;
    nonNullFields += durations.sleep_efficiency != null ? 1 : 0;

    // Calculate quality score as percentage of non-null fields
    return nonNullFields / totalFields;
}

// Check if the user has not updated their data in the last 24 hours
async function checkUniqueness(sleep: Sleep): Promise<number> {
    const response = await terraclient.getUser({userID: sleep.user.user_id});

    if (response.user.last_webhook_update == null) {
        return 1;
    }

    const lastUpdate = new Date(response.user.last_webhook_update).getTime();
    const twentyFourHoursAgo = new Date().getTime() - (24 * 60 * 60 * 1000);

    if (lastUpdate < twentyFourHoursAgo) {
        // Force update webhook to track last data fetch
        await terraclient.getSleep({
            userId: sleep.user.user_id,
            startDate: new Date(lastUpdate),
            endDate: new Date(),
            toWebhook: true,
            withSamples: true,
        });
        return 1;
    }

    return 0;
}

export { validate };
