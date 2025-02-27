type ChampionListProps = {
  className?: string;
};

const ChampionList = ({ className }: ChampionListProps) => {
  return (
    <div className={`${className}`}>
      <h2>Champions</h2>
    </div>
  );
};
export default ChampionList;
