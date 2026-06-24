let currentModel: { providerID: string; modelID: string } | null = null;

export function setModel(providerID: string, modelID: string): void {
  currentModel = { providerID, modelID };
}

export function getModel(): { providerID: string; modelID: string } | null {
  return currentModel;
}

export function getModelString(): string | null {
  if (!currentModel) return null;
  return `${currentModel.providerID}/${currentModel.modelID}`;
}

export function clearModel(): void {
  currentModel = null;
}
