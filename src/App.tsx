import React, {useState} from 'react';
import './App.css';
// import * as _ from 'lodash';
import moment from 'moment';

import {Calendar, People, Editor} from './cal';
import {DateDb, ParserRule} from './parser';
import {scanMomentRange} from "./util";

export const App2: React.FC = () => {
    const [dateDb, setDateDb] = useState(new DateDb());
    const [rules, setRules] = useState(new Array<ParserRule>());
    const [people, setPeople] = useState(new Set<string>());
    const [selectedPerson, setSelectedPerson] = useState("");
    const [selectedPersonDays, setSelectedPersonDays] = useState<number | null>(null);

    function notifyNewRules(rules: ParserRule[]) {
        dateDb.reset();

        // Extract people
        const people = new Set<string>();
        for (let rule of rules) {
            people.add(rule.name);
        }

        setPeople(people);
        setRules(rules);
        setDateDb(dateDb);

        notifySelectPerson("all");
    }

    function applyRules(rules: ParserRule[], name: string) {
        for (let rule of rules) {
            if (rule.name === "all" || rule.name === name) {
                console.log("Applying rule: ", rule);
                dateDb.applyParserRule(rule);
            }
        }
    }

    function notifySelectPerson(name: string) {
        dateDb.reset();
        applyRules(rules, name);

        const [start, end] = dateDb.getDateRange();
        let count = 0;
        scanMomentRange('day', start, end, (d) => {
           if (dateDb.isEnabled(d)) {
               count++;
           }
        });


        setSelectedPerson(name);
        setSelectedPersonDays(count);
        setDateDb(dateDb);
    }


    return (
        <div className="App">
            <header className="App-header">
                <Editor dateDb={dateDb} newRuleNotifier={notifyNewRules} />
                <People people={Array.from(people.values())} selectedPerson={selectedPerson} notifySelectPerson={notifySelectPerson} />
                <div className="days">{selectedPersonDays}{selectedPersonDays ? ' days' : ''}</div>
                <Calendar dateDb={dateDb} />
            </header>
        </div>
    )
}

export default App2;

/////////////////////////////////////////////////

interface AppProps {
}

interface AppState {
    dateDb: DateDb;
    rules: ParserRule[];
    people: Set<string>;
    selectedPerson: string | null;
    selectedPersonDays: number | null;
}

export class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        const initialState = {
            dateDb: new DateDb(),
            rules: new Array<ParserRule>(),
            people: new Set<string>(),
            selectedPerson: null,
            selectedPersonDays: null,
        }
        this.state = initialState;
        this.notifyNewRules = this.notifyNewRules.bind(this);
        this.notifySelectPerson = this.notifySelectPerson.bind(this);
    }

    componentDidMount() {
        // Temporary rule
        const start="2020-05-20";
        const end="2020-06-05";
        const rule = new ParserRule("Example", true, moment(start), moment(end), new Set([0, 1, 2, 3, 4, 5, 6]));
        this.state.dateDb.applyParserRule(rule);
        this.setState({
            rules: [rule],
        })
    }

    notifyNewRules(rules: ParserRule[]) {
        const {dateDb} = this.state;
        dateDb.reset();

        // Extract people
        const people = new Set<string>();
        for (let rule of rules) {
            people.add(rule.name);
        }

        this.setState({
            people: people,
            rules: rules,
            dateDb: dateDb,
        });

        this.notifySelectPerson("all");
    }

    applyRules(rules: ParserRule[], name: string) {
        for (let rule of rules) {
            if (rule.name === "all" || rule.name === name) {
                console.log("Applying rule: ", rule);
                this.state.dateDb.applyParserRule(rule);
            }
        }
    }

    notifySelectPerson(name: string) {
        const {rules, dateDb} = this.state;

        dateDb.reset();
        this.applyRules(rules, name);

        const [start, end] = dateDb.getDateRange();
        let count = 0;
        scanMomentRange('day', start, end, (d) => {
           if (dateDb.isEnabled(d)) {
               count++;
           }
        });

        this.setState({
            selectedPerson: name,
            selectedPersonDays: count
        });
    }

    render() {
        const {dateDb, people, selectedPerson, selectedPersonDays} = this.state;
        return (
            <div className="App">
                <header className="App-header">
                    <Editor dateDb={dateDb} newRuleNotifier={this.notifyNewRules} />
                    <People people={Array.from(people.values())} selectedPerson={selectedPerson} notifySelectPerson={this.notifySelectPerson}/>
                    <div className="days">{selectedPersonDays}{selectedPersonDays ? ' days' : ''}</div>
                    <Calendar dateDb={dateDb} />
                </header>
            </div>
        )
    }
}

// export default App;