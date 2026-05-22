import type { CompanyBrand } from "../lib/companyLogos";

function brand(
  name: string,
  slug: string,
  color: string,
  domain: string,
  bg?: string
): CompanyBrand {
  return {
    name,
    slug,
    color,
    domain,
    bg: bg ?? `color-mix(in srgb, ${color} 12%, transparent)`,
  };
}

/** Hero strip — top hiring destinations */
export const HERO_COMPANIES: CompanyBrand[] = [
  brand("Google", "google", "#4285F4", "google.com"),
  brand("Amazon", "amazon", "#FF9900", "amazon.com"),
  brand("Microsoft", "microsoft", "#00A4EF", "microsoft.com"),
  brand("Meta", "meta", "#0467DF", "meta.com"),
  brand("Apple", "apple", "#555555", "apple.com"),
  brand("Netflix", "netflix", "#E50914", "netflix.com"),
  brand("Stripe", "stripe", "#635BFF", "stripe.com"),
];

/** Pricing trust marquee */
export const PRICING_COMPANIES: CompanyBrand[] = [
  brand("Google", "google", "#4285F4", "google.com"),
  brand("Meta", "meta", "#0467DF", "meta.com"),
  brand("Amazon", "amazon", "#FF9900", "amazon.com"),
  brand("Apple", "apple", "#555555", "apple.com"),
  brand("Stripe", "stripe", "#635BFF", "stripe.com"),
  brand("Netflix", "netflix", "#E50914", "netflix.com"),
  brand("Airbnb", "airbnb", "#FF5A5F", "airbnb.com"),
  brand("Microsoft", "microsoft", "#00A4EF", "microsoft.com"),
  brand("Uber", "uber", "#000000", "uber.com"),
  brand("LinkedIn", "linkedin", "#0A66C2", "linkedin.com"),
];

export const SOCIAL_PROOF_ROW1: CompanyBrand[] = [
  brand("Google", "google", "#4285F4", "google.com"),
  brand("Meta", "meta", "#0467DF", "meta.com"),
  brand("Amazon", "amazon", "#FF9900", "amazon.com"),
  brand("Apple", "apple", "#555555", "apple.com"),
  brand("Microsoft", "microsoft", "#00A4EF", "microsoft.com"),
  brand("Netflix", "netflix", "#E50914", "netflix.com"),
  brand("Stripe", "stripe", "#635BFF", "stripe.com"),
  brand("Spotify", "spotify", "#1DB954", "spotify.com"),
  brand("Figma", "figma", "#F24E1E", "figma.com"),
  brand("Adobe", "adobe", "#FF0000", "adobe.com"),
  brand("LinkedIn", "linkedin", "#0A66C2", "linkedin.com"),
  brand("Airbnb", "airbnb", "#FF5A5F", "airbnb.com"),
  brand("Uber", "uber", "#000000", "uber.com"),
  brand("Slack", "slack", "#4A154B", "slack.com"),
  brand("Salesforce", "salesforce", "#00A1E0", "salesforce.com"),
  brand("OpenAI", "openai", "#412991", "openai.com"),
  brand("X", "x", "#000000", "x.com"),
  brand("Shopify", "shopify", "#7AB55C", "shopify.com"),
  brand("Goldman Sachs", "goldmansachs", "#6EB5FF", "goldmansachs.com"),
  brand("JPMorgan", "chase", "#1E6FBB", "jpmorganchase.com"),
  brand("Two Sigma", "twosigma", "#8B5CF6", "twosigma.com"),
  brand("Jane Street", "janestreet", "#F59E0B", "janestreet.com"),
  brand("Citadel", "citadel", "#EF4444", "citadel.com"),
  brand("Palantir", "palantir", "#101828", "palantir.com"),
];

