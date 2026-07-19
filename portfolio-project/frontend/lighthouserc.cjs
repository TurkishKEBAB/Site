const vercelBypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

module.exports = {
  ci: {
    ...(vercelBypassSecret
      ? {
          collect: {
            settings: {
              extraHeaders: JSON.stringify({
                "x-vercel-protection-bypass": vercelBypassSecret,
                "x-vercel-set-bypass-cookie": "true",
              }),
            },
          },
        }
      : {}),
    assert: {
      preset: "lighthouse:recommended",
      assertions: {
        "categories:performance": ["warn", { minScore: 0.75 }],
        "categories:accessibility": ["warn", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.85 }],
        "categories:seo": ["warn", { minScore: 0.9 }],
      },
    },
  },
};
