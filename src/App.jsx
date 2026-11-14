import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { courseData } from './data/course054192Data'
import { evaluateResponse } from './services/localRubricEngine'
import { translations } from './i18n/translations'

const STORAGE_KEY = 'polimi-oral-platform'
const DEMO_ANSWER = 'The EDFA provides optical gain through stimulated emission. Its noise figure and ASE noise determine the OSNR, which in a cascade is calculated by adding inverse OSNR contributions. Saturation limits the output power and changes the gain.'

function readState() {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved ? JSON.parse(saved) : { ...courseData, role: null, language: 'IT', activeExam: null }
}

function App() {
  const [state, setState] = useState(readState)
  const [view, setView] = useState(state.role || 'login')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const t = useMemo(() => translations[state.language], [state.language])
  const update = (patch) => setState((current) => ({ ...current, ...patch }))
  const reset = () => {
    const fresh = { ...courseData, role: null, language: state.language, activeExam: null }
    setState(fresh)
    setView('login')
  }
  const signIn = (role) => {
    update({ role })
    setView(role)
  }

  if (!state.role || view === 'login') {
    return <Login language={state.language} t={t} onLanguage={(language) => update({ language })} onSignIn={signIn} />
  }

  return (
    <div className="app-shell">
      <TopHeader state={state} t={t} view={view} onLanguage={(language) => update({ language })} onView={setView} onLogout={() => { update({ role: null }); setView('login') }} />
      {view === 'student' ? (
        <StudentPortal state={state} t={t} onUpdate={update} />
      ) : (
        <FacultyPortal state={state} t={t} onUpdate={update} />
      )}
      <footer className="footer">
        <span>Politecnico di Milano · 054192 · {t.footer}</span>
        <button className="link-button" onClick={reset}>{t.reset}</button>
      </footer>
    </div>
  )
}

function Login({ language, t, onLanguage, onSignIn }) {
  return (
    <main className="login-page">
      <div className="login-top">
        <div className="brand-mark">POLIMI</div>
        <LanguageToggle language={language} onLanguage={onLanguage} />
      </div>
      <div className="login-intro">
        <span className="eyebrow">SERVIZI ONLINE · ESAMI ORALI</span>
        <h1>{t.appTitle}</h1>
        <p>{t.loginSubtitle}</p>
      </div>
      <div className="login-grid">
        <LoginCard type="student" t={t} onSignIn={onSignIn} />
        <LoginCard type="faculty" t={t} onSignIn={onSignIn} />
      </div>
      <p className="login-note">CAS gateway demo · Sessione locale senza trasmissione di dati</p>
    </main>
  )
}

function LoginCard({ type, t, onSignIn }) {
  const student = type === 'student'
  return (
    <section className="login-card">
      <div className={`role-icon ${student ? 'blue' : 'navy'}`}>{student ? 'ST' : 'DR'}</div>
      <span className="eyebrow">{student ? t.studentPortal : t.facultyPortal}</span>
      <h2>{student ? t.studentLogin : t.facultyLogin}</h2>
      <p className="muted">{student ? t.studentDescription : t.facultyDescription}</p>
      <div className="credential-list">
        <label>{student ? t.personCode : t.professor}</label>
        <strong className={student ? 'mono' : ''}>{student ? '10849210' : 'Prof. Stefano Bregni'}</strong>
        <label>{student ? t.matricola : t.courseLabel}</label>
        <strong className={student ? 'mono' : ''}>{student ? '234910' : '054192 — Optical and Transport Networks'}</strong>
        <label>{student ? t.degree : t.roleLabel}</label>
        <strong>{student ? 'M.Sc. Telecommunication Engineering' : t.courseHolder}</strong>
      </div>
      <button className="primary-button full" onClick={() => onSignIn(student ? 'student' : 'faculty')}>
        {student ? t.signInStudent : t.signInFaculty}
      </button>
    </section>
  )
}

function TopHeader({ state, t, view, onLanguage, onView, onLogout }) {
  return (
    <header className="top-header">
      <div className="header-brand">
        <div className="crest">MI</div>
        <div><strong>POLITECNICO DI MILANO</strong><small>{t.appTitle}</small></div>
      </div>
      <div className="course-banner"><span className="mono">054192</span><span>{t.courseName}</span></div>
      <div className="header-actions">
        <LanguageToggle language={state.language} onLanguage={onLanguage} />
        <div className="role-switch">
          <button className={view === 'student' ? 'active' : ''} onClick={() => onView('student')}>{t.studentView}</button>
          <button className={view === 'faculty' ? 'active' : ''} onClick={() => onView('faculty')}>{t.facultyView}</button>
        </div>
        <button className="logout-button" onClick={onLogout}>{t.logout}</button>
      </div>
    </header>
  )
}

