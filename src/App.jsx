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
  const [pianoWidth, setPianoWidth] = useState(960);
  const [audioStatus, setAudioStatus] = useState("locked");

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

  const playNote = async (midiNumber) => {
    const sampler = await ensureAudioReady();
    const note = Tone.Frequency(midiNumber, "midi").toNote();

    sampler.triggerAttack(note);
  };

  const stopNote = (midiNumber) => {
    const sampler = samplerRef.current;
    const note = Tone.Frequency(midiNumber, "midi").toNote();

    if (sampler) {
      sampler.triggerRelease(note);
    }
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
    return () => {
      samplerRef.current?.dispose();
    };
  }, []);

  return (
    <main className="grid min-h-screen place-items-center p-4 md:p-8">
      <section className="relative w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-900/10 bg-stone-100 p-4 shadow-[0_24px_80px_rgba(39,34,26,0.08)] md:p-6">
        <div
          className="relative overflow-x-auto rounded-3xl bg-slate-900 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_40px_rgba(17,20,25,0.16)] md:p-4"
          ref={containerRef}
        >
          <Piano
            noteRange={{ first: firstNote, last: lastNote }}
            playNote={playNote}
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
