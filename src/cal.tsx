//import React, {useState, useEffect} from 'react';
import React, {useState} from 'react';
import moment from 'moment';
import * as _ from 'lodash';
import * as util from './util';
import {DateDb, Parser, ParserRule, ParserError} from './parser';

/* export function Example() {
 *     // const [count, setCount] = useState(0);
 *     return <>
 *         <p>Hello Example</p>
 *         <p>{moment.locale()} </p>
 *     </>
 * } */

export interface MonthParams {
    year: number,
    month: number,
    dateDb: DateDb,
}
export function Month({year, month, dateDb}: MonthParams) {
    const dayHeader = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map( (d, i) =>
        <div key={i} className="day-header">
            {d}
        </div>
    )

    const firstDayOfTheMonth = new Date(year, month, 1);

    let days = _.range(1, util.getDaysInMonth(year, month) + 1);
    const gaps = new Array<number>(firstDayOfTheMonth.getDay());
    _.fill(gaps, -1);
    days = gaps.concat(days);

    const rows = _.chunk(days, 7);

    const renderedDays = rows.map( (row, i) => {
        return [
            <div key={i} className="row">
            {
                row.map( (cell: number, j: number) => {
                    let renderedCell = (<div key={j} className={'gap'}></div>);
                    if (cell >= 0) {
                        let cls = 'day';
                        let date = moment([year, month, cell]);
                        if (!dateDb.isEnabled(date)) {
                            cls =  cls + " excluded";
                        }
                        renderedCell = (<div key={j} className={cls}>{cell}</div>);
                    }
                    return renderedCell;
                })
            }
            </div>
        ];
    });

    return (
        <div>
            <div className="month-header">
                <div className="month-name">
                  {util.monthName(year, month)} {year}
                </div>
                {dayHeader}
            </div>
            <div className="day-container">
                {renderedDays}
            </div>
        </div>
    )
}

export function Calendar({dateDb}: {dateDb: DateDb}) {
    const [start, end] = dateDb.getDateRange();
    const months = util.monthRange(start, end);

    return (
        <div className="cal-container">
            {
                months.map( (m, i) => {
                    return (
                        <div key={m.toString()} className="month">
                            <Month year={m.get('year')} month={m.get('month')} dateDb={dateDb} />
                        </div>
                    )
                })
            }
        </div>
    )
}

export interface NewRuleNotifier {
    notifyNewRules(rule: ParserRule[]): void
}

export function Editor({dateDb, newRuleNotifier}: {dateDb: DateDb, newRuleNotifier: NewRuleNotifier}) {
    const [text, setText] = useState("");
    const [errors, setErrors] = useState(new Array<ParserError>());

    function onChange(e: React.FormEvent<HTMLTextAreaElement>) {
        console.log("Editor:onChange");
        setText(e.currentTarget.value);
    }

    function update() {
        console.log("Editor:update");
        const parser = new Parser();
        let [rules, errors] = parser.parse(text);

        if (errors.length > 0) {
            console.log("Parser errors: ", errors);
            setErrors(errors);
        } else {
            setErrors([]);
            newRuleNotifier.notifyNewRules(rules);
        }
    }

    let errorPartial = null;
    if (errors.length > 0) {
        errorPartial = (
            <div className="errors">
                {
                    errors.map((e: ParserError) => {
                        return (
                            <>
                                <div className="error-line">
                                    {e.line}
                                </div>
                                <div className="error-message">
                                    {e.error}
                                </div>
                            </>
                        );
                    })
                }
            </div>
        )
    }

    return (
        <div className="editor">
            <textarea rows={15} cols={120}
                onChange={onChange}>
            </textarea>
            <div>
                <button onClick={update}>Update</button>
            </div>
            {errorPartial}
        </div>
    )
}

export function People({people, selectedPerson, notifySelectPerson}: {people: string[], selectedPerson: string | null, notifySelectPerson: Function}) {
    return (
        <div className="people">
            {
                people.map((p) => {
                    return (<PersonButton key={p} name={p} selectedPerson={selectedPerson} notifySelectPerson={notifySelectPerson} />);
                })
            }
        </div>
    )
}

function PersonButton({name, selectedPerson, notifySelectPerson}: {name: string, selectedPerson: string | null, notifySelectPerson: Function}) {
    function onClick() {
        notifySelectPerson(name);
    }

    let className = "person";
    if (name === selectedPerson) {
        className = "person selected";
    }
    return (<button key={name} className={className} onClick={onClick}>{name}</button>);
}