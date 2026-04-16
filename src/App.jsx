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
    label: "Chord Types",
    description:
      "Each shortcut triggers a chord built from the selected chord type.",
  },
  {
    id: "nns",
    label: "Scale Chords",
    description:
      "Play scale-degree chords from the piano keyboard while number and letter keys select the active scale.",
  },
];

const chordTypes = [
  {
    shortcut: "z",
    id: "maj",
    label: "Major",
    symbol: "maj",
    intervals: [0, 4, 7],
  },
  {
    shortcut: "x",
    id: "min",
    label: "Minor",
    symbol: "min",
    intervals: [0, 3, 7],
  },
  {
    shortcut: "c",
    id: "dom7",
    label: "Dominant 7",
    symbol: "7",
    intervals: [0, 4, 7, 10],
  },
  {
    shortcut: "v",
    id: "maj7",
    label: "Major 7",
    symbol: "maj7",
    intervals: [0, 4, 7, 11],
  },
  {
    shortcut: "b",
    id: "dim7",
    label: "Diminished 7",
    symbol: "dim7",
    intervals: [0, 3, 6, 9],
  },
  {
    shortcut: "n",
    id: "aug5",
    label: "Augmented",
    symbol: "aug5",
    intervals: [0, 4, 8],
  },
  {
    shortcut: "m",
    id: "halfDim7",
    label: "Half-diminished 7",
    symbol: "m7b5",
    intervals: [0, 3, 6, 10],
  },
];

const chordTypeByShortcut = Object.fromEntries(
  chordTypes.map((chordType) => [chordType.shortcut, chordType]),
);

const defaultChordType = chordTypes[0];
const nnsScaleShortcuts = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "z",
  "x",
  "c",
];
const tonicMidiNumber = Tone.Frequency("C3").toMidi();

const nnsScales = [
  {
    id: "diatonic",
    label: "Diatonic",
    shortcut: "1",
    intervals: [0, 2, 4, 5, 7, 9, 11],
  },
  {
    id: "jazzMinor",
    label: "Jazz Minor",
    shortcut: "2",
    intervals: [0, 2, 3, 5, 7, 9, 11],
  },
  {
    id: "neapolitanMinor",
    label: "Neapolitan Minor",
    shortcut: "3",
    intervals: [0, 1, 3, 5, 7, 8, 11],
  },
  {
    id: "gypsyMinor",
    label: "Gypsy Minor",
    shortcut: "4",
    intervals: [0, 2, 3, 6, 7, 8, 10],
  },
  {
    id: "hungarianMinor",
    label: "Hungarian Minor",
    shortcut: "5",
    intervals: [0, 2, 3, 6, 7, 8, 11],
  },
  {
    id: "hungarianMajor",
    label: "Hungarian Major",
    shortcut: "6",
    intervals: [0, 3, 4, 6, 7, 9, 10],
  },
  {
    id: "harmonicMinor",
    label: "Harmonic Minor",
    shortcut: "7",
    intervals: [0, 2, 3, 5, 7, 8, 11],
  },
  {
    id: "doubleHarmonic",
    label: "Double Harmonic",
    shortcut: "8",
    intervals: [0, 1, 4, 5, 7, 8, 11],
  },
  {
    id: "harmonicMajor",
    label: "Harmonic Major",
    shortcut: "9",
    intervals: [0, 2, 4, 5, 7, 8, 11],
  },
  {
    id: "romanianMajor",
    label: "Romanian Major",
    shortcut: "z",
    intervals: [0, 1, 4, 6, 7, 9, 10],
  },
  {
    id: "blues7",
    label: "Blues 7",
    shortcut: "x",
    intervals: [0, 2, 3, 4, 7, 9, 10],
  },
  {
    id: "enigmatic",
    label: "Enigmatic",
    shortcut: "c",
    intervals: [0, 1, 4, 6, 8, 10, 11],
  },
];

const nnsScaleByShortcut = Object.fromEntries(
  nnsScales.map((scale) => [scale.shortcut, scale]),
);

const defaultNnsScale = nnsScales[0];

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

