import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, FileAudio2, FileImage, Heart, Info, LockKeyhole, Mic, Upload, X } from 'lucide-react';
import { Link } from 'wouter';
import { registerListener } from '@/services/listenerService';
import type { ContactMethod, ListenerRegistrationData } from '@/types/listenerRegistration';

const categories = ['Fashion & Beauty', 'Arts & Culture', 'Automobile', 'Science', 'Politics', 'Business', 'Travel', 'Entertainment', 'Finance', 'Health & Fitness', 'Social & Community', 'Real Estate', 'Environment', 'News & Media', 'Lifestyle', 'Food & Cooking', 'Sports', 'Insurance'];
const languages = ['Assamese', 'Bengali', 'English', 'Gujarati', 'Hindi', 'Kannada', 'Kashmiri', 'Konkani', 'Maithili', 'Malayalam', 'Manipuri', 'Marathi', 'Nepali', 'Odia', 'Punjabi', 'Santali', 'Sindhi', 'Tamil', 'Telugu', 'Urdu'];
const relatableTopics = ['Career', 'Family', 'Friendship', 'Love & Dating', 'Marriage', 'Mental Wellbeing', 'Parenting', 'Personal Growth', 'Relationship Advice', 'Social Life'];
const steps = ['Basic Details', 'Categories & Expertise', 'Your Story', 'Profile Photo', 'Audio Introduction', 'Availability', 'Pricing', 'KYC Verification', 'Payment Information'];
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const timeSlots = ['Morning 6 AM–12 PM', 'Afternoon 12 PM–6 PM', 'Evening 6 PM–12 AM', 'Night 12 AM–6 AM'];

function initialData(): ListenerRegistrationData {
  return {
    contactMethod: 'phone', contact: '', role: 'Listener', fullName: '', phone: '', dateOfBirth: '', gender: '', state: '', city: '', occupation: '', qualification: '', informationAccurate: false, agreedToTerms: false,
    categories: [], languages: [], relatableTopics: [], lifeExperiences: '', listeningStyle: '', motivation: '', profilePhoto: null, audioIntro: null,
    services: { chat: false, call: false, videoCall: false, available: false },
    schedule: Object.fromEntries(weekdays.map((day) => [day, []])),
    responsePreference: 'Within 5 min', pricing: { chat: 0, audio: 0, introOffer: false },
    kyc: { identity: null, pan: null, selfie: null, address: null },
    bank: { accountHolder: '', bankName: '', accountNumber: '', confirmAccountNumber: '', ifsc: '', upi: '' },
  };
}

function Field({ label, children, required = false, error, className = '' }: { label: string; children: ReactNode; required?: boolean; error?: string; className?: string }) {
  return <div className={`reg-field ${className}`}><label className="field-label">{label}{required && <span className="required-mark" aria-label="required"> *</span>}</label>{children}{error && <p className="field-error" role="alert">{error}</p>}</div>;
}

function TextInput({ label, value, onChange, required, type = 'text', placeholder, error, ...props }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; placeholder?: string; error?: string; [key: string]: unknown }) {
  return <Field label={label} required={required} error={error}><input className="field-input" type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder ?? label} aria-label={label} aria-invalid={Boolean(error)} data-testid={`input-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} {...props as object} /></Field>;
}

function TextArea({ label, value, onChange, required, placeholder, error, minLength }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; placeholder: string; error?: string; minLength?: number }) {
  return <Field label={label} required={required} error={error}><textarea className="field-input field-textarea" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={label} aria-invalid={Boolean(error)} minLength={minLength} data-testid={`input-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} /></Field>;
}

