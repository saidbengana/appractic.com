import React from 'react';

const Stats = () => {
  const stats = [
    {
      title: 'Total Posts',
      value: '156',
      change: '+12%',
      changeType: 'positive',
    },
    {
      title: 'Engagement Rate',
      value: '4.3%',
      change: '+0.8%',
      changeType: 'positive',
    },
    {
      title: 'Scheduled Posts',
      value: '23',
      change: '-2',
      changeType: 'neutral',
    },
    {
      title: 'Connected Accounts',
      value: '5',
      change: '+1',
      changeType: 'positive',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            <p
              className={
                'ml-2 text-sm font-medium ' +
                (stat.changeType === 'positive'
                  ? 'text-green-600'
                  : stat.changeType === 'negative'
                  ? 'text-red-600'
                  : 'text-gray-500')
              }
            >
              {stat.change}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stats;