const getScaleStep = (midiNumber, scaleIntervals) => {
  const distanceFromTonic = midiNumber - tonicMidiNumber;

  if (distanceFromTonic < 0) {
    return null;
  }

  const octaveOffset = Math.floor(distanceFromTonic / 12);
  const intervalWithinOctave = distanceFromTonic % 12;
  const degreeIndex = scaleIntervals.indexOf(intervalWithinOctave);

  if (degreeIndex === -1) {
    return null;
  }

  return octaveOffset * scaleIntervals.length + degreeIndex;
};

const getScaleDegree = (midiNumber, scaleIntervals) => {
  const scaleStep = getScaleStep(midiNumber, scaleIntervals);

  if (scaleStep === null) {
    return null;
  }

  return (scaleStep % scaleIntervals.length) + 1;
};

const degreeDisplayModes = [
  { id: "roman", label: "Roman Numeral" },
  { id: "nns", label: "NNS" },
];

const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII"];

const getScaleMidiNumberAtStep = (scaleStep, scaleIntervals) => {
  const wrappedIndex = scaleStep % scaleIntervals.length;
  const octaveOffset = Math.floor(scaleStep / scaleIntervals.length) * 12;

  return tonicMidiNumber + scaleIntervals[wrappedIndex] + octaveOffset;
};

const getRomanNumeralForScaleStep = (scaleStep, scaleIntervals) => {
  const degree = (scaleStep % scaleIntervals.length) + 1;
  const numeral = romanNumerals[degree - 1] ?? String(degree);
  const rootMidiNumber = getScaleMidiNumberAtStep(scaleStep, scaleIntervals);
  const thirdMidiNumber = getScaleMidiNumberAtStep(
    scaleStep + 2,
    scaleIntervals,
  );
  const fifthMidiNumber = getScaleMidiNumberAtStep(
    scaleStep + 4,
    scaleIntervals,
  );
  const thirdInterval = thirdMidiNumber - rootMidiNumber;
  const fifthInterval = fifthMidiNumber - rootMidiNumber;

  if (thirdInterval === 3 && fifthInterval === 6) {
    return `${numeral.toLowerCase()}°`;
  }

  if (thirdInterval === 4 && fifthInterval === 8) {
    return `${numeral}+`;
  }

  if (thirdInterval === 3) {
    return numeral.toLowerCase();
  }

  return numeral;
};

const getNnsLabelForScaleStep = (scaleStep, scaleIntervals) => {
  const degree = (scaleStep % scaleIntervals.length) + 1;
  const rootMidiNumber = getScaleMidiNumberAtStep(scaleStep, scaleIntervals);
  const thirdMidiNumber = getScaleMidiNumberAtStep(
    scaleStep + 2,
    scaleIntervals,
  );
  const fifthMidiNumber = getScaleMidiNumberAtStep(
    scaleStep + 4,
    scaleIntervals,
  );
  const thirdInterval = thirdMidiNumber - rootMidiNumber;
  const fifthInterval = fifthMidiNumber - rootMidiNumber;

  if (thirdInterval === 3 && fifthInterval === 6) {
    return `${degree}°`;
  }

  if (thirdInterval === 4 && fifthInterval === 8) {
    return `${degree}+`;
  }

  if (thirdInterval === 3) {
    return `${degree}-`;
  }

  return String(degree);
};

const formatScaleDegree = (scaleStep, displayMode, scaleIntervals) => {
  if (scaleStep === null) {
    return null;
  }

  if (displayMode === "roman") {
    return getRomanNumeralForScaleStep(scaleStep, scaleIntervals);
  }

  return getNnsLabelForScaleStep(scaleStep, scaleIntervals);
};

