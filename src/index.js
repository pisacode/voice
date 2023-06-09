import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import invariant from 'invariant';
const Voice = NativeModules.Voice;
// NativeEventEmitter is only availabe on React Native platforms, so this conditional is used to avoid import conflicts in the browser/server
const voiceEmitter = Platform.OS !== 'web' ? new NativeEventEmitter(Voice) : null;
class RCTVoice {
    constructor() {
        this._loaded = false;
        this._listeners = null;
        this._events = {
            onSpeechStart: () => { },
            onSpeechRecognized: () => { },
            onSpeechEnd: () => { },
            onSpeechError: () => { },
            onSpeechResults: () => { },
            onSpeechPartialResults: () => { },
            onSpeechVolumeChanged: () => { },
        };
    }
    removeAllListeners() {
        Voice.onSpeechStart = undefined;
        Voice.onSpeechRecognized = undefined;
        Voice.onSpeechEnd = undefined;
        Voice.onSpeechError = undefined;
        Voice.onSpeechResults = undefined;
        Voice.onSpeechPartialResults = undefined;
        Voice.onSpeechVolumeChanged = undefined;
    }
    destroy() {
        if (!this._loaded && !this._listeners) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            Voice.destroySpeech((error) => {
                if (error) {
                    reject(new Error(error));
                }
                else {
                    if (this._listeners) {
                        this._listeners.map((listener) => listener.remove());
                        this._listeners = null;
                    }
                    resolve(undefined);
                }
            });
        });
    }
    start(locale, options = {}) {
        if (!this._loaded && !this._listeners && voiceEmitter !== null) {
            this._listeners = Object.keys(this._events).map((key) => voiceEmitter.addListener(key, this._events[key]));
        }
        return new Promise((resolve, reject) => {
            const callback = (error) => {
                if (error) {
                    reject(new Error(error));
                }
                else {
                    resolve(null);
                }
            };
            if (Platform.OS === 'android') {
                Voice.startSpeech(locale, Object.assign({
                    EXTRA_LANGUAGE_MODEL: 'LANGUAGE_MODEL_FREE_FORM',
                    EXTRA_MAX_RESULTS: 5,
                    EXTRA_PARTIAL_RESULTS: true,
                    REQUEST_PERMISSIONS_AUTO: true,
                }, options), callback);
            }
            else {
                Voice.startSpeech(locale, callback);
            }
        });
    }
    stop() {
        if (!this._loaded && !this._listeners) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            Voice.stopSpeech((error) => {
                if (error) {
                    reject(new Error(error));
                }
                else {
                    resolve(undefined);
                }
            });
        });
    }
    cancel() {
        if (!this._loaded && !this._listeners) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            Voice.cancelSpeech((error) => {
                if (error) {
                    reject(new Error(error));
                }
                else {
                    resolve(undefined);
                }
            });
        });
    }
    isAvailable() {
        return new Promise((resolve, reject) => {
            Voice.isSpeechAvailable((isAvailable, error) => {
                if (error) {
                    reject(new Error(error));
                }
                else {
                    resolve(isAvailable);
                }
            });
        });
    }
    /**
     * (Android) Get a list of the speech recognition engines available on the device
     * */
    getSpeechRecognitionServices() {
        if (Platform.OS !== 'android') {
            invariant(Voice, 'Speech recognition services can be queried for only on Android');
            return;
        }
        return Voice.getSpeechRecognitionServices();
    }
    isRecognizing() {
        return new Promise((resolve) => {
            Voice.isRecognizing((isRecognizing) => resolve(isRecognizing));
        });
    }
    set onSpeechStart(fn) {
        this._events.onSpeechStart = fn;
    }
    set onSpeechRecognized(fn) {
        this._events.onSpeechRecognized = fn;
    }
    set onSpeechEnd(fn) {
        this._events.onSpeechEnd = fn;
    }
    set onSpeechError(fn) {
        this._events.onSpeechError = fn;
    }
    set onSpeechResults(fn) {
        this._events.onSpeechResults = fn;
    }
    set onSpeechPartialResults(fn) {
        this._events.onSpeechPartialResults = fn;
    }
    set onSpeechVolumeChanged(fn) {
        this._events.onSpeechVolumeChanged = fn;
    }
}
export default new RCTVoice();
//# sourceMappingURL=index.js.map