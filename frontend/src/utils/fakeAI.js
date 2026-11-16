// Nakli AI: tone aur platform ke hisab se ek post banata hai.
// Baad me ye asli AI API se replace ho jayega.

const templates = {
  Professional: (topic) =>
    `We're pleased to announce: ${topic}.\n\nOur team has worked hard to deliver real value to our customers, and we would love to hear your thoughts.\n\nLearn more through the link in our bio.`,
  Friendly: (topic) =>
    `Hey everyone! 👋\n\nBig news: ${topic}! We're so excited to share this with you. 💜\n\nTell us what you think in the comments!`,
  Funny: (topic) =>
    `Breaking news (our mom already knows): ${topic} 😄\n\nWe promise it's more exciting than your Monday meeting. Go check it out! 🚀`,
}

const hashtags = {
  Instagram: '#instagood #smallbusiness #newpost',
  LinkedIn: '#business #growth #innovation',
  Facebook: '#community #news #update',
}

export function generateReply(topic, tone, platform) {
  const post = `${templates[tone](topic)}\n\n${hashtags[platform]}`
  const intro = `Here's a ${tone.toLowerCase()} ${platform} post for you:`
  return { intro, post }
}