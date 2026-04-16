import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

const firstNote = 48; // C3
const lastNote = 65; // F5
const keyboardKeys = [
  "a",
  "w",
  "s",
  "e",
  "d",
  "f",
  "t",
  "g",
  "y",
  "h",
  "u",
  "j",
  "k",
  "o",
  "l",
  "p",
  ";",
  "'",
];

const midiNumbersInRange = Array.from(
  { length: lastNote - firstNote + 1 },
  (_, index) => firstNote + index,
);

const keyboardShortcuts = midiNumbersInRange.map((midiNumber, index) => ({
  key: keyboardKeys[index],
  midiNumber,
}));

const shortcutByMidiNumber = Object.fromEntries(
  keyboardShortcuts.map(({ key, midiNumber }) => [midiNumber, key]),
);

const midiNumberByShortcut = Object.fromEntries(
  keyboardShortcuts.map(({ key, midiNumber }) => [key, midiNumber]),
);

const modes = [
  {
    id: "piano",
    label: "Piano",
    description: "Each shortcut plays a single piano note.",
  },
  {
    id: "chord",
    label: "Chord",
    description: "Each shortcut triggers a chord built from the selected chord type.",
  },
  {
    id: "nns",
    label: "NNS",
    description: "Number keys trigger scale-degree chords while the letter row selects the active scale.",
  },
];

const chordTypes = [
  { shortcut: "z", id: "maj", label: "Major", symbol: "maj", intervals: [0, 4, 7] },
  { shortcut: "x", id: "min", label: "Minor", symbol: "min", intervals: [0, 3, 7] },
  { shortcut: "c", id: "dom7", label: "Dominant 7", symbol: "7", intervals: [0, 4, 7, 10] },
  { shortcut: "v", id: "maj7", label: "Major 7", symbol: "maj7", intervals: [0, 4, 7, 11] },
  { shortcut: "b", id: "dim7", label: "Diminished 7", symbol: "dim7", intervals: [0, 3, 6, 9] },
  { shortcut: "n", id: "aug5", label: "Augmented", symbol: "aug5", intervals: [0, 4, 8] },
  { shortcut: "m", id: "halfDim7", label: "Half-diminished 7", symbol: "m7b5", intervals: [0, 3, 6, 10] },
];

const chordTypeByShortcut = Object.fromEntries(
  chordTypes.map((chordType) => [chordType.shortcut, chordType]),
);

const defaultChordType = chordTypes[0];
const nnsScaleShortcuts = ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "/"];
const nnsDegreeShortcuts = ["1", "2", "3", "4", "5", "6", "7"];
const tonicMidiNumber = Tone.Frequency("C3").toMidi();

const nnsScales = [
  { id: "diatonic", label: "Diatonic", shortcut: "a", intervals: [0, 2, 4, 5, 7, 9, 11] },
  { id: "jazzMinor", label: "Jazz Minor", shortcut: "s", intervals: [0, 2, 3, 5, 7, 9, 11] },
  { id: "neapolitanMinor", label: "Neapolitan Minor", shortcut: "d", intervals: [0, 1, 3, 5, 7, 8, 11] },
  { id: "gypsyMinor", label: "Gypsy Minor", shortcut: "f", intervals: [0, 2, 3, 6, 7, 8, 10] },
  { id: "hungarianMinor", label: "Hungarian Minor", shortcut: "g", intervals: [0, 2, 3, 6, 7, 8, 11] },
  { id: "hungarianMajor", label: "Hungarian Major", shortcut: "h", intervals: [0, 3, 4, 6, 7, 9, 10] },
  { id: "harmonicMinor", label: "Harmonic Minor", shortcut: "j", intervals: [0, 2, 3, 5, 7, 8, 11] },
  { id: "doubleHarmonic", label: "Double Harmonic", shortcut: "k", intervals: [0, 1, 4, 5, 7, 8, 11] },
  { id: "harmonicMajor", label: "Harmonic Major", shortcut: "l", intervals: [0, 2, 4, 5, 7, 8, 11] },
  { id: "romanianMajor", label: "Romanian Major", shortcut: ";", intervals: [0, 1, 4, 6, 7, 9, 10] },
  { id: "blues7", label: "Blues 7", shortcut: "'", intervals: [0, 2, 3, 4, 7, 9, 10] },
  { id: "enigmatic", label: "Enigmatic", shortcut: "/", intervals: [0, 1, 4, 6, 8, 10, 11] },
];

const nnsScaleByShortcut = Object.fromEntries(
  nnsScales.map((scale) => [scale.shortcut, scale]),
);

const defaultNnsScale = nnsScales[0];
const nnsDegrees = nnsDegreeShortcuts.map((shortcut, index) => ({
  degree: index + 1,
  shortcut,
  triggerId: `nns-${index + 1}`,
}));

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

