interface AvatarUsuarioProps {
  nome: string;
  fotoUrl?: string;
  className?: string;
}

export default function AvatarUsuario({
  nome,
  fotoUrl,
  className = "h-10 w-10",
}: AvatarUsuarioProps) {
  const iniciais = nome
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toLocaleUpperCase() || "?";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#130e30]/15 bg-[#ffe228] font-sans font-bold text-[#130e30] ${className}`}
    >
      {fotoUrl ? (
        <img src={fotoUrl} alt={`Foto de perfil de ${nome}`} className="h-full w-full object-cover" />
      ) : (
        <span aria-label={`Iniciais de ${nome}`}>{iniciais}</span>
      )}
    </span>
  );
}