export const SOCIAL_PROOF_ROW2: CompanyBrand[] = [
  brand("Databricks", "databricks", "#FF3621", "databricks.com"),
  brand("Snowflake", "snowflake", "#29B5E8", "snowflake.com"),
  brand("Rippling", "rippling", "#F97316", "rippling.com"),
  brand("Brex", "brex", "#F43F5E", "brex.com"),
  brand("Plaid", "plaid", "#111111", "plaid.com"),
  brand("Robinhood", "robinhood", "#00C805", "robinhood.com"),
  brand("Coinbase", "coinbase", "#0052FF", "coinbase.com"),
  brand("DoorDash", "doordash", "#FF3008", "doordash.com"),
  brand("Instacart", "instacart", "#43B02A", "instacart.com"),
  brand("Lyft", "lyft", "#FF00BF", "lyft.com"),
  brand("Pinterest", "pinterest", "#E60023", "pinterest.com"),
  brand("Snap", "snapchat", "#FFFC00", "snap.com"),
  brand("Discord", "discord", "#5865F2", "discord.com"),
  brand("Dropbox", "dropbox", "#0061FF", "dropbox.com"),
  brand("Box", "box", "#0061D5", "box.com"),
  brand("Twilio", "twilio", "#F22F46", "twilio.com"),
  brand("Cloudflare", "cloudflare", "#F38020", "cloudflare.com"),
  brand("Vercel", "vercel", "#000000", "vercel.com"),
  brand("Supabase", "supabase", "#3FCF8E", "supabase.com"),
  brand("HashiCorp", "hashicorp", "#7B42BC", "hashicorp.com"),
  brand("Datadog", "datadog", "#632CA6", "datadog.com"),
  brand("PagerDuty", "pagerduty", "#06AC38", "pagerduty.com"),
  brand("Okta", "okta", "#007DC1", "okta.com"),
  brand("Zendesk", "zendesk", "#03363D", "zendesk.com"),
  brand("HubSpot", "hubspot", "#FF7A59", "hubspot.com"),
  brand("Asana", "asana", "#F06A6A", "asana.com"),
  brand("Notion", "notion", "#000000", "notion.so"),
  brand("Airtable", "airtable", "#18BFFF", "airtable.com"),
];

export const SOCIAL_PROOF_ROW3: CompanyBrand[] = [
  brand("McKinsey", "mckinsey", "#00539B", "mckinsey.com"),
  brand("Bain & Co.", "bain", "#C41E3A", "bain.com"),
  brand("BCG", "bcg", "#004F59", "bcg.com"),
  brand("Accenture", "accenture", "#A100FF", "accenture.com"),
  brand("Deloitte", "deloitte", "#86BC25", "deloitte.com"),
  brand("IBM", "ibm", "#1F70C1", "ibm.com"),
  brand("Oracle", "oracle", "#F80000", "oracle.com"),
  brand("SAP", "sap", "#0FAAFF", "sap.com"),
  brand("Workday", "workday", "#0875E1", "workday.com"),
  brand("ServiceNow", "servicenow", "#62D84E", "servicenow.com"),
  brand("Nutanix", "nutanix", "#024DA1", "nutanix.com"),
  brand("Palo Alto", "paloaltonetworks", "#FA582D", "paloaltonetworks.com"),
  brand("CrowdStrike", "crowdstrike", "#E2341D", "crowdstrike.com"),
  brand("Splunk", "splunk", "#65A637", "splunk.com"),
  brand("Elastic", "elastic", "#FEC514", "elastic.co"),
  brand("MongoDB", "mongodb", "#47A248", "mongodb.com"),
  brand("Redis", "redis", "#DC382D", "redis.io"),
  brand("Confluent", "confluent", "#023AFF", "confluent.io"),
  brand("Grafana", "grafana", "#F46800", "grafana.com"),
  brand("GitHub", "github", "#181717", "github.com"),
  brand("GitLab", "gitlab", "#FC6D26", "gitlab.com"),
  brand("Atlassian", "atlassian", "#0052CC", "atlassian.com"),
  brand("JetBrains", "jetbrains", "#000000", "jetbrains.com"),
  brand("Canonical", "canonical", "#E95420", "canonical.com"),
  brand("Red Hat", "redhat", "#EE0000", "redhat.com"),
  brand("VMware", "vmware", "#607078", "vmware.com"),
  brand("Broadcom", "broadcom", "#CC0000", "broadcom.com"),
  brand("NVIDIA", "nvidia", "#76B900", "nvidia.com"),
  brand("Qualcomm", "qualcomm", "#3253DC", "qualcomm.com"),
  brand("Intel", "intel", "#0071C5", "intel.com"),
  brand("AMD", "amd", "#ED1C24", "amd.com"),
  brand("Arm", "arm", "#0091BD", "arm.com"),
];