const pianoNotes = (() => {
  let naturalIndex = -1;

  return midiNumbersInRange.map((midiNumber) => {
    const noteName = Tone.Frequency(midiNumber, "midi").toNote();
    const isAccidental = noteName.includes("#");

    if (!isAccidental) {
      naturalIndex += 1;
    }

    return {
      midiNumber,
      noteName,
      isAccidental,
      naturalIndex,
      keyboardShortcut: shortcutByMidiNumber[midiNumber],
    };
  });
})();

const naturalNotes = pianoNotes.filter((note) => !note.isAccidental);
const accidentalNotes = pianoNotes.filter((note) => note.isAccidental);
const naturalKeyCount = naturalNotes.length;

function App() {
  const samplerRef = useRef(null);
  const activeVoicesRef = useRef(new Map());
  const pressedKeyboardKeysRef = useRef(new Set());
  const modeRef = useRef("piano");
  const chordTypeRef = useRef(defaultChordType);
  const nnsScaleRef = useRef(defaultNnsScale);
  const startVoiceRef = useRef(null);
  const releaseVoiceRef = useRef(null);
  const stopAllVoicesRef = useRef(null);
  const [audioStatus, setAudioStatus] = useState("locked");
  const [mode, setMode] = useState("piano");
  const [selectedChordTypeId, setSelectedChordTypeId] = useState(defaultChordType.id);
  const [selectedNnsScaleId, setSelectedNnsScaleId] = useState(defaultNnsScale.id);
  const [activeTriggerIds, setActiveTriggerIds] = useState([]);
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

  const syncActiveStates = (selectedMode = modeRef.current) => {
    const triggerIds = [...activeVoicesRef.current.keys()];

    setActiveTriggerIds(triggerIds);

    if (selectedMode === "piano") {
      setSecondaryActiveMidiNumbers([]);
      return;
    }

    const secondaryMidiNumbers = [
      ...new Set(
        [...activeVoicesRef.current.entries()].flatMap(
          ([triggerMidiNumber, voice]) =>
            voice.midiNumbers.filter(
              (voiceMidiNumber) => voiceMidiNumber !== triggerMidiNumber,
            ),
        ),
      ),
    ];

    setSecondaryActiveMidiNumbers(secondaryMidiNumbers);
  };

  const resolveVoice = (
    triggerId,
    selectedMode,
    selectedChordType = chordTypeRef.current,
    selectedNnsScale = nnsScaleRef.current,
  ) => {
    if (selectedMode === "chord") {
      const midiNumber = Number(triggerId);
      const midiNumbers = selectedChordType.intervals.map(
        (interval) => midiNumber + interval,
      );
      const rootNote = Tone.Frequency(midiNumber, "midi").toNote();

      return {
        label: `${rootNote}${selectedChordType.symbol}`,
        midiNumbers,
        notes: midiNumbers.map((voiceMidiNumber) =>
          Tone.Frequency(voiceMidiNumber, "midi").toNote(),
        ),
      };
    }

    if (selectedMode === "nns") {
      const degreeIndex = Number.parseInt(String(triggerId).replace("nns-", ""), 10) - 1;
      const chordSteps = [degreeIndex, degreeIndex + 2, degreeIndex + 4];
      const midiNumbers = chordSteps.map((step) => {
        const wrappedIndex = step % selectedNnsScale.intervals.length;
        const octaveOffset = Math.floor(step / selectedNnsScale.intervals.length) * 12;

        return tonicMidiNumber + selectedNnsScale.intervals[wrappedIndex] + octaveOffset;
      });

      return {
        label: `${degreeIndex + 1} (${selectedNnsScale.label})`,
        midiNumbers,
        notes: midiNumbers.map((voiceMidiNumber) =>
          Tone.Frequency(voiceMidiNumber, "midi").toNote(),
        ),
      };
    }

    const midiNumber = Number(triggerId);

    return {
      label: Tone.Frequency(midiNumber, "midi").toNote(),
      midiNumbers: [midiNumber],
      notes: [Tone.Frequency(midiNumber, "midi").toNote()],
    };
  };

  const releaseVoice = (triggerId) => {
    const sampler = samplerRef.current;
    const activeVoice = activeVoicesRef.current.get(triggerId);

    if (sampler && activeVoice) {
      activeVoice.notes.forEach((note) => {
        sampler.triggerRelease(note);
      });
    }

    activeVoicesRef.current.delete(triggerId);
    syncActiveStates();
  };

  const startVoice = async (triggerId, selectedMode = modeRef.current) => {
    const sampler = await ensureAudioReady();
    const voice = resolveVoice(triggerId, selectedMode);

    releaseVoice(triggerId);

    voice.notes.forEach((note) => {
      sampler.triggerAttack(note);
    });

    activeVoicesRef.current.set(triggerId, voice);
    syncActiveStates(selectedMode);
  };

  const stopAllVoices = () => {
    const sampler = samplerRef.current;

    activeVoicesRef.current.forEach((voice) => {
      voice.notes.forEach((note) => {
        sampler?.triggerRelease(note);
      });
    });

    activeVoicesRef.current.clear();
    syncActiveStates();
  };

  const handleModeSelect = (nextMode) => {
    stopAllVoices();
    pressedKeyboardKeysRef.current.clear();
    modeRef.current = nextMode;
    setMode(nextMode);
  };

  const handleChordTypeSelect = (nextChordType) => {
    chordTypeRef.current = nextChordType;
    setSelectedChordTypeId(nextChordType.id);
  };

  const handleNnsScaleSelect = (nextScale) => {
    nnsScaleRef.current = nextScale;
    setSelectedNnsScaleId(nextScale.id);
  };

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    chordTypeRef.current =
      chordTypes.find((chordType) => chordType.id === selectedChordTypeId) ??
      defaultChordType;
  }, [selectedChordTypeId]);

  useEffect(() => {
    nnsScaleRef.current =
      nnsScales.find((scale) => scale.id === selectedNnsScaleId) ??
      defaultNnsScale;
  }, [selectedNnsScaleId]);

  useEffect(() => {
    startVoiceRef.current = startVoice;
    releaseVoiceRef.current = releaseVoice;
    stopAllVoicesRef.current = stopAllVoices;
  });

  useEffect(() => {
    const shouldIgnoreKeyboardEvent = (event) => {
      const target = event.target;

      return (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        (target instanceof HTMLElement &&
          (target.isContentEditable ||
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.tagName === "SELECT"))
      );
    };

    const handleKeyDown = (event) => {
      if (shouldIgnoreKeyboardEvent(event) || event.repeat) {
        return;
      }

      const key = event.key.toLowerCase();
      const chordType = chordTypeByShortcut[key];
      const nnsScale = nnsScaleByShortcut[key];
      const nnsDegree = nnsDegrees.find((entry) => entry.shortcut === key);

      if (modeRef.current === "chord" && chordType) {
        event.preventDefault();
        handleChordTypeSelect(chordType);
        return;
      }

      if (modeRef.current === "nns" && nnsScale) {
        event.preventDefault();
        handleNnsScaleSelect(nnsScale);
        return;
      }

      if (modeRef.current === "nns" && nnsDegree) {
        if (pressedKeyboardKeysRef.current.has(key)) {
          return;
        }

        event.preventDefault();
        pressedKeyboardKeysRef.current.add(key);
        void startVoiceRef.current?.(nnsDegree.triggerId, modeRef.current);
        return;
      }

      const midiNumber = midiNumberByShortcut[key];

      if (!midiNumber || pressedKeyboardKeysRef.current.has(key)) {
        return;
      }

      event.preventDefault();
      pressedKeyboardKeysRef.current.add(key);
      void startVoiceRef.current?.(midiNumber, modeRef.current);
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      const nnsDegree = nnsDegrees.find((entry) => entry.shortcut === key);

      if (modeRef.current === "nns" && nnsDegree) {
        pressedKeyboardKeysRef.current.delete(key);
        releaseVoiceRef.current?.(nnsDegree.triggerId);
        return;
      }

      const midiNumber = midiNumberByShortcut[key];

      if (!midiNumber) {
        return;
      }

      pressedKeyboardKeysRef.current.delete(key);
      releaseVoiceRef.current?.(midiNumber);
    };

    const handleWindowBlur = () => {
      pressedKeyboardKeysRef.current.clear();
      stopAllVoicesRef.current?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [audioStatus]);

  useEffect(() => {
    const sampler = samplerRef.current;

    return () => {
      stopAllVoicesRef.current?.();
      sampler?.dispose();
    };
  }, []);

  const renderKeyButton = (note) => {
    const isPrimaryActive = activeTriggerIds.includes(note.midiNumber);
    const isSecondaryActive = secondaryActiveMidiNumbers.includes(
      note.midiNumber,
    );
    const keyLabel = note.keyboardShortcut.toUpperCase();

    return (
      <button
        className={[
          "PianoKey",
          note.isAccidental ? "PianoKey--accidental" : "PianoKey--natural",
          isPrimaryActive ? "PianoKey--primary-active" : "",
          isSecondaryActive ? "PianoKey--secondary-active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        key={note.midiNumber}
        onPointerDown={(event) => {
          event.preventDefault();
          void startVoice(note.midiNumber);
        }}
        onPointerUp={() => {
          releaseVoice(note.midiNumber);
        }}
        onPointerLeave={(event) => {
          if (event.buttons > 0) {
            releaseVoice(note.midiNumber);
          }
        }}
        onContextMenu={(event) => event.preventDefault()}
        type="button"
      >
        <span className="PianoKey__Label">{keyLabel}</span>
      </button>
    );
  };

  const renderNnsDegreeButton = ({ degree, shortcut, triggerId }) => {
    const isActive = activeTriggerIds.includes(triggerId);

    return (
      <button
        className={`rounded-3xl border px-4 py-6 text-left transition ${
          isActive
            ? "border-amber-400 bg-amber-300 text-slate-950 shadow-sm"
            : "border-slate-700 bg-slate-900 text-stone-50 hover:border-slate-500"
        }`}
        key={triggerId}
        onPointerDown={(event) => {
          event.preventDefault();
          void startVoice(triggerId, "nns");
        }}
        onPointerUp={() => {
          releaseVoice(triggerId);
        }}
        onPointerLeave={(event) => {
          if (event.buttons > 0) {
            releaseVoice(triggerId);
          }
        }}
        onContextMenu={(event) => event.preventDefault()}
        type="button"
      >
        <div className="text-xs font-medium uppercase tracking-[0.28em] text-stone-400">
          Key {shortcut}
        </div>
        <div className="mt-2 text-4xl font-semibold">{degree}</div>
      </button>
    );
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl p-4 md:p-8">
      <header className="mb-4 flex flex-col gap-4 md:mb-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-slate-900 md:text-xl">
            Keyboard Mapping
          </h1>
          <p className="text-sm text-slate-600">
            {modes.find((entry) => entry.id === mode)?.description}
          </p>
        </div>

        <div className="inline-flex w-full rounded-2xl bg-stone-200 md:w-auto">
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

      <div className="rounded bg-slate-900 p-3 md:p-4">
        <div className="PianoKeyboard">
          <div className="PianoKeyboard__Naturals">
            {naturalNotes.map(renderKeyButton)}
          </div>

          {accidentalNotes.map((note) => (
            <div
              className="PianoKeyboard__AccidentalSlot"
              key={note.midiNumber}
              style={{
                left: `calc(${((note.naturalIndex + 1) / naturalKeyCount) * 100}% - (var(--accidental-width) / 2))`,
              }}
            >
              {renderKeyButton(note)}
            </div>
          ))}
        </div>
      </div>

      {mode === "nns" && (
        <div className="mt-4 grid gap-3 md:grid-cols-4 xl:grid-cols-7">
          {nnsDegrees.map(renderNnsDegreeButton)}
        </div>
      )}

      {mode === "chord" && (
        <div className="mt-4 grid gap-2 md:mb-6 md:grid-cols-2 xl:grid-cols-4">
          {chordTypes.map((chordType) => {
            const isActive = chordType.id === selectedChordTypeId;

            return (
              <button
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-amber-400 bg-amber-100 text-slate-900"
                    : "border-stone-300 bg-white text-slate-700 hover:border-stone-400"
                }`}
                key={chordType.id}
                onClick={() => handleChordTypeSelect(chordType)}
                type="button"
              >
                <span className="text-sm font-semibold">{chordType.label}</span>
                <span className="rounded-full bg-slate-900 px-2 py-1 text-xs font-medium uppercase tracking-[0.2em] text-stone-50">
                  {chordType.shortcut}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {mode === "chord" && (
        <div className="text-sm text-slate-600">
          Chord types are mapped to `Z X C V B N M` as major, minor, dominant 7, major 7, diminished 7, augmented 5, and half-diminished 7.
        </div>
      )}

      {mode === "nns" && (
        <div className="mt-4 grid gap-2 md:mb-6 md:grid-cols-2 xl:grid-cols-3">
          {nnsScales.map((scale) => {
            const isActive = scale.id === selectedNnsScaleId;

            return (
              <button
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-cyan-400 bg-cyan-100 text-slate-950"
                    : "border-stone-300 bg-white text-slate-700 hover:border-stone-400"
                }`}
                key={scale.id}
                onClick={() => handleNnsScaleSelect(scale)}
                type="button"
              >
                <span className="text-sm font-semibold">{scale.label}</span>
                <span className="rounded-full bg-slate-900 px-2 py-1 text-xs font-medium uppercase tracking-[0.2em] text-stone-50">
                  {scale.shortcut}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {mode === "nns" && (
        <div className="text-sm text-slate-600">
          Degrees are mapped to `1 2 3 4 5 6 7`. Scales are mapped to `{nnsScaleShortcuts.join(" ").toUpperCase()}`.
        </div>
      )}
    </main>
  );
}

export default App;
