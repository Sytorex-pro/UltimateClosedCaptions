import { useEffect, useState } from "react";
import { TranscriptData } from "../context/SocketContext";


// Minimum text length before spliting it
const SPLIT_MIN_LENGTH = 200;

/** Speech recognition using Web Speech API */
export function useSpeechRecognition( { handleText, lang, listening, splitDelay, delay }: {
		handleText: (transcript: TranscriptData) => void,
		lang?: string,
		listening: boolean,
		splitDelay: number,
		delay: number
	}
) {
	const [error, setError] = useState<string>();
	const [text, setText] = useState<string>('');

	useEffect(()=>{

		let stopFunc = ()=>{};
		let stopped = false;
		if(listening) {
			const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
			if(!SpeechRecognition) {
				setError('Speech recognition not supported in this browser, try using Chrome or Edge');
				return;
			}
			if(!lang) {
				setError('No language selected');
				return;
			}
			setError(undefined);

			const recognition = new SpeechRecognition();
			recognition.lang = lang;
			recognition.continuous = true;
			recognition.interimResults = true;
			recognition.maxAlternatives = 1;

			// Log relevant errors
			recognition.onerror = (event) => {
				if(event.error !== 'aborted' && event.error !== 'no-speech' && event.error !== 'network') {
					setError('Speech recognition error : '+event.error);
					console.error('Speech recognition error', event.error);
				}
			}

			let startTime: number = 0;
			recognition.onstart = () => {
				if(!startTime) startTime = Date.now();
			}

			//Restart recognition when it ends itself
			recognition.onend = () => {
				if(!stopped) {
					// If stopping just after start: Probably not supported
					if(startTime && ( (Date.now() - startTime) < 1000 ) ) {
						setError('Couldn\'t start speech recognition, it may not be supported in your browser, try using Chrome or Edge');
					}else{
						recognition.start();
					}
				}
			}

			// Timestamp for last partial caption
			let lastCaptions: number | null = null;
			// Last text
			let lastText = '';
			// Length of text to ignore (When start of text as already been sent as final)
			let ignoreLength = 0;

			recognition.onresult = (event) => {
				const result = event.results[event.resultIndex];

				const text = normalizeTranscript(result[0].transcript);

				setText(text);

				// Ignore partials between each partial caption
				if(!result.isFinal && lastCaptions && ( (lastCaptions + splitDelay) > Date.now() ) ) {
					return;
				}

				// Ignore first partial captions
				if(text && (result.isFinal || lastCaptions) ) {

					// Duration/delay is time since last partial sent
					// Default duration is split delay ( happens mostly when results received in wrong order )
					let duration = splitDelay;
					if(lastCaptions) {
						duration = Date.now() - lastCaptions;
					}

					let currentPart = text.slice(ignoreLength).trim();

					// If partial text too long: try to split it
					// Possible upgrade in the future: Find more reliable ways to split text
					if(!result.isFinal && currentPart.length > SPLIT_MIN_LENGTH && lastText.length && text.toLowerCase().startsWith(lastText.toLowerCase()) ) {

						// Text splitted: Send last part as final + Send next part as first partial
						const part = lastText.slice(ignoreLength);
						// Send first sentence part as final
						handleText({
							final: true,
							lang,
							duration: 0,
							text: part,
							delay: duration - (delay - 500)
						});

						ignoreLength = lastText.length;
						currentPart = text.slice(ignoreLength).trim();

						// Send next part as partial
						handleText({
							final: false,
							lang,
							duration,
							text: currentPart,
							delay: duration - (delay + 250)
						});
					}else{
						// Text not splitted
						// Send it normally
						handleText({
							text: currentPart,
							lang,
							duration,
							delay: duration - delay,
							final: result.isFinal
						});
					}

					if(!result.isFinal) {
						// Store partial text to compare it with next version
						lastText = text;
					}else{
						// Clear partial text when finished
						lastText = '';
						ignoreLength = 0;
					}
				}

				if(result.isFinal) {
					// Reset timestamps when sentence ends
					lastCaptions = null;
				}else{
					// Setup timestamp for next partial time
					lastCaptions = Date.now();
				}
			}

			recognition.start();

			stopFunc = () =>{
				recognition.abort();
			}
		}else{
			setText('');
		}

		return ()=>{
			stopped = true;
			stopFunc();
		}

	}, [ listening, lang, splitDelay, delay, handleText ]);

	return { error, text };
}

// Get transcript a bit more consistent accross web browsers
function normalizeTranscript(text: string) {
	// Trim
	text = text.trim();
	
	// Make first letter always uppercase
	text = text.charAt(0).toLocaleUpperCase() + text.slice(1);

	// Remove any "." at the end (-1 char on each sentence when using Edge)
	if(text.endsWith('.')) {
		text = text.slice(0,-1).trim();
	}

	return text;
}