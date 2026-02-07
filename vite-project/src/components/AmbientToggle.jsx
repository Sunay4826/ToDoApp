import React, { useEffect, useRef, useState } from "react";

export function AmbientToggle() {
    const [enabled, setEnabled] = useState(false);
    const contextRef = useRef(null);
    const oscillatorRef = useRef(null);
    const lfoRef = useRef(null);

    useEffect(() => {
        if (!enabled) {
            if (oscillatorRef.current) {
                oscillatorRef.current.stop();
                oscillatorRef.current.disconnect();
                oscillatorRef.current = null;
            }
            if (lfoRef.current) {
                lfoRef.current.stop();
                lfoRef.current.disconnect();
                lfoRef.current = null;
            }
            if (contextRef.current) {
                contextRef.current.close();
                contextRef.current = null;
            }
            return;
        }

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const context = new AudioContext();
        const oscillator = context.createOscillator();
        const lfo = context.createOscillator();
        const lfoGain = context.createGain();
        const gain = context.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = 110;
        gain.gain.value = 0.02;

        lfo.type = "sine";
        lfo.frequency.value = 0.2;
        lfoGain.gain.value = 0.015;

        lfo.connect(lfoGain).connect(gain.gain);
        oscillator.connect(gain).connect(context.destination);

        oscillator.start();
        lfo.start();

        contextRef.current = context;
        oscillatorRef.current = oscillator;
        lfoRef.current = lfo;

        return () => {
            if (oscillatorRef.current) {
                oscillatorRef.current.stop();
                oscillatorRef.current.disconnect();
                oscillatorRef.current = null;
            }
            if (lfoRef.current) {
                lfoRef.current.stop();
                lfoRef.current.disconnect();
                lfoRef.current = null;
            }
            if (contextRef.current) {
                contextRef.current.close();
                contextRef.current = null;
            }
        };
    }, [enabled]);

    return (
        <button
            className={`ambient-toggle ${enabled ? "active" : ""}`}
            onClick={() => setEnabled((prev) => !prev)}
        >
            {enabled ? "Ambient On" : "Ambient Off"}
        </button>
    );
}
