const crypto = require('crypto');

/**
 * Seeded Fisher-Yates shuffle — deterministic given the same seed.
 */
const seededShuffle = (arr, seed) => {
  const result = [...arr];
  let hash = parseInt(seed.slice(0, 8), 16);
  for (let i = result.length - 1; i > 0; i--) {
    hash = (hash * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(hash) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Assigns a unique topic set to each student.
 *
 * Rules:
 *  - Distribution is deterministic: same assignmentId → same result
 *  - No two students with consecutive roll numbers share the same set
 *  - Balanced: topic sets are distributed as evenly as possible
 *
 * @param {string[]} studentRollNumbers - sorted ascending
 * @param {object[]} topicSets          - [{ setLabel, questions, difficultyLevel }]
 * @param {string}   assignmentId
 * @returns {{ [rollNumber]: topicSetIndex }}
 */
const distributeTopics = (studentRollNumbers, topicSets, assignmentId) => {
  if (!topicSets.length) throw new Error('No topic sets defined');

  const seed = crypto.createHash('sha256').update(assignmentId).digest('hex');
  const shuffledSets = seededShuffle([...Array(topicSets.length).keys()], seed);

  const mapping = {};
  const sorted  = [...studentRollNumbers].sort();

  sorted.forEach((roll, i) => {
    let idx = shuffledSets[i % shuffledSets.length];

    // Prevent adjacent roll numbers from getting the same set
    if (i > 0) {
      const prev = mapping[sorted[i - 1]];
      if (idx === prev) {
        idx = (idx + 1) % topicSets.length;
      }
    }

    mapping[roll] = idx;
  });

  return mapping; // { rollNumber: topicSetIndex }
};

module.exports = { distributeTopics };
