import React, { useState, useMemo } from 'react';
import { addDays, format, differenceInDays } from 'date-fns';
import { defaultSteps, defaultCeremonies } from '../data/processData';

const TimelineStep = ({ step, startDate, totalDuration }) => {
    const widthPercentage = (step.durationDays / totalDuration) * 100;

    return (
        <div
            className={`relative flex flex-col justify-center p-2 rounded-lg shadow-md transition-transform hover:scale-105 ${step.color} bg-opacity-20 border border-slate-200 backdrop-blur-sm`}
            style={{ width: `${widthPercentage}%`, minWidth: '120px', margin: '0 4px' }}
        >
            <div className="font-bold text-sm text-slate-900 truncate" title={step.name}>{step.name}</div>
            <div className="text-xs text-slate-600">{step.durationDays} Days</div>
            <div className="text-[10px] text-slate-500 mt-1">{format(startDate, 'MMM d')} - {format(addDays(startDate, step.durationDays), 'MMM d')}</div>
        </div>
    );
};

const TimelineCeremony = ({ ceremony, startDate, totalDuration }) => {
    const leftPercentage = (ceremony.relativeDay / totalDuration) * 100;

    return (
        <div
            className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center group cursor-pointer"
            style={{ left: `${leftPercentage}%`, zIndex: 10 }}
        >
            <div className="w-8 h-8 rounded-full bg-white border-2 border-purple-500 flex items-center justify-center text-lg shadow-lg group-hover:bg-purple-50 transition-colors">
                {ceremony.icon}
            </div>
            <div className="absolute top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-slate-900 text-xs px-2 py-1 rounded border border-slate-200 shadow-xl whitespace-nowrap z-20 pointer-events-none">
                <div className="font-bold">{ceremony.name}</div>
                <div>Day {ceremony.relativeDay} ({format(addDays(startDate, ceremony.relativeDay), 'MMM d')})</div>
            </div>
            <div className="h-24 w-px bg-purple-500/30 mt-1 dashed"></div>
        </div>
    );
};

const TimelineView = ({ startDate }) => {
    const [steps, setSteps] = useState(defaultSteps);

    // Calculate total duration to normalize widths
    const totalDuration = useMemo(() => {
        return steps.reduce((acc, step) => acc + step.durationDays, 0);
    }, [steps]);

    // Calculate generic end date
    const releaseEndDate = addDays(startDate, totalDuration);

    // Helper to calculate start date of a specific step
    const getStepStartDate = (index) => {
        let days = 0;
        for (let i = 0; i < index; i++) {
            days += steps[i].durationDays;
        }
        return addDays(startDate, days);
    };

    return (
        <div className="w-full overflow-x-auto p-6 bg-white rounded-2xl border border-slate-200 shadow-sm backdrop-blur-xl">
            <div className="flex justify-between items-end mb-8 text-slate-600">
                <div>
                    <h3 className="text-xl font-semibold text-slate-900">Release Timeline</h3>
                    <p className="text-sm opacity-70">Total Duration: {totalDuration} Days</p>
                </div>
                <div className="text-right">
                    <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">Launch Date Target</div>
                    <div className="text-2xl font-bold text-green-600">{format(releaseEndDate, 'MMMM do, yyyy')}</div>
                </div>
            </div>

            <div className="relative pt-10 pb-20 mt-4 min-w-[800px]">
                {/* Ceremonies Layer */}
                <div className="absolute top-0 left-0 right-0 h-full pointer-events-none">
                    {defaultCeremonies.map(ceremony => (
                        <TimelineCeremony
                            key={ceremony.id}
                            ceremony={ceremony}
                            startDate={startDate}
                            totalDuration={totalDuration}
                        />
                    ))}
                </div>

                {/* Steps Layer */}
                <div className="flex w-full items-stretch h-32 relative z-0">
                    {steps.map((step, index) => (
                        <TimelineStep
                            key={step.id}
                            step={step}
                            startDate={getStepStartDate(index)}
                            totalDuration={totalDuration}
                        />
                    ))}
                </div>

                {/* X-Axis / Time Markers */}
                <div className="w-full border-t border-slate-200 mt-2 flex justify-between text-xs text-slate-500 pt-2">
                    <span>{format(startDate, 'MMM d')}</span>
                    <span>{format(addDays(startDate, totalDuration / 2), 'MMM d')}</span>
                    <span>{format(releaseEndDate, 'MMM d')}</span>
                </div>
            </div>
        </div>
    );
};

export default TimelineView;
