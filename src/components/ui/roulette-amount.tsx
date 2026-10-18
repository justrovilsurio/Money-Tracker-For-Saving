import type { CSSProperties } from "react";

type RouletteAmountProps = {
  value: string;
};

const digits = Array.from({ length: 10 }, (_, digit) => digit);

export function RouletteAmount({ value }: RouletteAmountProps) {
  const characters = Array.from(value);
  const digitCount = characters.filter((character) => /\d/.test(character)).length;
  let digitIndex = 0;

  if (digitCount === 0) {
    return <>{value}</>;
  }

  return (
    <span className="roulette-amount">
      <span className="sr-only">{value}</span>
      <span className="roulette-amount-track" aria-hidden="true">
        {characters.map((character, index) => {
          if (!/\d/.test(character)) {
            return <span key={`${character}-${index}`}>{character}</span>;
          }

          const currentDigitIndex = digitIndex;
          digitIndex += 1;
          const targetIndex = Number(character) + 10;
          const style = {
            "--roulette-position": `${-(targetIndex / 20) * 100}%`,
            "--roulette-delay": `${(digitCount - currentDigitIndex - 1) * 32}ms`,
          } as CSSProperties;

          return (
            <span className="roulette-digit-window" key={`digit-${index}`}>
              <span className="roulette-digit-strip" style={style}>
                {[...digits, ...digits].map((digit, stripIndex) => (
                  <span className="roulette-digit" key={`${stripIndex}-${digit}`}>{digit}</span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
