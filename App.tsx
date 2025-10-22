import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MergeMode, type MergeSettings, type MergeOption } from './types';
import SelectInput from './components/SelectInput';
import NumberInput from './components/NumberInput';
import FileInput from './components/FileInput';

const MERGE_OPTIONS: MergeOption[] = [
  {
    value: MergeMode.MatchAudio,
    label: '🟢 Match Video to Audio Length',
    explanation: 'The video duration will be adjusted to match the audio length.',
  },
  {
    value: MergeMode.ExtendVideo,
    label: '🟠 Extend Video by Extra Duration',
    explanation: 'The video will be extended by the duration you provide.',
  },
  {
    value: MergeMode.FixedDuration,
    label: '🔵 Fixed Custom Duration',
    explanation: 'Both video and audio will be set to a fixed, custom duration.',
  },
  {
    value: MergeMode.TrimAudio,
    label: '🟣 Trim Audio to Video Length',
    explanation: "The audio will be trimmed to match the video's original length.",
  },
  {
    value: MergeMode.LoopShorter,
    label: '🟤 Loop Shorter One',
    explanation: 'The shorter of the two files (audio or video) will be looped to match the longer one.',
  },
];

const App: React.FC = () => {
  const [settings, setSettings] = useState<MergeSettings>({
    mergeMode: MergeMode.MatchAudio,
    extraDuration: '',
    fixedDuration: '',
  });

  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  
  useEffect(() => {
    // Clean up the object URL to avoid memory leaks when the component unmounts or the URL changes.
    return () => {
      if (finalVideoUrl) {
        URL.revokeObjectURL(finalVideoUrl);
      }
    };
  }, [finalVideoUrl]);


  const handleMergeModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings({
      ...settings,
      mergeMode: e.target.value as MergeMode,
    });
  };
  
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setVideoFiles(Array.from(e.target.files));
    } else {
      setVideoFiles([]);
    }
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAudioFile(e.target.files[0]);
    } else {
      setAudioFile(null);
    }
  };

  const handleExtraDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value === '' ? '' : parseInt(e.target.value, 10);
      if (value === '' || (value >= 0 && !isNaN(value))) {
        setSettings({ ...settings, extraDuration: value });
      }
  };

  const handleFixedDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value === '' ? '' : parseInt(e.target.value, 10);
      if (value === '' || (value > 0 && !isNaN(value))) {
        setSettings({ ...settings, fixedDuration: value });
      }
  };

  const selectedOptionExplanation = useMemo(() => {
    return MERGE_OPTIONS.find(option => option.value === settings.mergeMode)?.explanation || '';
  }, [settings.mergeMode]);

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (videoFiles.length === 0) {
      alert('Please select at least one video file before merging.');
      return;
    }
    
    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);
    if (finalVideoUrl) {
        URL.revokeObjectURL(finalVideoUrl);
    }
    setFinalVideoUrl(null);

    const formData = new FormData();
    formData.append('mergeMode', settings.mergeMode);
    formData.append('extraDuration', String(settings.extraDuration));
    formData.append('fixedDuration', String(settings.fixedDuration));

    if (audioFile) {
      formData.append('audioFile', audioFile);
    }
    videoFiles.forEach(file => {
      formData.append('videoFiles', file);
    });

    const webhookUrl = 'https://ffmpeg.launchn8n.com/webhook/74f044f6-10d2-481b-93c0-f9b14ecb9b37';

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Processing failed with status ${response.status}: ${errorText || 'No response from server.'}`);
      }

      const videoBlob = await response.blob();
      if (!videoBlob.type.startsWith('video/')) {
        throw new Error(`Unexpected response from server: The returned file is not a video (type: ${videoBlob.type}). Please check the webhook configuration.`);
      }

      setFinalVideoUrl(URL.createObjectURL(videoBlob));

    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            console.log('Request cancelled by user.');
            // We don't set an error message for user-initiated cancellations.
        } else {
            console.error('Submission Error:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleReset = () => {
    setSettings({
      mergeMode: MergeMode.MatchAudio,
      extraDuration: '',
      fixedDuration: '',
    });
    setVideoFiles([]);
    setAudioFile(null);
    setError(null);
    setFinalVideoUrl(null); // The useEffect cleanup will revoke the URL
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="w-full max-w-2xl">
        <div className="bg-black/30 backdrop-blur-2xl p-8 sm:p-12 rounded-2xl shadow-2xl shadow-black/40 border border-white/10">
          
          {finalVideoUrl ? (
            <div className="text-center transition-all duration-500 ease-in-out">
              <h2 className="text-3xl font-bold text-white mb-4">✅ Merge Successful!</h2>
              <p className="text-indigo-200 mb-6">Your video is ready. You can play it below or download it.</p>
              <div className="my-6 rounded-lg overflow-hidden border border-white/10 bg-black/20">
                <video src={finalVideoUrl} controls className="w-full h-auto" />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={finalVideoUrl}
                  download="merged-video.mp4"
                  className="w-full sm:w-auto text-lg flex items-center justify-center gap-2 font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-8 rounded-xl hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 transition-all duration-300 shadow-lg shadow-emerald-500/30 transform hover:scale-[1.02] active:scale-95"
                >
                  <span>⬇️</span> Download Video
                </a>
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto text-lg flex items-center justify-center gap-2 font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-8 rounded-xl hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all duration-300 shadow-lg shadow-indigo-500/30 transform hover:scale-[1.02] active:scale-95"
                >
                  <span>🔄</span> Start New Merge
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">🎬 Video-Audio Merge Settings</h1>
                <p className="text-indigo-200 mt-3 text-lg">Choose how you want to control the duration of merged video and audio.</p>
              </div>
              <form onSubmit={handleSubmit}>
                <fieldset disabled={isLoading} className="space-y-8 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <FileInput
                            id="video-upload"
                            label="Upload Videos"
                            accept="video/*"
                            file={videoFiles}
                            onChange={handleVideoFileChange}
                            multiple
                        />
                        <FileInput
                            id="audio-upload"
                            label="Upload Audio"
                            accept="audio/*"
                            file={audioFile}
                            onChange={handleAudioFileChange}
                        />
                    </div>

                    <SelectInput 
                      label="Select Merge Mode"
                      value={settings.mergeMode}
                      onChange={handleMergeModeChange}
                      options={MERGE_OPTIONS}
                      explanation={selectedOptionExplanation}
                    />

                    <div 
                      className={`transition-all duration-500 ease-in-out overflow-hidden ${settings.mergeMode === MergeMode.ExtendVideo ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      {settings.mergeMode === MergeMode.ExtendVideo && (
                        <NumberInput 
                          label="Extra Duration (seconds)"
                          value={settings.extraDuration}
                          onChange={handleExtraDurationChange}
                          placeholder="e.g., 15"
                        />
                      )}
                    </div>

                    <div 
                      className={`transition-all duration-500 ease-in-out overflow-hidden ${settings.mergeMode === MergeMode.FixedDuration ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      {settings.mergeMode === MergeMode.FixedDuration && (
                        <NumberInput 
                          label="Fixed Duration (seconds)"
                          value={settings.fixedDuration}
                          onChange={handleFixedDurationChange}
                          placeholder="e.g., 60"
                        />
                      )}
                    </div>
                </fieldset>

                <div className="pt-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="flex items-center text-lg font-semibold">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Processing...</span>
                            </div>
                            <span className="text-sm mt-2 text-indigo-200">This may take a minute, please wait.</span>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="mt-6 w-full sm:w-auto text-base font-semibold bg-red-600 text-white py-2 px-8 rounded-xl hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/50 transition-all duration-300 shadow-lg shadow-red-500/30"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            type="submit"
                            className="w-full text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all duration-300 shadow-lg shadow-indigo-500/30 transform hover:scale-[1.02] active:scale-95"
                        >
                            🚀 Merge Video & Audio
                        </button>
                    )}
                </div>
              </form>
              {error && (
                <div className="mt-6 p-4 bg-red-900/50 border border-red-500/50 text-red-200 rounded-lg text-center" role="alert">
                    <p className="font-semibold">An Error Occurred</p>
                    <p className="text-sm mt-1">{error}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;