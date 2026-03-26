import { useMemo, useCallback } from 'react';

interface Props {
  year: number;
  month: number;
  onDayClick?: (date: Date) => void;
  movementsData?: Record<string, any>;
  holidays?: Record<string, string>;
}

const MonthCalendar: React.FC<Props> = ({
  year,
  month,
  onDayClick,
  movementsData = {},
  holidays = {},
}) => {

  const days = useMemo(() => {
    const result: any[] = [];

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const key = date.toISOString().split('T')[0];

      result.push({
        date,
        movements: movementsData[key],
        holiday: holidays[key],
      });
    }

    return result;
  }, [year, month, movementsData, holidays]);

  const handleClick = useCallback((date: Date) => {
    onDayClick?.(date);
  }, [onDayClick]);

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((d, i) => (
        <div
          key={i}
          onClick={() => handleClick(d.date)}
          className="p-2 border rounded cursor-pointer hover:bg-gray-100"
        >
          <div className="text-sm">{d.date.getDate()}</div>

          {d.holiday && (
            <div className="text-xs text-red-500">{d.holiday}</div>
          )}

          {d.movements && (
            <div className="text-xs mt-1">
              {d.movements.falta && <div>F: {d.movements.falta}</div>}
              {d.movements.horaExtra && <div>HE: {d.movements.horaExtra}</div>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MonthCalendar;