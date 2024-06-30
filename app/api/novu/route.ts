import { serve } from "@novu/framework/next";
import { aiDigest } from "@/lib/novu/workflows";

export const { GET, POST, OPTIONS } = serve({ workflows: [aiDigest] });
