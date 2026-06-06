const buildAnalysisPrompt = ({ assignmentTitle, assignmentType, studentTopic, submissionText, peerTexts }) => `
You are an expert academic evaluation AI for an engineering college (VJIT, IT Department).

Analyze the student submission below and return ONLY a valid JSON object — no extra text.

## Assignment
Title: ${assignmentTitle}
Type: ${assignmentType}
Student's Assigned Topic: ${studentTopic}

## Student Submission
${submissionText.slice(0, 3000)}

## Peer Submissions (for plagiarism comparison)
${peerTexts.map((t, i) => `Peer ${i + 1}: ${t.slice(0, 500)}`).join('\n\n') || 'None available'}

## Required JSON Response Format
\`\`\`json
{
  "scores": {
    "originalityScore": <0-100>,
    "understandingScore": <0-100>,
    "aiProbabilityScore": <0-100>,
    "qualityScore": <0-100>,
    "overallScore": <0-100>
  },
  "details": {
    "plagiarismMatches": [
      { "peerIndex": 0, "similarityPercent": 45, "matchedSegments": ["..."] }
    ],
    "aiGeneratedProbability": <0-100>,
    "technicalAnalysis": "<brief technical quality assessment>",
    "writingQualityAnalysis": "<brief writing quality assessment>",
    "relevanceAnalysis": "<is the submission relevant to the assigned topic?>",
    "strengths": ["<strength 1>", "<strength 2>"],
    "improvements": ["<improvement 1>", "<improvement 2>"]
  }
}
\`\`\`

Scoring guide:
- originalityScore: 100 = completely original, 0 = fully copied
- understandingScore: depth of technical understanding demonstrated
- aiProbabilityScore: likelihood content was AI-generated (100 = definitely AI)
- qualityScore: overall quality of writing, structure, depth
- overallScore: weighted average
`;

const buildQuestionPrompt = ({ topic, subject, difficulty, questionTypes, count }) => `
You are an expert academic question generator for engineering students.

Generate ${count} unique questions for:
- Subject: ${subject}
- Topic: ${topic}
- Difficulty: ${difficulty}
- Question Types: ${questionTypes.join(', ')}

Return ONLY valid JSON — no extra text.

\`\`\`json
{
  "questions": [
    {
      "type": "mcq",
      "text": "<question text>",
      "options": ["A", "B", "C", "D"],
      "answer": "B",
      "difficulty": "${difficulty}",
      "explanation": "<brief explanation>"
    },
    {
      "type": "short_answer",
      "text": "<question text>",
      "expectedAnswer": "<model answer>",
      "difficulty": "${difficulty}",
      "marks": 5
    }
  ]
}
\`\`\`

Guidelines:
- Questions must be original and exam-appropriate
- MCQ options should be plausible and non-trivial
- Short answers should require analytical thinking
- Avoid repetition
`;

module.exports = { buildAnalysisPrompt, buildQuestionPrompt };
