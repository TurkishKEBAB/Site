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
      assertions: {
        "categories:performance": ["error", { minScore: 0.65 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.85 }],
        "categories:seo": ["warn", { minScore: 0.9 }],
      },
    },
  },
};
