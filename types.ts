
export enum MergeMode {
  MatchAudio = 'match_audio',
  ExtendVideo = 'extend_video',
  FixedDuration = 'fixed_duration',
  TrimAudio = 'trim_audio',
  LoopShorter = 'loop_shorter',
}

export interface MergeSettings {
  mergeMode: MergeMode;
  extraDuration: number | '';
  fixedDuration: number | '';
}

export interface MergeOption {
    value: MergeMode;
    label: string;
    explanation: string;
}
