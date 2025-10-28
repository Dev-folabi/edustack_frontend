// src/components/finance/SummaryCard.tsx
interface SummaryCardProps {
  title: string;
  value: string | number;
}

const SummaryCard = ({ title, value }: SummaryCardProps) => {
  return (
    <div>
      <h2>{title}</h2>
      <p>{value}</p>
    </div>
  );
};

export default SummaryCard;
