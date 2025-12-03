import { z } from "zod";

export const ScoreSubmissionSchema = z.object({
  userId: z.string().min(1, "userId is required."),
  score: z
    .number()
    .int()
    .positive("Score must be a positive number.")
    .max(1000000000),
});

export type ScoreSubmissionPayload = z.infer<typeof ScoreSubmissionSchema>;
