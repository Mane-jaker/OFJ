import { Container } from "@/components/layout/Container";

export default function HomePage() {
  return (
    <Container variant="landing" className="py-20 text-center">
      <h1 className="text-3xl font-bold">Dashboard — próximamente</h1>
      <p className="mt-4 text-[var(--color-muted)]">
        Acá vas a poder gestionar tu búsqueda laboral.
      </p>
    </Container>
  );
}
