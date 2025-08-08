import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function WhaleActivityChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Import Chart.js dynamically
    import('chart.js/auto').then((Chart) => {
      const ctx = chartRef.current!.getContext('2d');
      
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart.default(ctx!, {
        type: 'line',
        data: {
          labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
          datasets: [
            {
              label: 'Whale Buys',
              data: [12, 19, 8, 15, 25, 18, 22],
              borderColor: 'hsl(160, 100%, 41%)', // accent-green
              backgroundColor: 'hsla(160, 100%, 41%, 0.1)',
              tension: 0.4,
              fill: true,
            },
            {
              label: 'Whale Sells',
              data: [8, 11, 13, 7, 12, 16, 9],
              borderColor: 'hsl(12, 100%, 60%)', // accent-orange
              backgroundColor: 'hsla(12, 100%, 60%, 0.1)',
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: 'hsl(240, 11%, 64%)', // text-secondary
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: 'hsl(240, 11%, 64%)', // text-secondary
              },
              grid: {
                color: 'hsla(240, 11%, 64%, 0.1)',
              },
            },
            x: {
              ticks: {
                color: 'hsl(240, 11%, 64%)', // text-secondary
              },
              grid: {
                color: 'hsla(240, 11%, 64%, 0.1)',
              },
            },
          },
        },
      });
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <Card className="bg-navy-main border-navy-light">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">Whale Activity (24h)</CardTitle>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              className="px-3 py-1 bg-accent-green bg-opacity-10 text-accent-green hover:bg-opacity-20"
            >
              1D
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              className="px-3 py-1 text-text-secondary hover:bg-navy-light"
            >
              7D
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              className="px-3 py-1 text-text-secondary hover:bg-navy-light"
            >
              30D
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <canvas ref={chartRef} className="w-full h-full"></canvas>
        </div>
      </CardContent>
    </Card>
  );
}
