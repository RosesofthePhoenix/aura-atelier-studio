export type AuraVaultStatus = "nueva" | "en_lectura" | "tejiendo" | "completada";

export type AuraAssetType = "voice" | "photo";

export interface InitiationAnswer {
  id: string;
  label: string;
  value: string;
}

export interface InitiationAsset {
  id: string;
  questionId: string;
  type: AuraAssetType;
  storagePath: string;
  mimeType: string;
  durationSeconds?: number | null;
  createdAt?: string;
}

export interface AuraInitiationRecord {
  id: string;
  user_id: string;
  email: string;
  instagram_handle: string | null;
  answers: InitiationAnswer[];
  status: AuraVaultStatus;
  piece_recommendation: string | null;
  energy_intensity: number | null;
  draft: boolean;
  completion_ratio: number;
  last_step: number;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