function ChoiceGroup({ label, options, selected, onToggle, multiple = true, error }: { label: string; options: string[]; selected: string[]; onToggle: (value: string) => void; multiple?: boolean; error?: string }) {
  return <div className="reg-field"><p className="field-label">{label} <span className="required-mark">*</span></p><div className="choice-grid" role="group" aria-label={label}>{options.map((option) => <button type="button" key={option} aria-pressed={selected.includes(option)} className={`choice-chip ${selected.includes(option) ? 'selected' : ''}`} onClick={() => onToggle(option)} data-testid={`choice-${option.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}><span>{option}</span>{selected.includes(option) && <Check size={15} />}</button>)}</div>{error && <p className="field-error" role="alert">{error}</p>}</div>;
}

function FilePicker({ label, accept, file, onFile, capture, description, error, testId }: { label: string; accept: string; file: File | null; onFile: (file: File | null) => void; capture?: 'user'; description?: string; error?: string; testId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) { setPreviewUrl(''); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const change = (event: ChangeEvent<HTMLInputElement>) => onFile(event.target.files?.[0] ?? null);
  return <div className="upload-tile">
    <input ref={inputRef} type="file" accept={accept} capture={capture} onChange={change} className="sr-only" aria-label={label} data-testid={testId} />
    <div className="upload-symbol">{previewUrl ? <img src={previewUrl} alt={`Preview of ${label}`} /> : file?.type.startsWith('audio/') ? <FileAudio2 size={22} /> : file ? <FileImage size={22} /> : <Upload size={22} />}</div>
    <div className="upload-copy"><strong>{label}</strong>{description && <span>{description}</span>}{file && <span className="file-name">{file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</span>}</div>
    <button type="button" className="button button-outline upload-button" onClick={() => inputRef.current?.click()} data-testid={`${testId}-trigger`}>{file ? 'Change file' : capture ? 'Take / choose' : 'Choose file'}</button>
    {file && <button type="button" className="file-remove" aria-label={`Remove ${label}`} onClick={() => { onFile(null); if (inputRef.current) inputRef.current.value = ''; }} data-testid={`${testId}-remove`}><X size={17} /></button>}
    {error && <p className="field-error upload-error" role="alert">{error}</p>}
  </div>;
}

export default function ListenerRegistration() {
  const [data, setData] = useState<ListenerRegistrationData>(initialData);
  const [stage, setStage] = useState(0); // 0 contact, 1–9 form, 10 demo confirmation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(30);
  const [recordingError, setRecordingError] = useState('');
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const recordingTimeout = useRef<number | null>(null);
  const recordingInterval = useRef<number | null>(null);
  const pendingAudioUrl = useRef<string | null>(null);
  const clearRecordingTimers = () => {
    if (recordingTimeout.current !== null) window.clearTimeout(recordingTimeout.current);
    if (recordingInterval.current !== null) window.clearInterval(recordingInterval.current);
    recordingTimeout.current = null;
    recordingInterval.current = null;
  };
  useEffect(() => {
    document.title = 'Listener Registration — TalkOne';
    const description = 'Explore the complete TalkOne listener registration journey in a browser-only demo. No information is transmitted or saved.';
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, []);
  useEffect(() => () => {
    clearRecordingTimers();
    if (pendingAudioUrl.current) URL.revokeObjectURL(pendingAudioUrl.current);
    const recorder = mediaRecorder.current;
    if (recorder) {
      recorder.onstop = null;
      if (recorder.state !== 'inactive') recorder.stop();
      recorder.stream.getTracks().forEach((track) => track.stop());
    }
  }, []);
  const update = <K extends keyof ListenerRegistrationData>(key: K, value: ListenerRegistrationData[K]) => setData((previous) => ({ ...previous, [key]: value }));
  const toggleList = (key: 'categories' | 'languages' | 'relatableTopics', value: string, single = false) => {
    const current = data[key];
    update(key, single ? current.includes(value) ? [] : [value] : current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
    setErrors((old) => ({ ...old, [key]: '' }));
  };
  const validateContact = () => {
    const contact = data.contact.trim();
    const error = !contact ? (data.contactMethod === 'email' ? 'Enter your email address.' : 'Enter your phone number.') :
      data.contactMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) ? 'Enter a valid email address.' :
      data.contactMethod === 'phone' && !/^[+\d][\d\s().-]{6,19}$/.test(contact) ? 'Enter a valid phone number.' : '';
    setErrors(error ? { contact: error } : {});
    if (!error) {
      if (data.contactMethod === 'phone') {
        setData((previous) => ({ ...previous, phone: previous.contact.trim() }));
      }
      setStage(1);
    }
    return !error;
  };
  const validateStep = () => {
    const next: Record<string, string> = {};
    if (stage === 1) {
      if (!data.fullName.trim()) next.fullName = 'Enter your full legal name.';
      if (!data.phone.trim() || !/^[+\d][\d\s().-]{6,19}$/.test(data.phone)) next.phone = 'Enter a valid phone number.';
      if (!data.dateOfBirth) next.dateOfBirth = 'Choose your date of birth.';
      if (!data.gender) next.gender = 'Choose a gender.';
      if (!data.state.trim()) next.state = 'Enter your state.';
      if (!data.city.trim()) next.city = 'Enter your city.';
      if (!data.occupation.trim()) next.occupation = 'Enter your occupation.';
      if (!data.qualification) next.qualification = 'Choose your highest qualification.';
      if (!data.informationAccurate) next.informationAccurate = 'Confirm that your information is accurate.';
      if (!data.agreedToTerms) next.agreedToTerms = 'You must agree to continue.';
    }
    if (stage === 2) {
      if (!data.categories.length) next.categories = 'Select at least one topic.';
      if (!data.languages.length) next.languages = 'Select at least one language.';
      if (!data.relatableTopics.length) next.relatableTopics = 'Choose at least one topic you relate to.';
    }
    if (stage === 3) {
      if (data.lifeExperiences.trim().length < 20) next.lifeExperiences = 'Please share at least 20 characters.';
      if (data.listeningStyle.trim().length < 5) next.listeningStyle = 'Please describe your listening style.';
      if (data.motivation.trim().length < 10) next.motivation = 'Please tell us a little more about your motivation.';
    }
    if (stage === 4 && !data.profilePhoto) next.profilePhoto = 'Add a profile photo to continue.';
    if (stage === 5 && !data.audioIntro) next.audioIntro = 'Upload or record your audio introduction.';
    if (stage === 6 && !data.services.available) next.services = 'Turn on availability for sessions.';
    if (stage === 8) {
      if (!data.kyc.identity) next.identity = 'Upload an Aadhaar or valid photo ID front.';
      if (!data.kyc.pan) next.pan = 'Upload a PAN card.';
      if (!data.kyc.selfie) next.selfie = 'Add a selfie or live photo.';
      if (!data.kyc.address) next.address = 'Upload recent address proof.';
    }
    if (stage === 9) {
      const bank = data.bank;
      if (!bank.accountHolder.trim()) next.accountHolder = 'Enter the account holder name.';
      if (!bank.bankName.trim()) next.bankName = 'Enter the bank name.';
      if (!/^\d{8,18}$/.test(bank.accountNumber)) next.accountNumber = 'Enter an account number between 8 and 18 digits.';
      if (bank.confirmAccountNumber !== bank.accountNumber) next.confirmAccountNumber = 'Account numbers do not match.';
      if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(bank.ifsc)) next.ifsc = 'Enter a valid IFSC code.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };
  const continueStep = async () => {
    if (!validateStep()) return;
    if (stage === 9) {
      await registerListener(data);
      setSubmitted(true);
      setStage(10);
    } else setStage((current) => current + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const toggleSchedule = (day: string, slot: string) => setData((old) => {
    const selected = old.schedule[day] ?? [];
    return { ...old, schedule: { ...old.schedule, [day]: selected.includes(slot) ? selected.filter((item) => item !== slot) : [...selected, slot] } };
  });
  const startRecording = async () => {
    setRecordingError('');
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;
      chunks.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.current.push(event.data); };
      recorder.onstop = () => {
        const clip = new File(chunks.current, 'talkone-introduction.webm', { type: recorder.mimeType || 'audio/webm' });
        update('audioIntro', clip);
        recorder.stream.getTracks().forEach((track) => track.stop());
      };
      recorder.start();
      setRecording(true);
      setRecordingSeconds(30);
      recordingInterval.current = window.setInterval(() => setRecordingSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
      recordingTimeout.current = window.setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
        setRecording(false);
        setRecordingSeconds(0);
        setRecordingError('Recording stopped at the 30-second limit.');
        clearRecordingTimers();
      }, 30_000);
    } catch {
      stream?.getTracks().forEach((track) => track.stop());
      setRecordingError('Microphone access is unavailable. You can upload an audio file instead.');
    }
  };
  const stopRecording = () => {
    clearRecordingTimers();
    if (mediaRecorder.current?.state === 'recording') mediaRecorder.current.stop();
    setRecording(false);
  };
  const chooseAudioFile = (file: File | null) => {
    setRecordingError('');
    if (!file) {
      update('audioIntro', null);
      return;
    }
    update('audioIntro', null);
    if (pendingAudioUrl.current) URL.revokeObjectURL(pendingAudioUrl.current);
    const url = URL.createObjectURL(file);
    pendingAudioUrl.current = url;
    const probe = new Audio();
    probe.preload = 'metadata';
    const releaseUrl = () => {
      URL.revokeObjectURL(url);
      if (pendingAudioUrl.current === url) pendingAudioUrl.current = null;
    };
    probe.onloadedmetadata = () => {
      const duration = probe.duration;
      releaseUrl();
      if (!Number.isFinite(duration) || duration > 30) {
        update('audioIntro', null);
        setRecordingError('Choose an audio introduction that is 30 seconds or shorter.');
        return;
      }
      update('audioIntro', file);
    };
    probe.onerror = () => {
      releaseUrl();
      update('audioIntro', null);
      setRecordingError('This audio file could not be opened. Choose another file.');
    };
    probe.src = url;
  };
  const renderContact = () => <form className="form-card registration-form" onSubmit={(event) => { event.preventDefault(); validateContact(); }} noValidate>
    <span className="eyebrow">First, how can we reach you?</span><h2>Choose a contact method</h2><p className="form-subtitle">No OTP, network request, or account is involved in this demo.</p>
    <div className="method-tabs" role="tablist" aria-label="Choose contact method">
      {(['phone', 'email'] as ContactMethod[]).map((method) => <button key={method} type="button" role="tab" aria-selected={data.contactMethod === method} className="method-tab" onClick={() => { update('contactMethod', method); update('contact', ''); setErrors({}); }} data-testid={`tab-${method}`}>{method === 'phone' ? 'Mobile number' : 'Email address'}</button>)}
    </div>
    <Field label={data.contactMethod === 'phone' ? 'Mobile number' : 'Email address'} required error={errors.contact}>
      <input className="field-input" type={data.contactMethod === 'phone' ? 'tel' : 'email'} value={data.contact} onChange={(event) => update('contact', event.target.value)} placeholder={data.contactMethod === 'phone' ? '+91 98765 43210' : 'you@example.com'} autoComplete={data.contactMethod === 'phone' ? 'tel' : 'email'} aria-invalid={Boolean(errors.contact)} data-testid={`input-contact-${data.contactMethod}`} />
    </Field>
    <p className="privacy-note"><LockKeyhole size={16} />Your details stay in this page’s memory and disappear when you reload or leave.</p>
    <button className="button button-dark form-submit" type="submit" data-testid="button-contact-continue">Continue <ArrowRight size={16} /></button>
  </form>;
  const renderStep = () => {
    switch (stage) {
      case 1: return <>
        <div className="role-options" role="radiogroup" aria-label="Choose role">{(['Listener', 'Expert'] as const).map((role) => <button type="button" key={role} className={`role-option ${data.role === role ? 'selected' : ''}`} aria-pressed={data.role === role} onClick={() => update('role', role)} data-testid={`role-${role.toLowerCase()}`}><span className="radio-dot" />Join as {role}</button>)}</div>
        <TextInput label="Full legal name" value={data.fullName} onChange={(value) => update('fullName', value)} required error={errors.fullName} autoComplete="name" />
        <TextInput label="Phone number" type="tel" value={data.phone} onChange={(value) => update('phone', value)} required error={errors.phone} autoComplete="tel" />
        <div className="reg-columns"><TextInput label="Date of birth" type="date" value={data.dateOfBirth} onChange={(value) => update('dateOfBirth', value)} required error={errors.dateOfBirth} /><Field label="Gender" required error={errors.gender}><select className="field-input" aria-label="Gender" value={data.gender} onChange={(event) => update('gender', event.target.value)} data-testid="select-gender"><option value="">Select gender</option>{['Woman', 'Man', 'Non-binary', 'Prefer not to say', 'Self-describe'].map((item) => <option key={item}>{item}</option>)}</select></Field></div>
        <div className="reg-columns"><TextInput label="State" value={data.state} onChange={(value) => update('state', value)} required error={errors.state} /><TextInput label="City" value={data.city} onChange={(value) => update('city', value)} required error={errors.city} /></div>
        <TextInput label="Occupation" value={data.occupation} onChange={(value) => update('occupation', value)} required error={errors.occupation} />
        <Field label="Highest qualification" required error={errors.qualification}><select className="field-input" aria-label="Highest qualification" value={data.qualification} onChange={(event) => update('qualification', event.target.value)} data-testid="select-qualification"><option value="">Choose qualification</option>{['High school', 'Diploma', 'Undergraduate', 'Graduate', 'Postgraduate', 'Doctorate', 'Other'].map((item) => <option key={item}>{item}</option>)}</select></Field>
        <div className="privacy-panel"><ShieldCheckIcon /><span>Personal details are included only to illustrate this registration flow. This demo does not transmit or save them.</span></div>
        <label className="check-row"><input type="checkbox" checked={data.informationAccurate} onChange={(event) => update('informationAccurate', event.target.checked)} data-testid="check-information-accurate" /><span>I confirm the information provided is accurate.<b>*</b></span></label>{errors.informationAccurate && <p className="field-error">{errors.informationAccurate}</p>}
        <label className="check-row"><input type="checkbox" checked={data.agreedToTerms} onChange={(event) => update('agreedToTerms', event.target.checked)} data-testid="check-terms" /><span>I agree to the <a href="#terms">Terms &amp; Conditions</a> and <a href="#privacy">Privacy Policy</a>.<b>*</b></span></label>{errors.agreedToTerms && <p className="field-error">{errors.agreedToTerms}</p>}
      </>;
      case 2: return <>
        <ChoiceGroup label="Select topics you are comfortable listening to" options={categories} selected={data.categories} onToggle={(value) => toggleList('categories', value)} error={errors.categories} />
        <ChoiceGroup label="Comfort language" options={languages} selected={data.languages} onToggle={(value) => toggleList('languages', value)} error={errors.languages} />
        <ChoiceGroup label="Who can you best relate to?" options={relatableTopics} selected={data.relatableTopics} onToggle={(value) => toggleList('relatableTopics', value)} error={errors.relatableTopics} />
      </>;
      case 3: return <>
        <TextArea label="What life experiences make you a good listener?" value={data.lifeExperiences} onChange={(value) => update('lifeExperiences', value)} required placeholder="Share experiences, challenges, and moments that shaped you…" error={errors.lifeExperiences} minLength={20} />
        <TextInput label="How would you describe your listening style?" value={data.listeningStyle} onChange={(value) => update('listeningStyle', value)} required placeholder="For example: empathetic, patient, non-judgmental…" error={errors.listeningStyle} />
        <TextArea label="Why do you want to join TalkOne?" value={data.motivation} onChange={(value) => update('motivation', value)} required placeholder="What motivates you to be there for others?" error={errors.motivation} />
        <div className="privacy-panel"><HeartIcon /><span>Be genuine. Share real experiences that may help others.</span></div>
      </>;
      case 4: return <>
        <div className="step-intro"><h3>A face helps people feel at ease.</h3><p>Choose a clear, friendly profile photo. It will be visible to users in the reference flow.</p></div>
        <FilePicker label="Profile photo" accept="image/*" capture="user" file={data.profilePhoto} onFile={(file) => update('profilePhoto', file)} error={errors.profilePhoto} testId="file-profile-photo" />
        <div className="guideline-list"><strong>Photo guidelines</strong>{['Clear face', 'Good lighting', 'No sunglasses', 'Single person only', 'Friendly expression'].map((item) => <span key={item}><CheckCircle2 size={17} />{item}</span>)}</div>
        <p className="privacy-note"><Info size={16} />Selected files remain in browser memory only and are discarded when you leave or reload.</p>
      </>;
      case 5: return <>
        <div className="step-intro"><h3>A short hello goes a long way.</h3><p>Record or upload a 30-second audio introduction. Audio stays on this device for the demo.</p></div>
        <div className="record-panel"><div className="record-icon"><Mic size={23} /></div><div><strong>{recording ? `Recording in progress · 00:${String(recordingSeconds).padStart(2, '0')}` : 'Record a voice introduction'}</strong><p>{recording ? 'Recording stops automatically at 30 seconds.' : 'Your browser will ask for microphone access. Maximum 30 seconds.'}</p></div>
          {!recording ? <button type="button" className="button button-outline" onClick={startRecording} data-testid="button-start-recording">Record</button> : <button type="button" className="button button-dark" onClick={stopRecording} data-testid="button-stop-recording">Stop recording</button>}
        </div>
        {recordingError && <p className="field-error" role="alert">{recordingError}</p>}
        {!recording ? <FilePicker label="Audio introduction" accept="audio/*" file={data.audioIntro} onFile={chooseAudioFile} error={errors.audioIntro} testId="file-audio-intro" /> : <p className="field-hint">Stop recording before choosing an audio file.</p>}
        <div className="guideline-list"><strong>Tips for a great intro</strong>{['Introduce yourself', 'Mention the topics you can help with', 'Speak clearly and warmly'].map((item) => <span key={item}><CheckCircle2 size={17} />{item}</span>)}</div>
      </>;
      case 6: return <>
        <div className="switch-list">{([['chat', 'Chat'], ['call', 'Call'], ['videoCall', 'Video Call'], ['available', 'Available for sessions']] as const).map(([key, label]) => <label className="switch-row" key={key}><span><strong>{label}</strong>{key === 'available' && <small>Turn on to let others connect with you.</small>}</span><input type="checkbox" role="switch" checked={data.services[key]} onChange={(event) => setData((old) => ({ ...old, services: { ...old.services, [key]: event.target.checked } }))} data-testid={`toggle-${key}`} /></label>)}</div>
        {errors.services && <p className="field-error" role="alert">{errors.services}</p>}
        <div className="schedule-section"><h3>Your weekly schedule</h3><p>Select the days and times you are typically available.</p><div className="schedule-days">{weekdays.map((day) => <button type="button" className={`day-chip ${(data.schedule[day]?.length ?? 0) > 0 ? 'selected' : ''}`} key={day} aria-pressed={(data.schedule[day]?.length ?? 0) > 0} onClick={() => setData((old) => ({ ...old, schedule: { ...old.schedule, [day]: old.schedule[day]?.length ? [] : [...timeSlots] } }))} data-testid={`schedule-day-${day.toLowerCase()}`}>{day}</button>)}</div>
          <div className="schedule-grid">{weekdays.map((day) => <div className="schedule-day" key={day}><strong>{day}</strong>{timeSlots.map((slot) => <label key={slot} className="schedule-time"><input type="checkbox" checked={data.schedule[day]?.includes(slot) ?? false} onChange={() => toggleSchedule(day, slot)} data-testid={`schedule-${day.toLowerCase()}-${slot.split(' ')[0].toLowerCase()}`} /><span>{slot.split(' ')[0]}</span></label>)}</div>)}</div>
        </div>
        <Field label="Response preference"><select className="field-input" aria-label="Response preference" value={data.responsePreference} onChange={(event) => update('responsePreference', event.target.value)} data-testid="select-response-preference">{['Within 5 min', 'Within 15 min', 'Within 30 min', 'Within 1 hour', 'Within a day'].map((item) => <option key={item}>{item}</option>)}</select></Field>
      </>;
      case 7: return <>
        <div className="pricing-fields">
          <div className="price-row"><div><strong>Chat</strong><span>per minute · suggested ₹5–₹15</span></div><label className="rupee-input">₹ <input aria-label="Chat price per minute in rupees" type="number" min="0" max="10000" value={data.pricing.chat} onChange={(event) => setData((old) => ({ ...old, pricing: { ...old.pricing, chat: Math.max(0, Number(event.target.value)) } }))} data-testid="input-price-chat" /></label></div>
          <div className="price-row"><div><strong>Audio</strong><span>per minute · suggested ₹8–₹25</span></div><label className="rupee-input">₹ <input aria-label="Audio price per minute in rupees" type="number" min="0" max="10000" value={data.pricing.audio} onChange={(event) => setData((old) => ({ ...old, pricing: { ...old.pricing, audio: Math.max(0, Number(event.target.value)) } }))} data-testid="input-price-audio" /></label></div>
          <p className="field-hint">Video call suggested range: ₹15–₹50 per minute. Rates shown are examples, not a quote.</p>
        </div>
        <div className="earnings-panel"><Info size={20} /><div><strong>Illustrative 60-minute earning example</strong><p>₹600–₹1,200 based on an example mix of conversations.</p><span>Example only — not a promise or payout estimate.</span></div></div>
        <label className="switch-row"><span><strong>Enable intro offers <em>Optional</em></strong><small>Offer a discount to new listeners for a limited time.</small></span><input type="checkbox" role="switch" checked={data.pricing.introOffer} onChange={(event) => setData((old) => ({ ...old, pricing: { ...old.pricing, introOffer: event.target.checked } }))} data-testid="toggle-intro-offer" /></label>
      </>;
      case 8: return <>
        <div className="step-intro"><h3>Identity documents</h3><p>Reference checklist only. Do not upload real sensitive documents in this demo.</p></div>
        <FilePicker label="Aadhaar or valid photo ID front" accept="image/*,.pdf" file={data.kyc.identity} onFile={(file) => setData((old) => ({ ...old, kyc: { ...old.kyc, identity: file } }))} description="Front side of Aadhaar card or other valid photo ID." error={errors.identity} testId="file-kyc-identity" />
        <FilePicker label="PAN card" accept="image/*,.pdf" file={data.kyc.pan} onFile={(file) => setData((old) => ({ ...old, kyc: { ...old.kyc, pan: file } }))} description="Clear image of your PAN card." error={errors.pan} testId="file-kyc-pan" />
        <FilePicker label="Selfie / live photo" accept="image/*" capture="user" file={data.kyc.selfie} onFile={(file) => setData((old) => ({ ...old, kyc: { ...old.kyc, selfie: file } }))} description="A clear selfie or live photo." error={errors.selfie} testId="file-kyc-selfie" />
        <FilePicker label="Recent address proof" accept="image/*,.pdf" file={data.kyc.address} onFile={(file) => setData((old) => ({ ...old, kyc: { ...old.kyc, address: file } }))} description="Recent utility bill, rental agreement, or address proof." error={errors.address} testId="file-kyc-address" />
        <div className="privacy-panel"><LockKeyhole size={21} /><span>Files stay only in browser memory in this demo. They are not uploaded or saved. Avoid using real KYC documents.</span></div>
      </>;
      case 9: return <>
        <TextInput label="Account holder name" value={data.bank.accountHolder} onChange={(value) => setData((old) => ({ ...old, bank: { ...old.bank, accountHolder: value } }))} required error={errors.accountHolder} autoComplete="off" />
        <TextInput label="Bank name" value={data.bank.bankName} onChange={(value) => setData((old) => ({ ...old, bank: { ...old.bank, bankName: value } }))} required error={errors.bankName} autoComplete="off" />
        <TextInput label="Account number" type="password" value={data.bank.accountNumber} onChange={(value) => setData((old) => ({ ...old, bank: { ...old.bank, accountNumber: value } }))} required error={errors.accountNumber} autoComplete="new-password" inputMode="numeric" />
        <TextInput label="Confirm account number" type="password" value={data.bank.confirmAccountNumber} onChange={(value) => setData((old) => ({ ...old, bank: { ...old.bank, confirmAccountNumber: value } }))} required error={errors.confirmAccountNumber} autoComplete="new-password" inputMode="numeric" />
        <TextInput label="IFSC code" value={data.bank.ifsc} onChange={(value) => setData((old) => ({ ...old, bank: { ...old.bank, ifsc: value.toUpperCase() } }))} required error={errors.ifsc} autoComplete="off" />
        <TextInput label="UPI ID (optional)" value={data.bank.upi} onChange={(value) => setData((old) => ({ ...old, bank: { ...old.bank, upi: value } }))} autoComplete="off" />
        <div className="privacy-panel"><Info size={21} /><span><strong>Reference copy only:</strong> “Payouts are released after admin approval and completion of the settlement cycle.” This demo has no approval, payout, or payment flow.</span></div>
        <p className="privacy-note"><LockKeyhole size={16} />Do not enter real bank details. Values remain in memory only and will be discarded when this page closes or reloads.</p>
      </>;
      default: return null;
    }
  };
  const sectionNames = ['Basic Details & Profile', 'Categories & Expertise', 'Your Story', 'Profile Photo', 'Audio Introduction', 'Availability', 'Pricing', 'KYC Verification', 'Bank Details'];
  return <div className="site-shell"><header className="header registration-header"><div className="wrap nav"><Link href="/" className="logo-link" aria-label="TalkOne home"><span className="brand"><span className="brand-mark"><span className="brand-plus">+</span></span>TalkOne</span></Link><Link href="/" className="registration-exit" data-testid="link-registration-exit">Exit demo <X size={16} /></Link></div></header>
    <main className="registration journey">
      <div className="wrap journey-wrap">
        {stage < 10 ? <>
          <div className="registration-intro journey-intro"><span className="eyebrow">{stage === 0 ? 'A browser-only demonstration' : `Step ${stage} of 10 · ${steps[stage - 1]}`}</span><h1>{stage === 0 ? 'Make a little room to listen.' : stage === 1 ? 'Join as a Listener / Expert' : steps[stage - 1]}</h1><p>{stage === 0 ? 'Explore the complete listener registration journey, from contact choice to final review.' : stage === 1 ? 'Share a few basics to start your listener profile.' : 'A thoughtful listener journey, one small step at a time.'}</p><div className="notice">Demo only: nothing is submitted, transmitted, or saved. All typed values and selected files are kept only in component memory and disappear on reload.</div></div>
          <section className="form-card registration-form" aria-label={stage === 0 ? 'Contact choice' : steps[stage - 1]}>
            {stage === 0 ? renderContact() : <>
              <div className="journey-top"><p className="form-subtitle">Step {stage} of 10 <span aria-hidden="true">•</span> {steps[stage - 1]}</p><div className="step-progress" aria-label={`Step ${stage} of 10`} role="list">{Array.from({ length: 10 }, (_, index) => <span key={index} role="listitem" aria-current={index + 1 === stage ? 'step' : undefined} className={index + 1 <= stage ? 'complete' : ''}>{index + 1}</span>)}</div></div>
              <div className="step-content" key={stage}>{renderStep()}</div>
              <div className="form-navigation"><button type="button" className="button button-outline" onClick={() => { if (recording) stopRecording(); setErrors({}); setStage((current) => current - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} data-testid="button-step-back"><ArrowLeft size={16} /> Back</button><button type="button" className="button button-dark" onClick={continueStep} data-testid="button-step-continue">{stage === 9 ? 'Finish demo' : 'Save & continue'} <ArrowRight size={16} /></button></div>
            </>}
          </section>
        </> : <section className="confirmation-card" data-testid="status-demo-confirmation">
          <div className="confirmation-mark"><Check size={36} /></div><span className="eyebrow">Journey complete · demo state</span><h1>Registration preview complete</h1><p className="confirmation-copy">You reached the end of the TalkOne listener registration journey. Nothing was submitted, reviewed, or saved.</p>
          <div className="privacy-panel"><Info size={22} /><span>This is not an application receipt. There is no application ID, real review queue, or working status tracker.</span></div>
          <div className="review-note"><strong>What happens next?</strong><p>In a live service, the registration would be submitted for review after secure integration. Review timing and status updates are not available in this demo.</p></div>
          <h2 className="checklist-title">Sections completed in this preview</h2><div className="completed-list">{sectionNames.map((name, index) => <div key={name} className="completed-row"><span className="completed-index">{String(index + 1).padStart(2, '0')}</span><span>{name}</span><CheckCircle2 size={19} /></div>)}</div>
          <button className="button button-disabled form-submit" type="button" disabled data-testid="button-track-status">Status tracking available after integration</button>
          <p className="form-legal">Your information and any selected files existed only in this page’s memory. Nothing was actually submitted or persisted.</p>
          <button className="button button-outline" type="button" onClick={() => { setData(initialData()); setErrors({}); setSubmitted(false); setStage(0); }} data-testid="button-restart-demo">Restart demo</button>
          <span className="sr-only" role="status">{submitted ? 'Demo flow complete. Nothing was transmitted or saved.' : ''}</span>
        </section>}
      </div>
    </main>
  </div>;
}

function ShieldCheckIcon() { return <LockKeyhole size={21} aria-hidden="true" />; }
function HeartIcon() { return <Heart size={21} aria-hidden="true" />; }