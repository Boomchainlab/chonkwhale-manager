interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  iconColor: string;
}

export default function MetricCard({ title, value, change, changeType, icon, iconColor }: MetricCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-accent-green';
      case 'negative': return 'text-red-400';
      default: return 'text-text-secondary';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive': return 'fas fa-arrow-up';
      case 'negative': return 'fas fa-arrow-down';
      default: return 'fas fa-bell';
    }
  };

  return (
    <div className="bg-navy-main border border-navy-light rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-secondary text-sm">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          <p className={`text-sm mt-1 ${getChangeColor()}`}>
            <i className={`${getChangeIcon()} mr-1`}></i>
            {change}
          </p>
        </div>
        <div className={`w-12 h-12 bg-${iconColor} bg-opacity-10 rounded-lg flex items-center justify-center`}>
          <i className={`fas fa-${icon} text-${iconColor} text-xl`}></i>
        </div>
      </div>
    </div>
  );
}
