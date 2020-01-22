import moment, { Moment } from 'moment';
import * as util from './util';

export class DateDb {
    dates = new Map<string, boolean>();
    min: moment.Moment | null = null;
    max: moment.Moment | null = null;

    init(start: moment.Moment, end: moment.Moment) {
        this.reset();
        this.setRange(start, end, true);
    }

    getDateRange(): [moment.Moment | null, moment.Moment | null] {
        return [this.min, this.max]
    }

    isEnabled(date: moment.Moment): boolean {
        let key = this.mapKey(date);
        let val = this.dates.get(key);
        return val === true;
    }

    set(date: moment.Moment, enable: boolean, weekdays: Set<number> | null = null) {
        if (this.min == null || date.isBefore(this.min)) {
            this.min = date.clone();
        }
        if (this.max == null || date.isAfter(this.max)) {
            this.max = date.clone();
        }

        let key = this.mapKey(date);
        if (weekdays === null) {
            this.dates.set(key, enable);
        }
        else {
            if (weekdays.has(date.weekday())) {
                this.dates.set(key, enable);
            }
        }
    }

    setRange(start: moment.Moment, end: moment.Moment, enable: boolean, weekdays: Set<number> | null = null) {
        util.scanMomentRange('day', start, end, (m) => {
            this.set(m, enable, weekdays);
        });

    }

    reset() {
        this.dates = new Map<string, boolean>();
        this.min = null;
        this.max = null;
    }

    applyParserRule(rule: ParserRule) {
        console.log("Applying include rule: ", rule);
        this.setRange(rule.start, rule.end, rule.include, rule.weekdays.size > 0 ? rule.weekdays : null);
    }

    private mapKey(m: moment.Moment): string {
        return util.dateToString(m);
    }
}



export class ParserRule {
    constructor(public name: string, public include: boolean, public start: moment.Moment, public end: moment.Moment, public weekdays: Set<number>) {
    }
}

export class ParserError {
    constructor(public line: string, public error: string) {
    }
}

export class Parser {
    parse(text: string): [Array<ParserRule>,  Array<ParserError>] {
        // Split lines
        const lines = text.split(/\r?\n/);
        const rules = new Array<ParserRule>();
        const errors = new Array<ParserError>();
        for (let l of lines) {
            const line = l.trim();
            if (line.length > 0) {
                const result = this.parseLine(line);
                if (result instanceof ParserRule) {
                    const rule = result as ParserRule;
                    rules.push(rule);
                } else if (result instanceof ParserError) {
                    const error = result as ParserError;
                    errors.push(error);
                }
            }
        }
        return [rules, errors];
    }

    private parseLine(line: string): ParserRule | ParserError {
        const tokens = line.split(/[\t ]+/);

        if (tokens.length < 4) {
            return new ParserError(line, "Too few tokens")
        }

        const [name, operation, start, end, days] = tokens

        let include = false;
        switch (operation) {
            case "include": include = true;
                break;
            case "exclude": include = false;
                break;
            default: return new ParserError(line, "The second token must be 'include' or 'exclude'. Found '" + operation + "'");
        }

        // parse dates
        const mStart = moment(start);
        if (!mStart.isValid()) {
            return new ParserError(line, `Invalid start date: ${start}`);
        }
        const mEnd = moment(end);
        if (!mEnd.isValid()) {
            return new ParserError(line, `Invalid end date: ${end}`);
        }

        // parse weekdays
        const daySet = new Set<number>();
        if (days) {
            for (let i = 0; i < days.length; i++) {
                switch(days[i].toLowerCase()) {
                    case "o":
                    case "0":
                        daySet.add(i);
                        break;
                }
            }
        }

        const rule = new ParserRule(name, include, mStart,  mEnd, daySet);
        return rule;
    }
}
