import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  photoUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
};

const PIXEL_SIZES = { sm: 32, md: 40, lg: 64 };

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function cloudinaryAvatar(url: string, size: number) {
  return url.replace("/upload/", `/upload/w_${size},h_${size},c_fill,g_face/`);
}

const COLORS = [
  "bg-red-500", "bg-orange-500", "bg-amber-500",
  "bg-green-600", "bg-teal-600", "bg-blue-600",
  "bg-indigo-600", "bg-purple-600", "bg-pink-600",
];

function colorForName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function MemberAvatar({ name, photoUrl, size = "md", className }: AvatarProps) {
  const sizeClass = SIZES[size];
  const px = PIXEL_SIZES[size];

  if (photoUrl) {
    const src = cloudinaryAvatar(photoUrl, px * 2);
    return (
      <img
        src={src}
        alt={name}
        width={px}
        height={px}
        className={cn("rounded-full object-cover shrink-0", sizeClass, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center text-white font-semibold shrink-0",
        sizeClass,
        colorForName(name),
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}
