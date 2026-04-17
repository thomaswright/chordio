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
  {
    id: "piano",
    label: "Free Piano",
    description: "Each shortcut plays a single piano note.",
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
const lowestSampleMidiNumber = Tone.Frequency("A0").toMidi();
const highestSampleMidiNumber = Tone.Frequency("C8").toMidi();
const minOctaveShift = Math.ceil((lowestSampleMidiNumber - firstNote) / 12);
const maxOctaveShift = Math.floor((highestSampleMidiNumber - lastNote) / 12);
const pianoSamplesBaseUrl = `${import.meta.env.BASE_URL}piano-samples/`;

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

const getPianoNotes = (octaveShift = 0) => {
  let naturalIndex = -1;
  const semitoneOffset = octaveShift * 12;

  return midiNumbersInRange.map((midiNumber) => {
    const shiftedMidiNumber = midiNumber + semitoneOffset;
    const noteName = Tone.Frequency(shiftedMidiNumber, "midi").toNote();
    const isAccidental = noteName.includes("#");

    if (!isAccidental) {
      naturalIndex += 1;
    }

    return {
      midiNumber: shiftedMidiNumber,
      noteName,
      isAccidental,
      naturalIndex,
      keyboardShortcut: shortcutByMidiNumber[midiNumber],
    };
  });
};

const getTonicMidiNumber = (octaveShift = 0) =>
  tonicMidiNumber + octaveShift * 12;

const getScaleStep = (midiNumber, scaleIntervals, activeTonicMidiNumber) => {
  const distanceFromActiveTonic = midiNumber - activeTonicMidiNumber;

  if (distanceFromActiveTonic < 0) {
    return null;
  }

  const octaveOffset = Math.floor(distanceFromActiveTonic / 12);
  const intervalWithinOctave = distanceFromActiveTonic % 12;
  const degreeIndex = scaleIntervals.indexOf(intervalWithinOctave);

  if (degreeIndex === -1) {
    return null;
  }

  return octaveOffset * scaleIntervals.length + degreeIndex;
};

const getScaleDegree = (midiNumber, scaleIntervals, activeTonicMidiNumber) => {
  const scaleStep = getScaleStep(
    midiNumber,
    scaleIntervals,
    activeTonicMidiNumber,
  );

  if (scaleStep === null) {
    return null;
  }

  return (scaleStep % scaleIntervals.length) + 1;
};

const degreeDisplayModes = [
  { id: "roman", label: "Roman Numeral" },
  { id: "nns", label: "NNS" },
  { id: "none", label: "None" },
];
const pianoLabelModes = [
  { id: "key", label: "Key" },
  { id: "note", label: "Note" },
  { id: "none", label: "None" },
];
const nnsChordToneOptions = [
  { id: 0, label: "1" },
  { id: 1, label: "2" },
  { id: 2, label: "3" },
  { id: 3, label: "4" },
  { id: 4, label: "5" },
  { id: 5, label: "6" },
  { id: 6, label: "7" },
];

const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII"];

const getScaleMidiNumberAtStep = (
  scaleStep,
  scaleIntervals,
  activeTonicMidiNumber,
) => {
  const wrappedIndex = scaleStep % scaleIntervals.length;
  const octaveOffset = Math.floor(scaleStep / scaleIntervals.length) * 12;

  return activeTonicMidiNumber + scaleIntervals[wrappedIndex] + octaveOffset;
};

const getRomanNumeralForScaleStep = (
  scaleStep,
  scaleIntervals,
  activeTonicMidiNumber,
) => {
  const degree = (scaleStep % scaleIntervals.length) + 1;
  const numeral = romanNumerals[degree - 1] ?? String(degree);
  const rootMidiNumber = getScaleMidiNumberAtStep(
    scaleStep,
    scaleIntervals,
    activeTonicMidiNumber,
  );
  const thirdMidiNumber = getScaleMidiNumberAtStep(
    scaleStep + 2,
    scaleIntervals,
    activeTonicMidiNumber,
  );
  const fifthMidiNumber = getScaleMidiNumberAtStep(
    scaleStep + 4,
    scaleIntervals,
    activeTonicMidiNumber,
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

const getNnsLabelForScaleStep = (
  scaleStep,
  scaleIntervals,
  activeTonicMidiNumber,
) => {
  const degree = (scaleStep % scaleIntervals.length) + 1;
  const rootMidiNumber = getScaleMidiNumberAtStep(
    scaleStep,
    scaleIntervals,
    activeTonicMidiNumber,
  );
  const thirdMidiNumber = getScaleMidiNumberAtStep(
    scaleStep + 2,
    scaleIntervals,
    activeTonicMidiNumber,
  );
  const fifthMidiNumber = getScaleMidiNumberAtStep(
    scaleStep + 4,
    scaleIntervals,
    activeTonicMidiNumber,
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

const formatScaleDegree = (
  scaleStep,
  displayMode,
  scaleIntervals,
  activeTonicMidiNumber,
) => {
  if (scaleStep === null) {
    return null;
  }

  if (displayMode === "none") {
    return null;
  }

  if (displayMode === "roman") {
    return getRomanNumeralForScaleStep(
      scaleStep,
      scaleIntervals,
      activeTonicMidiNumber,
    );
  }

  return getNnsLabelForScaleStep(
    scaleStep,
    scaleIntervals,
    activeTonicMidiNumber,
  );
};

const getDisplayNoteName = (noteName) => noteName.replace(/[0-9]/g, "");

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
  const modeRef = useRef("nns");
  const chordTypeRef = useRef(defaultChordType);
  const nnsScaleRef = useRef(defaultNnsScale);
  const octaveShiftRef = useRef(0);
  const startVoiceRef = useRef(null);
  const releaseVoiceRef = useRef(null);
  const stopAllVoicesRef = useRef(null);
  const [audioStatus, setAudioStatus] = useState("locked");
  const [mode, setMode] = useState("nns");
  const [selectedChordTypeId, setSelectedChordTypeId] = useState(
    defaultChordType.id,
  );
  const [selectedNnsScaleId, setSelectedNnsScaleId] = useState(
    defaultNnsScale.id,
  );
  const [degreeDisplayMode, setDegreeDisplayMode] = useState("roman");
  const [pianoLabelMode, setPianoLabelMode] = useState("key");
  const [selectedNnsChordToneIds, setSelectedNnsChordToneIds] = useState([
    0, 2, 4,
  ]);
  const [volume, setVolume] = useState(80);
  const [octaveShift, setOctaveShift] = useState(0);
  const [activeTriggerIds, setActiveTriggerIds] = useState([]);
  const [secondaryActiveMidiNumbers, setSecondaryActiveMidiNumbers] = useState(
    [],
  );
  const pianoNotes = getPianoNotes(octaveShift);
  const currentTonicMidiNumber = getTonicMidiNumber(octaveShift);
  const naturalNotes = pianoNotes.filter((note) => !note.isAccidental);
  const accidentalNotes = pianoNotes.filter((note) => note.isAccidental);
  const naturalKeyCount = naturalNotes.length;
  const canShiftOctaveDown = octaveShift > minOctaveShift;
  const canShiftOctaveUp = octaveShift < maxOctaveShift;
  const pianoRangeLabel = `${naturalNotes[0]?.noteName ?? ""}`;

  const createSampler = () => {
    if (samplerRef.current) {
      return samplerRef.current;
    }

    setAudioStatus("loading");

    const sampler = new Tone.Sampler({
      urls: pianoSampleUrls,
      release: 1.4,
      baseUrl: pianoSamplesBaseUrl,
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
      const scaleStep = getScaleStep(
        midiNumber,
        selectedNnsScale.intervals,
        getTonicMidiNumber(octaveShiftRef.current),
      );

      if (scaleStep === null) {
        return null;
      }

      const chordSteps = selectedNnsChordToneIds.map(
        (toneId) => scaleStep + toneId,
      );
      const activeTonicMidiNumber = getTonicMidiNumber(octaveShiftRef.current);
      const midiNumbers = chordSteps.map((step) =>
        getScaleMidiNumberAtStep(
          step,
          selectedNnsScale.intervals,
          activeTonicMidiNumber,
        ),
      );

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

  const handleNnsChordToneToggle = (toneId) => {
    setSelectedNnsChordToneIds((currentToneIds) => {
      const isSelected = currentToneIds.includes(toneId);

      if (isSelected && currentToneIds.length === 1) {
        return currentToneIds;
      }

      stopAllVoices();
      pressedKeyboardKeysRef.current.clear();

      if (isSelected) {
        return currentToneIds.filter(
          (currentToneId) => currentToneId !== toneId,
        );
      }

      return [...currentToneIds, toneId].sort((left, right) => left - right);
    });
  };

  const handleOctaveShift = (delta) => {
    setOctaveShift((currentOctaveShift) => {
      const nextOctaveShift = Math.min(
        maxOctaveShift,
        Math.max(minOctaveShift, currentOctaveShift + delta),
      );

      if (nextOctaveShift === currentOctaveShift) {
        return currentOctaveShift;
      }

      stopAllVoices();
      pressedKeyboardKeysRef.current.clear();
      return nextOctaveShift;
    });
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
    octaveShiftRef.current = octaveShift;
  }, [octaveShift]);

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

      const isIgnoredFormField =
        target instanceof HTMLInputElement
          ? target.type !== "range"
          : target instanceof HTMLElement &&
            (target.isContentEditable ||
              target.tagName === "TEXTAREA" ||
              target.tagName === "SELECT");

      return (
        event.metaKey || event.ctrlKey || event.altKey || isIgnoredFormField
      );
    };

    const handleKeyDown = (event) => {
      if (shouldIgnoreKeyboardEvent(event) || event.repeat) {
        return;
      }

      const key = event.key.toLowerCase();

      if (event.key === "-") {
        event.preventDefault();
        handleOctaveShift(-1);
        return;
      }

      if (event.key === "+") {
        event.preventDefault();
        handleOctaveShift(1);
        return;
      }

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

      const baseMidiNumber = midiNumberByShortcut[key];
      const midiNumber =
        baseMidiNumber === undefined
          ? undefined
          : baseMidiNumber + octaveShiftRef.current * 12;

      if (!midiNumber || pressedKeyboardKeysRef.current.has(key)) {
        return;
      }

      if (
        modeRef.current === "nns" &&
        getScaleStep(
          midiNumber,
          nnsScaleRef.current.intervals,
          getTonicMidiNumber(octaveShiftRef.current),
        ) === null
      ) {
        return;
      }

      event.preventDefault();
      pressedKeyboardKeysRef.current.add(key);
      void startVoiceRef.current?.(midiNumber, modeRef.current);
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      const baseMidiNumber = midiNumberByShortcut[key];
      const midiNumber =
        baseMidiNumber === undefined
          ? undefined
          : baseMidiNumber + octaveShiftRef.current * 12;

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
        ? getScaleStep(
            note.midiNumber,
            nnsScaleRef.current.intervals,
            currentTonicMidiNumber,
          )
        : null;
    const displayDegree = formatScaleDegree(
      scaleStep,
      degreeDisplayMode,
      nnsScaleRef.current.intervals,
      currentTonicMidiNumber,
    );
    const isNnsScaleNote = mode === "nns" && scaleStep !== null;
    const isDisabledInNns = mode === "nns" && !isNnsScaleNote;
    const primaryLabel =
      pianoLabelMode === "key"
        ? note.keyboardShortcut.toUpperCase()
        : pianoLabelMode === "note"
          ? getDisplayNoteName(note.noteName)
          : "";
    const fullLabel =
      primaryLabel && displayDegree !== null
        ? `${primaryLabel} · ${displayDegree}`
        : primaryLabel || displayDegree || "";

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
        {fullLabel ? (
          <span className="PianoKey__Label">{fullLabel}</span>
        ) : null}
      </button>
    );
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl p-4">
      <header className="mb-4 flex flex-col gap-3  ">
        <div className="w-full flex flex-row items-center justify-center font-black text-3xl leading-none -mb-2">
          Chordio
        </div>
        <div className="flex w-full flex-col gap-3 items-center">
          <div className="inline-flex max-w-md rounded-2xl bg-plain-300">
            {modes.map((entry) => {
              const isActive = entry.id === mode;

              return (
                <button
                  className={`flex-none rounded-xl px-4 py-2 text-sm font-medium transition md:flex-none ${
                    isActive
                      ? "bg-theme-900 text-plain-50 shadow-sm"
                      : "text-theme-600 hover:text-theme-900"
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
        <div className="flex w-full flex-row gap-3 justify-between flex-wrap">
          <div className="flex flex-none flex-row gap-3 items-center">
            <div className="mb-1 flex-none text-sm font-medium text-theme-800">
              Key Label
            </div>
            <div className="inline-flex w-fit rounded-2xl bg-plain-300">
              {pianoLabelModes.map((entry) => {
                const isActive = entry.id === pianoLabelMode;

                return (
                  <button
                    className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-theme-900 text-plain-50 shadow-sm"
                        : "text-theme-600 hover:text-theme-900"
                    }`}
                    key={entry.id}
                    onClick={() => setPianoLabelMode(entry.id)}
                    type="button"
                  >
                    {entry.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-none items-center gap-3 text-sm text-theme-800">
            <div className="inline-flex w-fit items-center rounded-2xl bg-plain-300">
              <button
                className="rounded-l-xl px-4 py-1 text-lg font-medium text-theme-800 transition enabled:hover:text-theme-900 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!canShiftOctaveDown}
                onClick={() => handleOctaveShift(-1)}
                type="button"
              >
                -
              </button>
              <div className="w-fit px-2 text-center font-medium tabular-nums text-theme-900">
                {pianoRangeLabel}
              </div>
              <button
                className="rounded-r-xl px-4 py-1 text-lg font-medium text-theme-800 transition enabled:hover:text-theme-900 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!canShiftOctaveUp}
                onClick={() => handleOctaveShift(1)}
                type="button"
              >
                +
              </button>
            </div>
          </div>

          <label className="flex max-w-60 w-full flex-none items-center gap-3 text-sm text-theme-800">
            <span className="min-w-0 flex-none font-medium">Volume</span>
            <input
              className="w-full accent-theme-900"
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
        </div>
      </header>

      <div className="rounded bg-theme-900 p-3 md:p-4">
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
                    ? "border-theme-400 bg-theme-200 text-theme-900"
                    : "border-plain-300 bg-plain-50 text-theme-600 hover:border-plain-400"
                }`}
                key={chordType.id}
                onClick={() => handleChordTypeSelect(chordType)}
                type="button"
              >
                <span className="text-sm font-semibold">{chordType.label}</span>
                <span className="rounded-full bg-theme-900 px-2 py-1 text-xs font-medium uppercase tracking-[0.2em] text-plain-50">
                  {chordType.shortcut}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {mode === "nns" && (
        <div className="mt-4 flex flex-row items-center gap-3">
          <div className="flex-none text-sm font-medium text-theme-900">
            Degree Label
          </div>
          <div className="inline-flex w-fit rounded-2xl bg-plain-300">
            {degreeDisplayModes.map((entry) => {
              const isActive = entry.id === degreeDisplayMode;

              return (
                <button
                  className={` flex-none rounded-xl px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-theme-900 text-plain-50 shadow-sm"
                      : "text-theme-600 hover:text-theme-900"
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
        </div>
      )}

      {mode === "nns" && (
        <div className="mt-4">
          <div className="mb-2 text-sm font-medium text-theme-900">
            Chord Degrees
          </div>
          <div className="grid gap-2 grid-cols-4 sm:grid-cols-7">
            {nnsChordToneOptions.map((toneOption) => {
              const isActive = selectedNnsChordToneIds.includes(toneOption.id);

              return (
                <button
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-theme-600 transition ${
                    isActive
                      ? "border-theme-400 bg-theme-200 text-theme-950"
                      : "border-plain-300 bg-plain-50 hover:border-plain-400"
                  }`}
                  key={toneOption.id}
                  onClick={() => handleNnsChordToneToggle(toneOption.id)}
                  type="button"
                >
                  {toneOption.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {mode === "nns" && (
        <div className="mt-4">
          <div className="mb-2 text-sm font-medium text-theme-900">Scale</div>
          <div className="grid gap-2 md:mb-6 md:grid-cols-2 xl:grid-cols-3">
            {nnsScales.map((scale) => {
              const isActive = scale.id === selectedNnsScaleId;

              return (
                <button
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                    isActive
                      ? "border-theme-400 bg-theme-200 text-theme-950"
                      : "border-plain-300 bg-plain-50 text-theme-600 hover:border-plain-400"
                  }`}
                  key={scale.id}
                  onClick={() => handleNnsScaleSelect(scale)}
                  type="button"
                >
                  <span className="text-sm font-semibold">{scale.label}</span>
                  <span className="rounded-full bg-theme-900 px-2 py-1 text-xs font-medium uppercase tracking-[0.2em] text-plain-50">
                    {scale.shortcut}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
