import { SleepUploadType } from "terra-api/lib/cjs/models/enums/SleepUploadType";
import { z } from "zod";

const Option = <T extends z.ZodTypeAny>(schema: T) => z.union([schema, z.null(), z.undefined()]);

export const SleepSchema = z.object({
  sleep_durations_data: z.object({
    other: z.object({
      duration_in_bed_seconds: Option(z.number()),
      duration_unmeasurable_sleep_seconds: Option(z.number()),
    }),
    sleep_efficiency: Option(z.number()),
    hypnogram_samples: z.array(z.object({
      timestamp: z.string(),
      level: z.number(),
    })),
    awake: z.object({
      duration_short_interruption_seconds: Option(z.number()),
      duration_awake_state_seconds: Option(z.number()),
      duration_long_interruption_seconds: Option(z.number()),
      num_wakeup_events: Option(z.number()),
      wake_up_latency_seconds: Option(z.number()),
      num_out_of_bed_events: Option(z.number()),
      sleep_latency_seconds: Option(z.number()),
    }),
    asleep: z.object({
      duration_light_sleep_state_seconds: Option(z.number()),
      duration_asleep_state_seconds: Option(z.number()),
      num_REM_events: Option(z.number()),
      duration_REM_sleep_state_seconds: Option(z.number()),
      duration_deep_sleep_state_seconds: Option(z.number()),
    }),
  }),
  device_data: z.object({
    name: Option(z.string()),
    other_devices: z.array(z.object({
      name: Option(z.string()),
      manufacturer: Option(z.string()),
      serial_number: Option(z.string()),
      software_version: Option(z.string()),
      hardware_version: Option(z.string())
    }
  )),
    hardware_version: Option(z.string()),
    manufacturer: Option(z.string()),
    software_version: Option(z.string()),
    activation_timestamp: Option(z.string()),
    serial_number: Option(z.string()),
  }),
  metadata: z.object({
    end_time: z.string(),
    start_time: z.string(),
    upload_type: Option(z.nativeEnum(SleepUploadType)),
    is_nap: Option(z.boolean()),
  }),
  heart_rate_data: z.object({
    summary: z.object({
      max_hr_bpm: Option(z.number()),
      avg_hrv_rmssd: Option(z.number()),
      min_hr_bpm: Option(z.number()),
      user_max_hr_bpm: Option(z.number()),
      avg_hr_bpm: Option(z.number()),
      avg_hrv_sdnn: Option(z.number()),
      resting_hr_bpm: Option(z.number()),
    }),
    detailed: z.object({
      hr_samples: z.array(z.object({
        timestamp: z.string(),
        bpm: z.number(),
      })),
      hrv_samples_sdnn: z.array(z.object({
        timestamp: z.string(),
        hrv_sdnn: z.number(),
      })),
      hrv_samples_rmssd: z.array(z.object({
        timestamp: z.string(),
        hrv_rmssd: z.number(),
      })),
    }),
  }),
  temperature_data: z.object({
    delta: Option(z.number()),
  }),
  readiness_data: z.object({
    readiness: Option(z.number()),
    recovery_level: Option(z.number()),
  }),
  respiration_data: z.object({
    breaths_data: z.object({
      min_breaths_per_min: Option(z.number()),
      avg_breaths_per_min: Option(z.number()),
      max_breaths_per_min: Option(z.number()),
      on_demand_reading: Option(z.boolean()),
      end_time: Option(z.string()),
      samples: z.array(z.object({
        timestamp: z.string(),
        breaths_per_min: z.number(),
      })),
      start_time: Option(z.string()),
    }),
    snoring_data: z.object({
      num_snoring_events: Option(z.number()),
      total_snoring_duration_seconds: Option(z.number()),
      end_time: Option(z.string()),
      samples: z.array(z.object({
        timestamp: z.string(),
        duration_seconds: z.number(),
      })),
      start_time: Option(z.string()),
    }),
    oxygen_saturation_data: z.object({
      start_time: Option(z.string()),
      end_time: Option(z.string()),
      samples: z.array(z.object({
        timestamp: z.string(),
        percentage: z.number(),
      })),
    }),
  }),
});

export type Sleep = z.infer<typeof SleepSchema>