function LanguageToggle({ language, onLanguage }) {
  return <div className="language-toggle"><button className={language === 'IT' ? 'active' : ''} onClick={() => onLanguage('IT')}>IT</button><button className={language === 'EN' ? 'active' : ''} onClick={() => onLanguage('EN')}>EN</button></div>
}

function StudentPortal({ state, t, onUpdate }) {
  const [tab, setTab] = useState('prep')
  const [question, setQuestion] = useState(state.questions[0])
  const [response, setResponse] = useState('')
  const [report, setReport] = useState(null)
  const [camera, setCamera] = useState(false)
  const tabs = [['prep', t.material], ['mock', t.mockOral], ['official', t.officialExam]]
  const addQuestion = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const text = form.get('question')
    if (!text) return
    onUpdate({ questions: [{ id: Date.now(), text, date: new Date().toISOString().slice(0, 10), difficulty: 'Medium', asked: 1, trap: form.get('trap') || 'Clarify the governing assumption.' }, ...state.questions] })
    event.currentTarget.reset()
  }
  const submitExam = (transcript) => {
    const exam = { id: Date.now(), candidate: 'Marco Rossi', matricola: '234910', status: 'pending', score: 24, transcript, markers: [{ time: '00:32', label: t.verifiedFormulation, tone: 'success' }, { time: '02:14', label: t.incompleteProof, tone: 'warning' }], submittedAt: new Date().toISOString() }
    onUpdate({ submissions: [exam, ...state.submissions], activeExam: exam.id })
    setTab('prep')
  }
  return (
    <main className="portal">
      <div className="portal-heading">
        <div><span className="eyebrow">{t.studentArea}</span><h1>{t.studentWelcome}</h1><p>{t.studentIntro}</p></div>
        <div className="status-card"><span className="status-dot" />{t.careerStatus}<strong>{state.graded ? state.graded.grade : t.inPreparation}</strong></div>
      </div>
      <nav className="section-tabs">{tabs.map(([id, label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>)}</nav>
      {tab === 'prep' && <SlideAndArchive state={state} t={t} onUpdate={onUpdate} onAddQuestion={addQuestion} />}
      {tab === 'mock' && <MockOral question={question} setQuestion={setQuestion} response={response} setResponse={setResponse} report={report} setReport={setReport} state={state} t={t} />}
      {tab === 'official' && <OfficialExam t={t} camera={camera} setCamera={setCamera} onSubmit={submitExam} />}
    </main>
  )
}

function SlideAndArchive({ state, t, onUpdate, onAddQuestion }) {
  const upload = (event) => {
    const file = event.target.files[0]
    if (!file) return
    onUpdate({ slides: [...state.slides, { name: file.name, size: `${(file.size / 1024 / 1024).toFixed(2)} MB`, count: Math.max(8, Math.round(file.size / 140000)), uploaded: true }] })
    event.target.value = ''
  }
  return <div className="content-grid">
    <section className="panel wide-panel">
      <PanelHeading eyebrow={t.courseIndex} title={t.slideDecks} action={<label className="secondary-button">{t.uploadSlides}<input type="file" accept=".pdf,.pptx" hidden onChange={upload} /></label>} />
      <div className="deck-list">{state.slides.map((slide) => <div className="deck-row" key={slide.name}><div className="file-type">PDF</div><div className="deck-main"><strong>{slide.name}</strong><span>{slide.count} {t.slides} · {slide.size}</span></div><span className="indexed">{slide.uploaded ? t.uploaded : t.indexed}</span></div>)}</div>
      <div className="notice"><strong>{t.localIndex}</strong><span>{t.localIndexNote}</span></div>
    </section>
    <section className="panel archive-panel">
      <PanelHeading eyebrow={t.archive} title={t.pastQuestions} />
      <div className="question-list">{state.questions.map((item) => <div className="question-item" key={item.id}><div className="question-meta"><span className={`tag ${item.difficulty === 'High' ? 'critical' : item.difficulty === 'Medium' ? 'warning' : 'success'}`}>{item.difficulty}</span><span>{item.date}</span></div><strong>{item.text}</strong><span className="muted">{item.asked}× · {t.followUp}: {item.trap}</span></div>)}</div>
      <form className="question-form" onSubmit={onAddQuestion}><label>{t.submitQuestion}</label><input name="question" placeholder={t.questionPlaceholder} /><input name="trap" placeholder={t.trapPlaceholder} /><button className="primary-button">{t.saveQuestion}</button></form>
    </section>
  </div>
}

function MockOral({ question, setQuestion, response, setResponse, report, setReport, state, t }) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)
  const runRecognition = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition) { setResponse(`${response} ${t.speechUnavailable}`.trim()); return }
    if (listening) {
      recognitionRef.current?.stop()
      return
    }
    const recognition = new Recognition()
    recognitionRef.current = recognition
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0].transcript).join(' ')
      setResponse((current) => `${current} ${transcript}`.trim())
    }
    try { recognition.start() } catch { setListening(false) }
  }
  return <section className="panel mock-panel">
    <div className="mock-top"><div><span className="eyebrow">{t.mockOral}</span><h2>{t.practiceTitle}</h2></div><div className="score-hint"><span>{t.targetTime}</span><strong>05:00</strong></div></div>
    <label className="field-label">{t.selectQuestion}</label><select value={question.id} onChange={(event) => setQuestion(state.questions.find((item) => item.id === Number(event.target.value)))}>{state.questions.map((item) => <option value={item.id} key={item.id}>{item.text}</option>)}</select>
    <div className="prompt-box"><span className="eyebrow">{t.assignedPrompt}</span><strong>{question.text}</strong></div>
    <div className="test-actions"><button className="secondary-button" onClick={() => setResponse(DEMO_ANSWER)}>{t.loadRigorous}</button><button className="ghost-button" onClick={() => setResponse('The EDFA amplifies the signal. There is some noise and the cascade is important.')}>{t.loadIncomplete}</button></div>
    <div className={`response-box ${listening ? 'recording' : ''}`}><textarea value={response} onChange={(event) => setResponse(event.target.value)} placeholder={t.responsePlaceholder} /><div className="response-footer"><span>{listening ? t.listening : t.textOrVoice}</span><button className="mic-button" onClick={runRecognition}>{listening ? t.stop : t.dictate}</button></div></div>
    <button className="primary-button evaluate-button" disabled={!response.trim()} onClick={() => setReport(evaluateResponse(response, question))}>{t.evaluate}</button>
    {report && <Evaluation report={report} t={t} />}
  </section>
}

