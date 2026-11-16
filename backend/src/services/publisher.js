import crypto from 'node:crypto'

// NAKLI publishing (simulated).
// Asli Facebook / LinkedIn API baad me sirf is ek function me lagegi,
// scheduler ka baqi code badalne ki zaroorat nahi paregi.
//
// Test ke liye: post ke text me ye tag likho to publishing jaan boojh kar fail hogi
//   [simulate-fail]           -> har platform par fail
//   [simulate-fail:linkedin]  -> sirf LinkedIn par fail
const FAIL_TAG = /\[simulate-fail(?::(\w+))?\]/i

export async function publishToPlatform({ post, account }) {
  // Asli API call me thora waqt lagta hai, uski nakal
  await new Promise((resolve) => setTimeout(resolve, 300))

  const match = post.content.match(FAIL_TAG)
  if (match && (!match[1] || match[1].toLowerCase() === account.platform)) {
    throw new Error(`${account.platform} rejected the post (simulated)`)
  }

  return { externalId: `sim-${account.platform}-${crypto.randomUUID().slice(0, 8)}` }
}