const getSamplerVolumeDb = (volumePercent) => {
  if (volumePercent <= 0) {
    return -60;
  }

  return Tone.gainToDb(volumePercent / 100);
};

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
  const [selectedChordTypeId, setSelectedChordTypeId] = useState(
    defaultChordType.id,
  );
  const [selectedNnsScaleId, setSelectedNnsScaleId] = useState(
    defaultNnsScale.id,
  );
  const [degreeDisplayMode, setDegreeDisplayMode] = useState("roman");
  const [volume, setVolume] = useState(80);
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

    sampler.volume.value = getSamplerVolumeDb(volume);
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
      const midiNumber = Number(triggerId);
      const scaleStep = getScaleStep(midiNumber, selectedNnsScale.intervals);

      if (scaleStep === null) {
        return null;
      }

      const chordSteps = [scaleStep, scaleStep + 2, scaleStep + 4];
      const midiNumbers = chordSteps.map((step) => {
        const wrappedIndex = step % selectedNnsScale.intervals.length;
        const octaveOffset =
          Math.floor(step / selectedNnsScale.intervals.length) * 12;

        return (
          tonicMidiNumber +
          selectedNnsScale.intervals[wrappedIndex] +
          octaveOffset
        );
      });

      return {
        label: `${Tone.Frequency(midiNumber, "midi").toNote()} (${selectedNnsScale.label})`,
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

    if (!voice) {
      return;
    }

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
    stopAllVoices();
    pressedKeyboardKeysRef.current.clear();
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
    if (samplerRef.current) {
      samplerRef.current.volume.value = getSamplerVolumeDb(volume);
    }
  }, [volume]);

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

      const midiNumber = midiNumberByShortcut[key];

      if (!midiNumber || pressedKeyboardKeysRef.current.has(key)) {
        return;
      }

      if (
        modeRef.current === "nns" &&
        getScaleStep(midiNumber, nnsScaleRef.current.intervals) === null
      ) {
        return;
      }

      event.preventDefault();
      pressedKeyboardKeysRef.current.add(key);
      void startVoiceRef.current?.(midiNumber, modeRef.current);
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
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
    const scaleStep =
      mode === "nns"
        ? getScaleStep(note.midiNumber, nnsScaleRef.current.intervals)
        : null;
    const displayDegree = formatScaleDegree(
      scaleStep,
      degreeDisplayMode,
      nnsScaleRef.current.intervals,
    );
    const isNnsScaleNote = mode === "nns" && scaleStep !== null;
    const isDisabledInNns = mode === "nns" && !isNnsScaleNote;
    const keyLabel = note.keyboardShortcut.toUpperCase();

    return (
      <button
        className={[
          "PianoKey",
          note.isAccidental ? "PianoKey--accidental" : "PianoKey--natural",
          isDisabledInNns ? "PianoKey--disabled" : "",
          isPrimaryActive ? "PianoKey--primary-active" : "",
          isSecondaryActive ? "PianoKey--secondary-active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        key={note.midiNumber}
        disabled={isDisabledInNns}
        onPointerDown={(event) => {
          event.preventDefault();
          if (isDisabledInNns) {
            return;
          }
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
        <span className="PianoKey__Label">
          {keyLabel}
          {displayDegree !== null ? ` · ${displayDegree}` : ""}
        </span>
      </button>
    );
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl p-4 md:p-8">
      <header className="mb-4 flex flex-col gap-4 md:mb-6 md:flex-row md:items-center md:justify-between">
        <label className="flex w-full items-center gap-3 max-w-80 text-sm text-slate-700">
          <span className="min-w-0 flex-none font-medium">Volume</span>
          <input
            className="w-full accent-slate-900"
            max="100"
            min="0"
            onChange={(event) => setVolume(Number(event.target.value))}
            type="range"
            value={volume}
          />
          <span className="w-10 flex-none text-right font-medium tabular-nums">
            {volume}
          </span>
        </label>
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-slate-900 md:text-xl">
            Keyboard Mapping
          </h1>
          <p className="text-sm text-slate-600">
            {modes.find((entry) => entry.id === mode)?.description}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 md:w-auto md:items-end">
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
          Chord types are mapped to `Z X C V B N M` as major, minor, dominant 7,
          major 7, diminished 7, augmented 5, and half-diminished 7.
        </div>
      )}

      {mode === "nns" && (
        <div className="mt-4 inline-flex w-full rounded-2xl bg-stone-200 md:w-auto">
          {degreeDisplayModes.map((entry) => {
            const isActive = entry.id === degreeDisplayMode;

            return (
              <button
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition md:flex-none ${
                  isActive
                    ? "bg-slate-900 text-stone-50 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                key={entry.id}
                onClick={() => setDegreeDisplayMode(entry.id)}
                type="button"
              >
                {entry.label}
              </button>
            );
          })}
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
          Scale selection is mapped to `
          {nnsScaleShortcuts.join(" ").toUpperCase()}`. In-scale notes are
          highlighted on the keyboard, and pressing one plays the corresponding
          numbered chord.
        </div>
      )}
    </main>
  );
}

export default App;
