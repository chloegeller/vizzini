import {JsPsych, JsPsychPlugin, ParameterType, TrialType} from "jspsych";
// @ts-ignore
import React from "react";
import ReactDOM from "react-dom";
import ReactDOMClient from "react-dom/client"
import ReactDOMExtension from "../extensions/react";

const info = <const>{
    name: "consent",
    parameters: {
        component: {
            type: ParameterType.FUNCTION,
            required: true,
        },
        redirect_url: {
            type: ParameterType.STRING,
            required: true,
        },
    },
};

type Info = typeof info;

class ConsentPlugin implements JsPsychPlugin<Info> {
    static info = info;

    constructor(private jsPsych: JsPsych) {
        this.jsPsych = jsPsych;
    }

    trial(container: HTMLElement, trial: TrialType<Info>) {
        this.jsPsych.extensions.react.render(
            trial.component, {trial}
        )

        let nextBtn = document.getElementById("consent-agree");
        nextBtn.addEventListener("click", () => {
            this.jsPsych.pluginAPI.clearAllTimeouts();
            this.jsPsych.finishTrial({
                consent: true,
            });
        });

        let failBtn = document.getElementById("consent-disagree");
        failBtn.addEventListener("click", () => {
            alert("You must consent to complete this study.");
        });
    }

    accept() {
        const data = {
            consent: true,
        };
        this.jsPsych.pluginAPI.clearAllTimeouts();
        this.jsPsych.finishTrial(data);
    }
}

export default ConsentPlugin;
