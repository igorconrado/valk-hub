function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

const hues = [210, 260, 330, 160, 30, 190, 280, 350];

function getColorFromName(name: string) {
  const idx = Math.abs(hashCode(name)) % hues.length;
  const hue = hues[idx];
  return {
    bg: `hsla(${hue}, 50%, 50%, 0.15)`,
    text: `hsla(${hue}, 40%, 60%, 1)`,
  };
}

type ProjectLogoProps = {
  name: string;
  logoUrl: string | null;
  size?: number;
  fontSize?: number;
};

export function ProjectLogo({
  name,
  logoUrl,
  size = 40,
  fontSize = 16,
}: ProjectLogoProps) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className="shrink-0 rounded-lg border border-[#1A1A1A] object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  const color = getColorFromName(name);
  const letter = name.charAt(0).toUpperCase();

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-lg font-display font-semibold"
      style={{
        width: size,
        height: size,
        backgroundColor: color.bg,
        color: color.text,
        fontSize,
      }}
    >
      {letter}
    </div>
  );
}