export const SOCIAL_PROOF_ROW4: CompanyBrand[] = [
  brand("Anthropic", "anthropic", "#191919", "anthropic.com"),
  brand("Perplexity", "perplexity", "#20B2AA", "perplexity.ai"),
  brand("Mistral AI", "mistralai", "#FA5200", "mistral.ai"),
  brand("Cohere", "cohere", "#39594D", "cohere.com"),
  brand("Scale AI", "scale", "#7C3AED", "scale.com"),
  brand("Anduril", "anduril", "#4B5563", "anduril.com"),
  brand("SpaceX", "spacex", "#000000", "spacex.com"),
  brand("Tesla", "tesla", "#CC0000", "tesla.com"),
  brand("Waymo", "waymo", "#4C8EF7", "waymo.com"),
  brand("Rivian", "rivian", "#000000", "rivian.com"),
  brand("Canva", "canva", "#00C4CC", "canva.com"),
  brand("Wix", "wix", "#0C6EBD", "wix.com"),
  brand("Squarespace", "squarespace", "#000000", "squarespace.com"),
  brand("WordPress", "wordpress", "#21759B", "wordpress.org"),
  brand("Webflow", "webflow", "#4353FF", "webflow.com"),
  brand("Framer", "framer", "#0055FF", "framer.com"),
  brand("Loom", "loom", "#625DF5", "loom.com"),
  brand("Zoom", "zoom", "#2D8CFF", "zoom.us"),
  brand("Twitch", "twitch", "#9146FF", "twitch.tv"),
  brand("YouTube", "youtube", "#FF0000", "youtube.com"),
  brand("TikTok", "tiktok", "#000000", "tiktok.com"),
  brand("ByteDance", "bytedance", "#1C1C1C", "bytedance.com"),
  brand("Grab", "grab", "#00B14F", "grab.com"),
  brand("Sea Limited", "shopee", "#EE4D2D", "sea.com"),
  brand("Klarna", "klarna", "#FFB3C7", "klarna.com"),
  brand("Revolut", "revolut", "#0075EB", "revolut.com"),
  brand("Chime", "chime", "#1EC677", "chime.com"),
  brand("SoFi", "sofi", "#00A2DF", "sofi.com"),
  brand("Affirm", "affirm", "#0FA0EA", "affirm.com"),
  brand("Marqeta", "marqeta", "#7BCDE8", "marqeta.com"),
];

/** Success stories marquee */
export const SUCCESS_STORIES_ROW1: CompanyBrand[] = SOCIAL_PROOF_ROW1;
export const SUCCESS_STORIES_ROW2: CompanyBrand[] = [
  ...SOCIAL_PROOF_ROW2,
  ...SOCIAL_PROOF_ROW3.filter((c) =>
    ["GitHub", "GitLab", "MongoDB", "NVIDIA", "McKinsey", "Zoom"].includes(c.name)
  ),
  ...SOCIAL_PROOF_ROW4.filter((c) =>
    ["Anthropic", "Scale AI", "SpaceX", "Tesla", "Waymo"].includes(c.name)
  ),
];
