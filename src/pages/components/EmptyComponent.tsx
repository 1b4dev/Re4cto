import { memo } from "react";

interface EmptyComponentProps {
  title?: string;
  text: string;
  spacing?: string;
  titleSpacing?: string;
  textSpacing?: string;
}

const EmptyComponent = ({ title, text, spacing = "mx-5", titleSpacing = "", textSpacing = "" }: EmptyComponentProps) => (
  <div className={`d-flex flex-column flex-fill text-center ${spacing}`} aria-label={title}>
    {title && (
      <h4 className={`text-muted mb-2 ${titleSpacing}`}>{title}</h4>
    )}
    <p className={`text-muted opacity-75 ${textSpacing}`}>{text}</p>
  </div>
);

EmptyComponent.displayName = 'EmptyComponent';

export default memo(EmptyComponent);