function Evaluation({ report, t }) {
  return <div className="evaluation"><div className="evaluation-header"><div><span className="eyebrow">{t.localAssessment}</span><h2><span className="grade">{report.grade}/30</span> {t.provisionalGrade}</h2></div><span className={`tag ${report.grade >= 27 ? 'success' : 'warning'}`}>{report.grade >= 27 ? t.strongPerformance : t.reviewRequired}</span></div><div className="rubric-bars">{Object.entries(report.scores).map(([label, value]) => <div key={label}><div className="bar-label"><span>{t[label] || label}</span><b>{value}%</b></div><div className="bar"><i style={{ width: `${value}%` }} /></div></div>)}</div><div className="evaluation-columns"><div><h3>{t.verifiedConcepts}</h3>{report.verified.map((item) => <p className="result success-text" key={item}>+ {item}</p>)}</div><div><h3>{t.gaps}</h3>{report.gaps.map((item) => <p className="result critical-text" key={item}>! {item}</p>)}</div></div><div className="follow-up"><span className="eyebrow">{t.predictedFollowUp}</span><strong>{report.followUp}</strong></div></div>
}

function OfficialExam({ t, camera, setCamera, onSubmit }) {
  const [transcript, setTranscript] = useState('')
  const [cameraError, setCameraError] = useState(false)
  const [streamReady, setStreamReady] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [recordingUrl, setRecordingUrl] = useState('')
  const [micListening, setMicListening] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const recognitionRef = useRef(null)
  useEffect(() => {
    if (!camera) {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      return undefined
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      return undefined
    }
    let active = true
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
      if (!active) {
        mediaStream.getTracks().forEach((track) => track.stop())
        return
      }
      streamRef.current = mediaStream
      setCameraError(false)
      setStreamReady(true)
      if (videoRef.current) videoRef.current.srcObject = mediaStream
    }).catch(() => {
      if (active) {
        setCameraError(true)
        setStreamReady(false)
      }
    })
    return () => {
      active = false
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [camera])
  useEffect(() => {
    if (streamReady && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [streamReady])
  useEffect(() => () => {
    recorderRef.current?.stop()
    recognitionRef.current?.stop()
    clearInterval(timerRef.current)
    if (recordingUrl) URL.revokeObjectURL(recordingUrl)
  }, [recordingUrl])
  const fill = () => setTranscript('[00:12] The EDFA compensates attenuation through stimulated emission.\n[00:32] The cascade OSNR is computed from inverse contributions.\n[02:14] I would need to revisit the wavelength continuity constraint.')
  const toggleMic = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition) {
      setTranscript((current) => `${current}${current ? '\n' : ''}[00:00] ${t.speechUnavailable}`)
      return
    }
    if (micListening) {
      recognitionRef.current?.stop()
      return
    }
    const recognition = new Recognition()
    recognitionRef.current = recognition
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.onstart = () => setMicListening(true)
    recognition.onend = () => setMicListening(false)
    recognition.onerror = () => setMicListening(false)
    recognition.onresult = (event) => {
      const text = Array.from(event.results).map((result) => result[0].transcript).join(' ')
      setTranscript((current) => `${current}${current ? '\n' : ''}[${formatTime(recordingSeconds)}] ${text}`)
    }
    try { recognition.start() } catch { setMicListening(false) }
  }
  const startRecording = () => {
    if (!streamRef.current || !window.MediaRecorder) return
    const mimeType = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find((type) => MediaRecorder.isTypeSupported(type))
    try {
      chunksRef.current = []
      const recorder = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : undefined)
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data) }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' })
        if (recordingUrl) URL.revokeObjectURL(recordingUrl)
        setRecordingUrl(URL.createObjectURL(blob))
      }
      recorder.start(1000)
      recorderRef.current = recorder
      setRecording(true)
      setRecordingSeconds(0)
      timerRef.current = setInterval(() => setRecordingSeconds((seconds) => {
        if (seconds >= 300) {
          recorder.stop()
          clearInterval(timerRef.current)
          setRecording(false)
          return 300
        }
        return seconds + 1
      }), 1000)
    } catch {
      setCameraError(true)
    }
  }
  const stopRecording = () => {
    if (!recorderRef.current || recorderRef.current.state === 'inactive') return
    recorderRef.current.stop()
    clearInterval(timerRef.current)
    setRecording(false)
  }
  const cameraAvailable = Boolean(navigator.mediaDevices?.getUserMedia)
  return <section className="exam-room"><div className="exam-video panel"><div className="video-stage">{camera && streamReady && !cameraError && cameraAvailable ? <video ref={videoRef} autoPlay muted playsInline className="camera-feed" /> : <div className="camera-fallback"><div className="camera-frame">CAM</div><strong>{cameraError ? t.cameraDenied : t.cameraUnavailable}</strong><span>{cameraError ? t.cameraDeniedNote : t.cameraNote}</span></div>}</div><div className="device-status"><span className={streamReady ? 'live-indicator' : 'offline-indicator'} />{streamReady ? t.devicesReady : t.devicesRequired}</div><div className="video-controls"><button className="secondary-button" onClick={() => { if (!camera) setCameraError(false); setCamera(!camera) }}>{camera ? t.disableCamera : t.enableCamera}</button><button className={`record-button ${recording ? 'is-recording' : ''}`} disabled={!streamReady || !window.MediaRecorder} onClick={recording ? stopRecording : startRecording}>{recording ? t.stopRecording : t.startRecording}</button><span className="recording-time"><i className={recording ? 'pulse' : ''} />{formatTime(recordingSeconds)} / 05:00</span><button className={`ghost-button ${micListening ? 'active-control' : ''}`} onClick={toggleMic}>{micListening ? t.stopMic : t.mic}</button></div>{recordingUrl && <div className="recording-review"><span>{t.recordingReady}</span><a className="secondary-button" href={recordingUrl} download="polimi-oral-exam.webm">{t.downloadRecording}</a></div>}<div className="assigned-exam"><span className="eyebrow">{t.assignedPrompt}</span><strong>Explain the OSNR cascade formula and the main physical limits of EDFA amplifiers.</strong></div></div><div className="exam-notes panel"><PanelHeading eyebrow={t.officialExam} title={t.transcriptTitle} action={<button className="secondary-button" onClick={fill}>{t.loadTranscript}</button>} /><textarea value={transcript} onChange={(event) => setTranscript(event.target.value)} placeholder={t.transcriptPlaceholder} /><label className="field-label">{t.formulaScratchpad}</label><div className="scratchpad">OSNR<sub>out</sub><sup>-1</sup> = OSNR<sub>in</sub><sup>-1</sup> + NF · (G - 1) / G</div><button className="primary-button full" disabled={!transcript} onClick={() => onSubmit(transcript)}>{t.submitOfficial}</button></div></section>
}

