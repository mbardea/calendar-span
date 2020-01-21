import moment from 'moment';

export function dateToString(from: moment.Moment): string {
    return from.format("YYYYMMDD");
}

export function monthName(year: number, month: number): string {
    const refDate = new Date(year, month, 1);
    const m = moment(refDate);
    return m.format('MMMM');
}

export function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

export function monthRange(start: moment.Moment | null, end: moment.Moment | null): Array<moment.Moment> {
    const range = new Array<moment.Moment>();
    if (start === null || end === null) {
        return range;
    }

    const actualStart = start.clone().startOf('month');
    const actualEnd = end.clone().startOf('month');
    scanMomentRange('month', actualStart, actualEnd, (m) => {
        range.push(m.clone());
    });
    return range;
}

export type MomentDateCallback = (m: moment.Moment) => void

export type MomentStepType = 'day' | 'month' | 'year';

export function scanMomentRange(step: MomentStepType, start: moment.Moment | null, end: moment.Moment | null, func: MomentDateCallback) {
    if (start === null || end === null) {
        return;
    }

    let m = start.clone();
    while (m.isSameOrBefore(end)) {
        func(m);
        m.add(1, step)
    }
}
