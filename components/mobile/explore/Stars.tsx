"use client";

type Props = {
  value: number;
  size?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
};

export default function Stars({
  value,
  size = 16,
  interactive = false,
  onChange,
}: Props) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((n) => {
        const filled = n <= Math.round(value);
        const star = (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? "#F5C518" : "none"}
            stroke={filled ? "#F5C518" : "#D9D9D9"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
          </svg>
        );

        if (!interactive) return <span key={n}>{star}</span>;

        return (
          <button
            key={n}
            type="button"
            aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
            onClick={() => onChange?.(n)}
            className="active:scale-90 transition-transform p-0.5"
          >
            {star}
          </button>
        );
      })}
    </div>
  );
}
