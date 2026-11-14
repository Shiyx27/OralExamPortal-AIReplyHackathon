export const courseData = {
  slides: [
    { name: 'Lecture_03_EDFA_Gain_and_OSNR.pdf', count: 42, size: '4.8 MB' },
    { name: 'Lecture_06_WDM_Nonlinearities_FWM_SPM.pdf', count: 38, size: '5.2 MB' },
    { name: 'Lecture_09_ILP_Routing_VWP_WP.pdf', count: 54, size: '6.1 MB' },
    { name: 'Lecture_11_SDH_SONET_Sync_Pointers.pdf', count: 46, size: '4.4 MB' }
  ],
  questions: [
    { id: 1, text: 'Derive the OSNR of a cascade of optical amplifiers and discuss the noise figure.', date: '2025-02-14', difficulty: 'High', asked: 8, trap: 'What changes when the first amplifier is saturated?' },
    { id: 2, text: 'Explain Four-Wave Mixing and the phase-matching condition in WDM.', date: '2025-06-27', difficulty: 'High', asked: 6, trap: 'Why does chromatic dispersion reduce the efficiency?' },
    { id: 3, text: 'Compare Virtual Wavelength Path and Wavelength Path continuity constraints.', date: '2025-09-10', difficulty: 'Medium', asked: 5, trap: 'Formulate the unsplittable flow constraint.' },
    { id: 4, text: 'Describe the STM-1 frame and AU-4 pointer justification.', date: '2024-07-18', difficulty: 'Medium', asked: 4, trap: 'Distinguish wander from jitter.' },
    { id: 5, text: 'How does EDFA gain saturation affect a WDM link budget?', date: '2024-02-22', difficulty: 'Low', asked: 3, trap: 'Which parameter is monitored at the receiver?' }
  ],
  queue: [
    { id: 101, candidate: 'Giulia Bianchi', matricola: '234811', status: 'pending', score: 26, markers: [{ time: '00:28', label: 'Exact OSNR cascade equation', tone: 'success' }, { time: '01:55', label: 'Omitted FWM phase-matching condition', tone: 'warning' }, { time: '03:10', label: 'Vague on ILP wavelength continuity', tone: 'critical' }] },
    { id: 102, candidate: 'Luca Ferri', matricola: '234755', status: 'graded', score: 30, markers: [{ time: '00:45', label: 'Complete derivation', tone: 'success' }] },
    { id: 103, candidate: 'Sara Conti', matricola: '234902', status: 'pending', score: 21, markers: [{ time: '02:12', label: 'Hesitation on pointer justification', tone: 'warning' }] }
  ],
  submissions: [],
  graded: null
}
