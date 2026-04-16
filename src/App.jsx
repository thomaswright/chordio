import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { KeyboardShortcuts, MidiNumbers, Piano } from "react-piano";
import "react-piano/dist/styles.css";

const firstNote = MidiNumbers.fromNote("c3");
const lastNote = MidiNumbers.fromNote("f5");

const keyboardShortcuts = KeyboardShortcuts.create({
  firstNote,
  lastNote,
  keyboardConfig: KeyboardShortcuts.HOME_ROW,
});

const modes = [
  {
    id: "piano",
    label: "Piano",
    description: "Each shortcut plays a single piano note.",
  },
  {
    id: "chord",
    label: "Chord",
    description: "Each shortcut triggers a diatonic chord in C.",
  },
];

const chordCycle = [
  { label: "Cmaj7", root: "C3", intervals: [0, 4, 7, 11] },
  { label: "Dm7", root: "D3", intervals: [0, 3, 7, 10] },
  { label: "Em7", root: "E3", intervals: [0, 3, 7, 10] },
  { label: "Fmaj7", root: "F3", intervals: [0, 4, 7, 11] },
  { label: "G7", root: "G3", intervals: [0, 4, 7, 10] },
  { label: "Am7", root: "A3", intervals: [0, 3, 7, 10] },
  { label: "Bm7b5", root: "B3", intervals: [0, 3, 6, 10] },
];

const chordMappings = Object.fromEntries(
  keyboardShortcuts.map(({ midiNumber }, index) => {
    const chord = chordCycle[index % chordCycle.length];
    const octaveOffset = Math.floor(index / chordCycle.length) * 12;
    const rootMidiNumber = MidiNumbers.fromNote(chord.root) + octaveOffset;
    const midiNumbers = chord.intervals.map(
      (interval) => rootMidiNumber + interval,
    );
    const notes = midiNumbers.map((noteMidiNumber) =>
      Tone.Frequency(noteMidiNumber, "midi").toNote(),
    );

    return [
      midiNumber,
      {
        label: chord.label,
        midiNumbers,
        notes,
      },
    ];
  }),
);

const pianoSampleUrls = {
  A0: "A0v10.mp3",
  C1: "C1v10.mp3",
  "D#1": "Ds1v10.mp3",
  "F#1": "Fs1v10.mp3",
  A1: "A1v10.mp3",
  C2: "C2v10.mp3",
  "D#2": "Ds2v10.mp3",
  "F#2": "Fs2v10.mp3",
  A2: "A2v10.mp3",
  C3: "C3v10.mp3",
  "D#3": "Ds3v10.mp3",
  "F#3": "Fs3v10.mp3",
  A3: "A3v10.mp3",
  C4: "C4v10.mp3",
  "D#4": "Ds4v10.mp3",
  "F#4": "Fs4v10.mp3",
  A4: "A4v10.mp3",
  C5: "C5v10.mp3",
  "D#5": "Ds5v10.mp3",
  "F#5": "Fs5v10.mp3",
  A5: "A5v10.mp3",
  C6: "C6v10.mp3",
  "D#6": "Ds6v10.mp3",
  "F#6": "Fs6v10.mp3",
  A6: "A6v10.mp3",
  C7: "C7v10.mp3",
  "D#7": "Ds7v10.mp3",
  "F#7": "Fs7v10.mp3",
  A7: "A7v10.mp3",
  C8: "C8v10.mp3",
};

