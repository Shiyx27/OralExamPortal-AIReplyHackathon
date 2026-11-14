const rubric = {
  required: ['edfa', 'gain', 'ase', 'osnr', 'cascade', 'saturation'],
  labels: { edfa: 'EDFA gain mechanism', gain: 'Stimulated emission and gain', ase: 'ASE noise / noise figure', osnr: 'OSNR cascade relationship', cascade: 'Inverse OSNR contributions', saturation: 'Gain saturation limit' }
}

export function evaluateResponse(response) {
  const normalized = response.toLowerCase()
  const found = rubric.required.filter((keyword) => normalized.includes(keyword))
  const missing = rubric.required.filter((keyword) => !found.includes(keyword))
  const completeness = Math.round((found.length / rubric.required.length) * 100)
  const grade = Math.max(18, Math.min(30, Math.round(18 + completeness * 0.12)))
  return {
    grade,
    scores: { theoretical: Math.min(100, completeness + 4), mathematical: Math.min(100, completeness - (normalized.includes('inverse') ? 0 : 16)), alignment: Math.min(100, completeness + (normalized.includes('slide') ? 8 : 0)) },
    verified: found.map((keyword) => rubric.labels[keyword]),
    gaps: missing.length ? missing.map((keyword) => `${rubric.labels[keyword]} — Lecture_03_EDFA_Gain_and_OSNR.pdf, Slides ${keyword === 'osnr' || keyword === 'cascade' ? '24–31' : '14–18'}`) : ['No critical concept gap identified.'],
    followUp: missing.includes('saturation') ? 'What is the physical meaning of EDFA gain saturation and how does it affect OSNR in a cascade?' : 'How would you validate the OSNR cascade result experimentally at the receiver?'
  }
}
