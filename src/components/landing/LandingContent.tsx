"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { UploadZone } from "@/components/landing/UploadZone";
import { uploadCv } from "@/server/profile/actions";

export function LandingContent() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    const fd = new FormData();
    fd.append("file", selectedFile);

    try {
      const result = await uploadCv(fd);
      if (result?.error) {
        setError(result.error);
        setIsProcessing(false);
        return;
      }
      router.push("/home");
    } catch {
      setError(
        "No se pudo leer el CV. Intentá con otro archivo o completá manualmente",
      );
      setIsProcessing(false);
    }
  }

  return (
    <Container variant="landing" className="flex flex-col items-center py-20">
      <h1 className="max-w-2xl text-center text-2xl font-medium leading-relaxed text-[var(--color-fg)] sm:text-3xl">
        Buscá los empleos que mejor se acoplen a tu perfil y los más actuales a
        día de hoy donde aún tenés oportunidad de postularte y no quedar fuera
      </h1>

      <div className="mt-12 w-full max-w-lg">
        <UploadZone
          onFileSelected={(file) => setSelectedFile(file)}
          selectedFile={selectedFile}
        />
      </div>

      <button
        onClick={handleContinue}
        disabled={!selectedFile || isProcessing}
        className="mt-8 w-full max-w-lg rounded-[10px] bg-[var(--color-accent)] px-6 py-3 text-base font-medium text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
      >
        {isProcessing ? "Extrayendo datos de tu CV..." : "Continuar"}
      </button>

      {error && (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </Container>
  );
}