function formatTime(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

function FacultyPortal({ state, t, onUpdate }) {
  const [selected, setSelected] = useState(state.submissions[0] || state.queue[0])
  const [grade, setGrade] = useState('28')
  const [notes, setNotes] = useState('')
  const candidate = selected || state.queue[0]
  const register = () => onUpdate({ graded: { id: candidate.id, grade: grade === 'lode' ? '30 e Lode' : `${grade}/30`, notes }, queue: state.queue.map((item) => item.id === candidate.id ? { ...item, status: 'graded', score: Number(grade) || 30 } : item), submissions: state.submissions.map((item) => item.id === candidate.id ? { ...item, status: 'graded', score: Number(grade) || 30 } : item) })
  return <main className="portal faculty-portal"><div className="portal-heading"><div><span className="eyebrow">{t.facultyArea}</span><h1>{t.facultyWelcome}</h1><p>{t.facultyIntro}</p></div><div className="session-chip"><span className="status-dot" />{t.examSession}<strong>{t.winterCall}</strong></div></div><div className="faculty-grid"><section className="panel queue-panel"><PanelHeading eyebrow={t.examQueue} title={t.candidates} /><div className="queue-list">{[...state.submissions, ...state.queue].map((item) => <button className={`queue-item ${candidate.id === item.id ? 'selected' : ''}`} key={item.id} onClick={() => setSelected(item)}><div className="avatar">{item.candidate.split(' ').map((part) => part[0]).join('')}</div><div><strong>{item.candidate}</strong><span className="mono">{item.matricola}</span></div><div className="queue-score"><b>{item.score}/30</b><span className={item.status === 'graded' ? 'success-text' : 'warning-text'}>{item.status === 'graded' ? t.registered : t.waiting}</span></div></button>)}</div></section><section className="panel review-panel"><PanelHeading eyebrow={t.examRecording} title={candidate.candidate} action={<span className="mono">{candidate.matricola}</span>} /><div className="simulated-video"><div className="camera-frame">EXAM</div><div className="waveform">{[18, 30, 44, 26, 52, 35, 62, 30, 48, 24, 42, 34, 55, 22, 38, 28, 48, 32, 58].map((height, index) => <i style={{ height }} key={index} />)}</div><span>03:10 / 05:00</span></div><div className="markers"><span className="eyebrow">{t.timelineMarkers}</span>{(candidate.markers || state.queue[0].markers).map((marker) => <button className={`marker ${marker.tone}`} key={marker.time}><span className="mono">[{marker.time}]</span>{marker.label}</button>)}</div><div className="transcript-preview"><span className="eyebrow">{t.transcriptTitle}</span><p>{candidate.transcript || t.simulatedTranscript}</p></div></section><section className="panel copilot-panel"><PanelHeading eyebrow={t.committee} title={t.followUpQuestions} /><div className="follow-up-list"><FollowUp title={t.threshold} text="What is the role of the noise figure in the OSNR cascade?" /><FollowUp title={t.analytical} text="Derive the inverse OSNR relationship for two cascaded amplifiers." /><FollowUp title={t.honors} text="Discuss the trade-off between gain flattening and nonlinear penalties in WDM." /></div><div className="grade-form"><span className="eyebrow">{t.verbale}</span><h3>{t.registerGrade}</h3><select value={grade} onChange={(event) => setGrade(event.target.value)}>{Array.from({ length: 13 }, (_, index) => 18 + index).map((value) => <option value={value} key={value}>{value}/30</option>)}<option value="lode">30 e Lode</option></select><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={t.notesPlaceholder} /><button className="primary-button full" onClick={register}>{t.signGrade}</button></div></section></div></main>
}

function FollowUp({ title, text }) { return <div className="follow-up-item"><span>{title}</span><strong>{text}</strong></div> }
function PanelHeading({ eyebrow, title, action }) { return <div className="panel-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{action}</div> }

export { TopHeader, Login as CasLoginGateway, StudentPortal, SlideAndArchive, MockOral as MockOralStudio, OfficialExam as OfficialExamRoom, FacultyPortal as DocentePortal }
export default App
