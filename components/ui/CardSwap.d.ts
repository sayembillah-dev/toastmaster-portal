import { ReactNode, CSSProperties, ForwardRefExoticComponent, RefAttributes } from 'react';

interface CardProps {
  children?: ReactNode;
  customClass?: string;
  className?: string;
  style?: CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

interface CardSwapProps {
  width?: number | string;
  height?: number | string;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  onCardClick?: (idx: number) => void;
  skewAmount?: number;
  easing?: 'linear' | 'elastic';
  children: ReactNode;
}

export const Card: ForwardRefExoticComponent<CardProps & RefAttributes<HTMLDivElement>>;
declare const CardSwap: (props: CardSwapProps) => JSX.Element;
export default CardSwap;