function App() {
  const containerRef = useRef(null);
  const samplerRef = useRef(null);
  const activeVoicesRef = useRef(new Map());
  const [pianoWidth, setPianoWidth] = useState(960);
  const [audioStatus, setAudioStatus] = useState("locked");
  const [mode, setMode] = useState("piano");
  const [secondaryActiveMidiNumbers, setSecondaryActiveMidiNumbers] = useState(
    [],
  );

  const createSampler = () => {
    if (samplerRef.current) {
      return samplerRef.current;
    }

    setAudioStatus("loading");

    const sampler = new Tone.Sampler({
      urls: pianoSampleUrls,
      release: 1.4,
      baseUrl: "/piano-samples/",
      onload: () => {
        setAudioStatus("ready");
      },
    }).toDestination();

    samplerRef.current = sampler;
    return sampler;
  };

  const ensureAudioReady = async () => {
    if (audioStatus === "ready" && samplerRef.current) {
      return samplerRef.current;
    }

    await Tone.start();
    return createSampler();
  };

  const resolveVoice = (midiNumber, selectedMode) => {
    if (selectedMode === "chord") {
      return chordMappings[midiNumber];
    }

    return {
      label: Tone.Frequency(midiNumber, "midi").toNote(),
      midiNumbers: [midiNumber],
      notes: [Tone.Frequency(midiNumber, "midi").toNote()],
    };
  };

  const syncSecondaryActiveMidiNumbers = (selectedMode = mode) => {
    if (selectedMode !== "chord") {
      setSecondaryActiveMidiNumbers([]);
      return;
    }

    const midiNumbers = [
      ...new Set(
        [...activeVoicesRef.current.entries()].flatMap(
          ([triggerMidiNumber, voice]) =>
            voice.midiNumbers.filter(
              (voiceMidiNumber) => voiceMidiNumber !== triggerMidiNumber,
            ),
        ),
      ),
    ];

    setSecondaryActiveMidiNumbers(midiNumbers);
  };

  const releaseVoice = (midiNumber) => {
    const sampler = samplerRef.current;
    const activeVoice = activeVoicesRef.current.get(midiNumber);

    if (sampler && activeVoice) {
      activeVoice.notes.forEach((note) => {
        sampler.triggerRelease(note);
      });
    }

    activeVoicesRef.current.delete(midiNumber);
    syncSecondaryActiveMidiNumbers();
  };

  const playNote = async (midiNumber) => {
    const sampler = await ensureAudioReady();
    const voice = resolveVoice(midiNumber, mode);

    releaseVoice(midiNumber);

    voice.notes.forEach((note) => {
      sampler.triggerAttack(note);
    });

    activeVoicesRef.current.set(midiNumber, voice);
    syncSecondaryActiveMidiNumbers();
  };

  const stopNote = (midiNumber) => {
    releaseVoice(midiNumber);
  };

  const handleModeSelect = (nextMode) => {
    activeVoicesRef.current.forEach((_, midiNumber) => {
      releaseVoice(midiNumber);
    });
    setSecondaryActiveMidiNumbers([]);
    setMode(nextMode);
  };

  useEffect(() => {
    const node = containerRef.current;

    if (!node) {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      setPianoWidth(entry.contentRect.width);
    });

    resizeObserver.observe(node);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const activeVoices = activeVoicesRef.current;
    const sampler = samplerRef.current;

    return () => {
      activeVoices.forEach((voice) => {
        voice.notes.forEach((note) => {
          sampler?.triggerRelease(note);
        });
      });
      activeVoices.clear();
      sampler?.dispose();
    };
  }, []);

  const renderNoteLabel = ({
    keyboardShortcut,
    midiNumber,
    isActive,
    isAccidental,
  }) => {
    const isSecondaryActive =
      mode === "chord" &&
      secondaryActiveMidiNumbers.includes(midiNumber) &&
      !isActive;

    if (!keyboardShortcut && !isSecondaryActive) {
      return null;
    }

    return (
      <div className="ReactPiano__NoteStack">
        {isSecondaryActive && (
          <span
            className={`ReactPiano__ExtraIndicator ${
              isAccidental
                ? "ReactPiano__ExtraIndicator--accidental"
                : "ReactPiano__ExtraIndicator--natural"
            }`}
          />
        )}
        {keyboardShortcut ? (
          <span
            className={`ReactPiano__NoteLabel ${
              isActive ? "ReactPiano__NoteLabel--active" : ""
            } ${
              isAccidental
                ? "ReactPiano__NoteLabel--accidental"
                : "ReactPiano__NoteLabel--natural"
            }`}
          >
            {keyboardShortcut}
          </span>
        ) : null}
      </div>
    );
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl p-4 md:p-8">
      <section className="w-full rounded-[28px] border border-slate-900/10 bg-stone-100 p-4 shadow-[0_24px_80px_rgba(39,34,26,0.08)] md:p-6">
        <header className="mb-4 flex flex-col gap-4 md:mb-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold text-slate-900 md:text-xl">
              Keyboard Mapping
            </h1>
            <p className="text-sm text-slate-600">
              {modes.find((entry) => entry.id === mode)?.description}
            </p>
          </div>

          <div className="inline-flex w-full rounded-2xl bg-stone-200 p-1 md:w-auto">
            {modes.map((entry) => {
              const isActive = entry.id === mode;

              return (
                <button
                  className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition md:flex-none ${
                    isActive
                      ? "bg-slate-900 text-stone-50 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  key={entry.id}
                  onClick={() => handleModeSelect(entry.id)}
                  type="button"
                >
                  {entry.label}
                </button>
              );
            })}
          </div>
        </header>

        {mode === "chord" && (
          <div className="mb-4 flex flex-wrap gap-2 md:mb-6">
            {chordCycle.map((chord) => (
              <span
                className="rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-medium tracking-wide text-slate-700"
                key={chord.label}
              >
                {chord.label}
              </span>
            ))}
          </div>
        )}

        <div
          className="relative overflow-x-auto rounded-3xl bg-slate-900 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_40px_rgba(17,20,25,0.16)] md:p-4"
          ref={containerRef}
        >
          <Piano
            noteRange={{ first: firstNote, last: lastNote }}
            playNote={playNote}
            renderNoteLabel={renderNoteLabel}
            stopNote={stopNote}
            width={pianoWidth}
            keyboardShortcuts={keyboardShortcuts}
          />
        </div>
      </section>
    </main>
  );
}

export default App;
