import React, { useState, useRef, useMemo, useCallback } from "react";
import dark_power from "./assets/dark_power.mp3";
import hurts from "./assets/hurts.mp3";
import online from "./assets/online.mp3";
import support from "./assets/support.mp3";
import SelectionWheel from "./components/selectionwheel";
import { useEventListener } from "./useEventListener";
import HealingSpell from "./shader/HealingSpell";
import "./index.scss";

function App() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [selection, setSelection] = useState(null);

  const dark_powerAudio = useMemo(() => new Audio(dark_power), [dark_power]);
  const hurtsAudio = useMemo(() => new Audio(hurts), [hurts]);
  const onlineAudio = useMemo(() => new Audio(online), [online]);
  const supportAudio = useMemo(() => new Audio(support), [support]);

  const playAudio = () => {
    console.log("playaudio", selection);

    if (selection === null) return;

    switch (selection) {
      case "opt-1":
        dark_powerAudio.play();
        break;
      case "opt-2":
        hurtsAudio.play();
        break;
      case "opt-3":
        onlineAudio.play();
        break;
      case "opt-4":
        supportAudio.play();
        break;
      default:
        console.error("Failed played audio");
        break;
    }
  };

  const handler = useCallback(
    ({ code }: { code: string }) => {
      if (code === "KeyE") {
        setShowOverlay(true);
      }
      return;
    },
    [setShowOverlay]
  );

  const handlerKeyup = useCallback(
    ({ code }: { code: string }) => {
      if (code === "KeyE") {
        setShowOverlay(false);
        playAudio();
      }
      return;
    },
    [setShowOverlay, selection]
  );
  // Add event listener using our hook
  useEventListener("keydown", handler);
  useEventListener("keyup", handlerKeyup);

  return (
    <>
      <div className="App">
        {showOverlay ? (
          <SelectionWheel onSelected={setSelection} />
        ) : (
          <div style={{ position: "absolute" }}>
            <h3>Please Press KeyE</h3>
          </div>
        )}

        <HealingSpell></HealingSpell>
      </div>
    </>
  );
}

export default App;
